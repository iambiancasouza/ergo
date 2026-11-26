-- =============================================================================
-- Ergo · função keep_alive
--
-- O plano gratuito do Supabase pausa o projeto após 7 dias sem atividade.
-- O workflow .github/workflows/keepAlive.yml chama esta função a cada 3 dias.
--
-- O workflow não tem usuário logado (usa só a chave publishable, papel anon),
-- e o anon não acessa nenhuma tabela. Esta função dá a ele algo para chamar
-- que executa uma consulta no Postgres (conta como atividade) sem ler nem
-- gravar dado nenhum: só devolve a hora atual do banco.
-- =============================================================================

create function public.keep_alive()
returns timestamptz
language sql
stable
-- security invoker (padrão): roda com as permissões de quem chama, sem
-- privilégio extra.
set search_path = ''
as $$
  select now();
$$;

comment on function public.keep_alive() is
  'Chamada pelo workflow keepAlive.yml para o projeto não pausar. Não acessa tabelas.';

-- Toda função nova pode ser executada por public, e o Supabase ainda concede
-- execute a anon e authenticated no schema public. Tiramos tudo e liberamos
-- só para o anon, que é o papel do workflow.
revoke execute on function public.keep_alive() from public, anon, authenticated;
grant execute on function public.keep_alive() to anon;
