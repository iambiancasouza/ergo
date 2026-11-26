-- =============================================================================
-- Ergo · schema inicial
--
-- Tabelas: profiles, topics, questions, sessions, attempts, review_schedule.
-- Toda tabela nasce com RLS ativo e policies nesta mesma migração.
--
-- Convenções:
-- - Nomes em snake_case (o Postgres converte para minúsculas tudo sem aspas);
--   o app converte para camelCase em src/services.
-- - Policies usam (select auth.uid()) em vez de auth.uid(): o Postgres calcula
--   uma vez por consulta, não uma vez por linha (recomendação do Supabase).
-- - Permissões (GRANT) explícitas: o papel anon (visitante sem login) não
--   acessa nada; authenticated só faz o que cada tabela precisa.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Função utilitária: mantém updated_at atualizado em todo UPDATE.
-- -----------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- -----------------------------------------------------------------------------
-- profiles: uma linha por usuário, criada automaticamente no cadastro.
-- -----------------------------------------------------------------------------
create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  display_name   text check (char_length(display_name) between 1 and 80),
  timezone       text not null default 'America/Sao_Paulo',
  -- Meta de tempo por questão; o cronômetro aceita até 30 min (1800 s).
  target_seconds integer not null default 90 check (target_seconds between 10 and 1800),
  created_at     timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada pessoa lê e edita só o próprio perfil. Não há policy de insert nem de
-- delete: a linha é criada pelo gatilho abaixo e some junto com o usuário.
create policy "profiles: ler o próprio"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: editar o próprio"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Cria o perfil quando alguém se cadastra (e-mail ou Google).
-- security definer: roda com permissão do dono da função, porque quem se
-- cadastra ainda não tem permissão de inserir em profiles.
-- search_path vazio + nomes qualificados (public.x): impede que alguém crie
-- uma tabela com o mesmo nome em outro schema e "sequestre" a função.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  requested_timezone text := meta ->> 'timezone';
begin
  insert into public.profiles (id, display_name, timezone)
  values (
    new.id,
    -- display_name: enviado no cadastro por e-mail; full_name/name: vêm do Google.
    nullif(left(trim(coalesce(meta ->> 'display_name', meta ->> 'full_name', meta ->> 'name')), 80), ''),
    -- Só aceita o fuso enviado pelo navegador se o Postgres o conhecer.
    case
      when requested_timezone is not null
       and exists (select 1 from pg_catalog.pg_timezone_names where name = requested_timezone)
      then requested_timezone
      else 'America/Sao_Paulo'
    end
  );
  return new;
end;
$$;

-- Ninguém chama essa função diretamente; só o gatilho.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- -----------------------------------------------------------------------------
-- topics: os temas (um por arquivo em content/questions/).
-- -----------------------------------------------------------------------------
create table public.topics (
  id         bigint generated always as identity primary key,
  -- O slug é o nome do arquivo, em camelCase (ex.: associacaoLogica).
  slug       text not null unique check (slug ~ '^[a-z][a-zA-Z0-9]*$'),
  name       text not null check (char_length(name) between 1 and 80),
  sort_order integer not null default 0
);

alter table public.topics enable row level security;

create policy "topics: leitura para quem está logado"
  on public.topics for select to authenticated
  using (true);


-- -----------------------------------------------------------------------------
-- questions: o banco de questões. O id é o do arquivo JSON (ex.: assoc-01),
-- para o seed fazer upsert por id.
-- -----------------------------------------------------------------------------
create table public.questions (
  id            text primary key check (char_length(id) between 1 and 40),
  topic_id      bigint not null references public.topics (id) on delete restrict,
  statement     text not null,
  premises      text[],
  prompt        text not null,
  options       text[] not null check (array_length(options, 1) = 5),
  correct_index smallint not null check (correct_index between 0 and 4),
  explanation   text not null,
  difficulty    smallint not null check (difficulty between 1 and 3),
  active        boolean not null default true
);

-- Busca de questões ativas por tema (treino por tema e treino do dia).
create index questions_topic_id_active_idx on public.questions (topic_id) where active;

alter table public.questions enable row level security;

create policy "questions: leitura para quem está logado"
  on public.questions for select to authenticated
  using (true);


-- -----------------------------------------------------------------------------
-- sessions: cada treino (do dia, por tema ou de revisão).
-- -----------------------------------------------------------------------------
create table public.sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind        text not null check (kind in ('daily', 'topic', 'review')),
  topic_id    bigint references public.topics (id) on delete restrict,
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  -- Treino por tema exige tema; treino do dia e revisão não têm tema.
  constraint sessions_topic_matches_kind check ((kind = 'topic') = (topic_id is not null)),
  constraint sessions_finished_after_start check (finished_at is null or finished_at >= started_at),
  -- Alvo da chave estrangeira composta de attempts (ver abaixo).
  constraint sessions_id_user_id_key unique (id, user_id)
);

create index sessions_user_id_started_at_idx on public.sessions (user_id, started_at desc);
create index sessions_topic_id_idx on public.sessions (topic_id);

alter table public.sessions enable row level security;

create policy "sessions: ler as próprias"
  on public.sessions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "sessions: criar as próprias"
  on public.sessions for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Update serve para registrar finished_at.
create policy "sessions: editar as próprias"
  on public.sessions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);


-- -----------------------------------------------------------------------------
-- attempts: cada resposta. Histórico imutável: só insert e select.
-- -----------------------------------------------------------------------------
create table public.attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_id   uuid not null,
  question_id  text not null references public.questions (id) on delete restrict,
  chosen_index smallint not null check (chosen_index between 0 and 4),
  is_correct   boolean not null,
  time_ms      integer not null check (time_ms > 0),
  answered_at  timestamptz not null default now(),
  -- Chave composta: a sessão precisa ser do mesmo usuário da tentativa.
  -- Sem isso, alguém poderia gravar tentativas na sessão de outra pessoa.
  constraint attempts_session_fkey
    foreign key (session_id, user_id) references public.sessions (id, user_id) on delete cascade,
  -- Nunca repete questão dentro da mesma sessão.
  constraint attempts_session_question_key unique (session_id, question_id)
);

-- Estatísticas e "últimas 30 tentativas" (por data) e histórico por questão.
create index attempts_user_id_answered_at_idx on public.attempts (user_id, answered_at desc);
create index attempts_user_id_question_id_idx on public.attempts (user_id, question_id);
-- Índices das chaves estrangeiras que não começam outro índice.
create index attempts_question_id_idx on public.attempts (question_id);
create index attempts_session_id_user_id_idx on public.attempts (session_id, user_id);

alter table public.attempts enable row level security;

create policy "attempts: ler as próprias"
  on public.attempts for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "attempts: criar as próprias"
  on public.attempts for insert to authenticated
  with check ((select auth.uid()) = user_id);


-- -----------------------------------------------------------------------------
-- review_schedule: revisão espaçada (caixas de Leitner), uma linha por
-- usuário + questão.
-- -----------------------------------------------------------------------------
create table public.review_schedule (
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question_id text not null references public.questions (id) on delete cascade,
  box         smallint not null default 0 check (box between 0 and 4),
  -- Dia local do usuário (fuso de profiles.timezone), não um instante.
  due_date    date not null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- Revisões vencidas do usuário, as mais atrasadas primeiro.
create index review_schedule_user_id_due_date_idx on public.review_schedule (user_id, due_date);
create index review_schedule_question_id_idx on public.review_schedule (question_id);

create trigger review_schedule_set_updated_at
  before update on public.review_schedule
  for each row execute function public.set_updated_at();

alter table public.review_schedule enable row level security;

create policy "review_schedule: ler as próprias"
  on public.review_schedule for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "review_schedule: criar as próprias"
  on public.review_schedule for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "review_schedule: editar as próprias"
  on public.review_schedule for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "review_schedule: apagar as próprias"
  on public.review_schedule for delete to authenticated
  using ((select auth.uid()) = user_id);


-- -----------------------------------------------------------------------------
-- Permissões (GRANT). O RLS decide QUAIS linhas; o GRANT decide QUAIS
-- operações o papel pode tentar. Deixamos os dois explícitos.
-- -----------------------------------------------------------------------------
revoke all on
  public.profiles, public.topics, public.questions,
  public.sessions, public.attempts, public.review_schedule
from anon, authenticated;

grant select on public.topics, public.questions to authenticated;
-- update limitado às colunas que o app edita (id e created_at não mudam).
grant select on public.profiles to authenticated;
grant update (display_name, timezone, target_seconds) on public.profiles to authenticated;
-- Uma sessão só muda para registrar o fim; kind e tema ficam fixos.
grant select, insert on public.sessions to authenticated;
grant update (finished_at) on public.sessions to authenticated;
grant select, insert on public.attempts to authenticated;
grant select, insert, update, delete on public.review_schedule to authenticated;

-- set_updated_at só roda via gatilho.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
