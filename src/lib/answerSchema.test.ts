import { describe, expect, it } from "vitest";

import { answerSchema, clampTimeMs } from "./answerSchema";

// Limites do CLAUDE.md: de 1 s a 30 min.
const minTimeMs = 1_000;
const maxTimeMs = 30 * 60 * 1_000;

const valid = {
  kind: "topic",
  sessionId: "3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b",
  topicId: 3,
  questionId: "frac-01",
  chosenIndex: 4,
  timeMs: 42_000,
};

describe("clampTimeMs", () => {
  it.each([
    [200, minTimeMs],
    [1_000, 1_000],
    [42_499.6, 42_500],
    [maxTimeMs, maxTimeMs],
    [2 * maxTimeMs, maxTimeMs],
  ])("%d ms vira %d ms", (ms, expected) => {
    expect(clampTimeMs(ms)).toBe(expected);
  });
});

describe("answerSchema", () => {
  it("aceita uma resposta válida de treino por tema", () => {
    expect(answerSchema.safeParse(valid).success).toBe(true);
  });

  const withoutTopic = {
    sessionId: valid.sessionId,
    questionId: valid.questionId,
    chosenIndex: valid.chosenIndex,
    timeMs: valid.timeMs,
  };

  it("aceita uma resposta de revisão, que não tem tema", () => {
    expect(answerSchema.safeParse({ ...withoutTopic, kind: "review" }).success).toBe(true);
  });

  it("aceita uma resposta do treino do dia, que não tem tema", () => {
    expect(answerSchema.safeParse({ ...withoutTopic, kind: "daily" }).success).toBe(true);
  });

  it("recusa treino por tema sem tema", () => {
    expect(answerSchema.safeParse({ ...withoutTopic, kind: "topic" }).success).toBe(false);
  });

  it("recusa revisão com tema", () => {
    expect(answerSchema.safeParse({ ...valid, kind: "review" }).success).toBe(false);
  });

  it.each([
    ["tempo abaixo de 1 s", { timeMs: minTimeMs - 1 }],
    ["tempo acima de 30 min", { timeMs: maxTimeMs + 1 }],
    ["tempo com fração", { timeMs: 1_500.5 }],
    ["alternativa 5", { chosenIndex: 5 }],
    ["alternativa negativa", { chosenIndex: -1 }],
    ["sessão que não é UUID", { sessionId: "abc" }],
    ["tema 0", { topicId: 0 }],
    ["questão vazia", { questionId: "" }],
    ["tipo de sessão desconhecido", { kind: "exam" }],
    ["campo a mais (ex.: id do usuário)", { userId: "3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b" }],
  ])("recusa %s", (_case, overrides) => {
    expect(answerSchema.safeParse({ ...valid, ...overrides }).success).toBe(false);
  });
});
