import type { QuestionFile } from "@/lib/questionSchema";

function literal(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function textArray(values: readonly string[]): string {
  return `array[${values.map(literal).join(", ")}]::text[]`;
}

export function buildSeedSql(files: readonly QuestionFile[]): string {
  const topicRows = files.map(
    ({ topic }) => `  (${literal(topic.slug)}, ${literal(topic.name)}, ${topic.sort_order})`,
  );

  const questionRows = files.flatMap(({ topic, questions }) =>
    questions.map((question) => {
      const values = [
        literal(question.id),
        literal(topic.slug),
        literal(question.statement),
        question.premises ? textArray(question.premises) : "null::text[]",
        literal(question.prompt),
        textArray(question.options),
        question.correct_index,
        literal(question.explanation),
        question.difficulty,
      ];
      return `  (${values.join(", ")})`;
    }),
  );

  const questionIds = files.flatMap(({ questions }) => questions.map(({ id }) => literal(id)));

  return `-- Gerado por \`bun run seed\` a partir de content/questions/. Não edite à mão.

insert into public.topics (slug, name, sort_order) values
${topicRows.join(",\n")}
on conflict (slug) do update set
  name = excluded.name,
  sort_order = excluded.sort_order;

insert into public.questions
  (id, topic_id, statement, premises, prompt, options, correct_index, explanation, difficulty, active)
select v.id, t.id, v.statement, v.premises, v.prompt, v.options, v.correct_index, v.explanation, v.difficulty, true
from (values
${questionRows.join(",\n")}
) as v (id, topic_slug, statement, premises, prompt, options, correct_index, explanation, difficulty),
  public.topics as t
where t.slug = v.topic_slug
on conflict (id) do update set
  topic_id = excluded.topic_id,
  statement = excluded.statement,
  premises = excluded.premises,
  prompt = excluded.prompt,
  options = excluded.options,
  correct_index = excluded.correct_index,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  active = true;

-- Questões que saíram dos arquivos não podem ser apagadas (as respostas apontam para elas): ficam inativas.
update public.questions set active = false
where active and id not in (${questionIds.join(", ")});
`;
}
