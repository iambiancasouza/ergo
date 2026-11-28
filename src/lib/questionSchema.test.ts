import { describe, expect, it } from "vitest";

import { parseQuestionBank } from "./questionSchema";

function question(overrides: Record<string, unknown> = {}) {
  return {
    id: "frac-01",
    difficulty: 1,
    statement: "João gastou 1/3 do salário.",
    prompt: "Que fração sobrou?",
    options: ["1/3", "2/3", "1/2", "1/4", "3/4"],
    correct_index: 1,
    explanation: "Sobram 3/3 − 1/3 = 2/3.",
    ...overrides,
  };
}

function file(questions: unknown[] = [question()], topic: Record<string, unknown> = {}) {
  return {
    fileName: "fracoes.json",
    data: { topic: { slug: "fracoes", name: "Frações", sort_order: 1, ...topic }, questions },
  };
}

describe("parseQuestionBank", () => {
  it("aceita um arquivo válido, com e sem premissas", () => {
    const [parsed] = parseQuestionBank([
      file([question(), question({ id: "frac-02", premises: ["Ana é mais alta que Bia."] })]),
    ]);

    expect(parsed.topic.slug).toBe("fracoes");
    expect(parsed.questions).toHaveLength(2);
  });

  it("recusa uma lista vazia de arquivos", () => {
    expect(() => parseQuestionBank([])).toThrow("Nenhum arquivo");
  });

  it.each([
    ["4 alternativas", { options: ["a", "b", "c", "d"] }, "5 alternativas"],
    ["alternativas repetidas", { options: ["a", "a", "b", "c", "d"] }, "repetidas"],
    ["correct_index 5", { correct_index: 5 }, "correct_index"],
    ["difficulty 4", { difficulty: 4 }, "difficulty"],
    ["enunciado em branco", { statement: "  " }, "vazio"],
    ["id fora do formato", { id: "Frac_1" }, "prefixo-01"],
    ["id com um dígito só", { id: "frac-1" }, "prefixo-01"],
    ["id com dois hífens", { id: "frac-01-b" }, "prefixo-01"],
    ["id sem prefixo", { id: "-01" }, "prefixo-01"],
    ["campo desconhecido", { correctIndex: 1 }, "correctIndex"],
  ])("recusa questão com %s, citando o arquivo", (_case, overrides, message) => {
    const run = () => parseQuestionBank([file([question(overrides)])]);

    expect(run).toThrow("fracoes.json");
    expect(run).toThrow(message);
  });

  it.each(["Fracoes", "fracoes-basicas", "1fracoes", ""])("recusa o slug %j, fora do camelCase", (slug) => {
    expect(() => parseQuestionBank([file(undefined, { slug })])).toThrow("camelCase");
  });

  it("recusa slug diferente do nome do arquivo", () => {
    expect(() => parseQuestionBank([file(undefined, { slug: "porcentagem" })])).toThrow(
      'precisa ser igual ao nome do arquivo ("fracoes")',
    );
  });

  it("recusa id repetido, no mesmo arquivo ou em outro", () => {
    expect(() => parseQuestionBank([file([question(), question()])])).toThrow('"frac-01" já é usado');

    const other = {
      fileName: "porcentagem.json",
      data: { topic: { slug: "porcentagem", name: "Porcentagem", sort_order: 2 }, questions: [question()] },
    };
    expect(() => parseQuestionBank([file(), other])).toThrow("já é usado em fracoes.json");
  });

  it("recusa dois temas com o mesmo sort_order", () => {
    const other = {
      fileName: "porcentagem.json",
      data: {
        topic: { slug: "porcentagem", name: "Porcentagem", sort_order: 1 },
        questions: [question({ id: "pct-01" })],
      },
    };

    expect(() => parseQuestionBank([file(), other])).toThrow("sort_order 1 já é usado");
  });
});
