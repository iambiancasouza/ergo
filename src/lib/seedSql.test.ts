import { describe, expect, it } from "vitest";

import type { QuestionFile } from "@/lib/questionSchema";

import { buildSeedSql } from "./seedSql";

const files: QuestionFile[] = [
  {
    topic: { slug: "verdadeMentira", name: "Verdade e mentira", sort_order: 3 },
    questions: [
      {
        id: "vm-01",
        difficulty: 2,
        statement: "Na ilha, o copo d'água é de quem mente.",
        premises: ["Ana diz: 'Bia mente'.", "Bia diz a verdade."],
        prompt: "Quem mente?",
        options: ["Ana", "Bia", "Ambas", "Nenhuma", "Não dá para saber"],
        correct_index: 0,
        explanation: "Se Bia diz a verdade, Ana mente.",
      },
      {
        id: "vm-02",
        difficulty: 1,
        statement: "Sem premissas.",
        prompt: "?",
        options: ["a", "b", "c", "d", "e"],
        correct_index: 4,
        explanation: "e",
      },
    ],
  },
];

describe("buildSeedSql", () => {
  const sql = buildSeedSql(files);

  it("faz upsert do tema pelo slug", () => {
    expect(sql).toContain("('verdadeMentira', 'Verdade e mentira', 3)");
    expect(sql).toContain("on conflict (slug) do update");
  });

  it("dobra os apóstrofos, que encerrariam o texto no SQL", () => {
    expect(sql).toContain("'Na ilha, o copo d''água é de quem mente.'");
    expect(sql).toContain("array['Ana diz: ''Bia mente''.', 'Bia diz a verdade.']::text[]");
  });

  it("grava as questões com o tema, as alternativas e o gabarito", () => {
    expect(sql).toContain(
      "('vm-02', 'verdadeMentira', 'Sem premissas.', null::text[], '?', array['a', 'b', 'c', 'd', 'e']::text[], 4, 'e', 1)",
    );
    expect(sql).toContain("on conflict (id) do update");
  });

  it("desativa as questões que saíram dos arquivos", () => {
    expect(sql).toContain("where active and id not in ('vm-01', 'vm-02');");
  });
});
