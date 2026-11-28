import { describe, expect, it } from "vitest";

import { planDailySession } from "./dailySession";

const today = "2026-11-28";
const topicIds = [1, 2, 3];
const prefix: Record<number, string> = { 1: "a", 2: "b", 3: "c" };

// `perTopic` questões por tema: a1…, b1…, c1…
function questions(perTopic: number) {
  return topicIds.flatMap((topicId) =>
    Array.from({ length: perTopic }, (_, index) => ({ id: `${prefix[topicId]}${index + 1}`, topicId })),
  );
}

// Uma tentativa por questão, `correct` delas certas, um minuto entre cada (a ordem do array é a ordem no tempo).
function answer(ids: string[], topicId: number, correct: number, start = "2026-11-01T10:00:00Z") {
  return ids.map((questionId, index) => ({
    questionId,
    topicId,
    isCorrect: index < correct,
    answeredAt: new Date(Date.parse(start) + index * 60_000).toISOString(),
  }));
}

describe("planDailySession", () => {
  it("usuário novo: 4 do primeiro tema e o resto alternando entre os outros", () => {
    const plan = planDailySession({ today, topicIds, questions: questions(5), attempts: [], reviews: [] });

    expect(plan.questionIds).toEqual(["a1", "a2", "a3", "a4", "b1", "c1", "b2", "c2", "b3", "c3"]);
    expect(plan).toMatchObject({ reviewCount: 0, newCount: 10, repeatCount: 0, weakestTopicId: 1 });
    expect(plan.weakestHasData).toBe(false);
  });

  it("começa pelas revisões vencidas, mais atrasadas primeiro, no máximo 6", () => {
    const qs = questions(8);
    const reviews = [
      { questionId: "a1", dueDate: "2026-11-28" },
      { questionId: "a2", dueDate: "2026-11-20" },
      { questionId: "a3", dueDate: "2026-11-25" },
      { questionId: "b1", dueDate: "2026-11-26" },
      { questionId: "b2", dueDate: "2026-11-27" },
      { questionId: "b3", dueDate: "2026-11-21" },
      { questionId: "c1", dueDate: "2026-11-22" },
      { questionId: "c2", dueDate: "2026-11-29" }, // ainda não venceu
      { questionId: "zz", dueDate: "2026-11-01" }, // questão inativa
    ];
    const attempts = [
      ...answer(["a1", "a2", "a3"], 1, 0),
      ...answer(["b1", "b2", "b3"], 2, 0),
      ...answer(["c1", "c2"], 3, 0),
    ];

    const plan = planDailySession({ today, topicIds, questions: qs, attempts, reviews });

    expect(plan.questionIds.slice(0, 6)).toEqual(["a2", "b3", "c1", "a3", "b1", "b2"]);
    expect(plan.reviewCount).toBe(6);
    expect(plan.questionIds).not.toContain("c2");
    expect(plan.questionIds).toHaveLength(10);
  });

  it("foca no tema com menor acerto e completa com as respondidas há mais tempo", () => {
    const qs = questions(8);
    const attempts = [
      ...answer(["a1", "a2", "a3", "a4", "a5"], 1, 5, "2026-11-03T10:00:00Z"), // 100%
      ...answer(["b1", "b2", "b3", "b4", "b5"], 2, 1, "2026-11-01T10:00:00Z"), // 20%: o mais fraco
      ...answer(["c1", "c2", "c3", "c4", "c5"], 3, 3, "2026-11-02T10:00:00Z"), // 60%
    ];

    const plan = planDailySession({ today, topicIds, questions: qs, attempts, reviews: [] });

    expect(plan.weakestTopicId).toBe(2);
    expect(plan.weakestHasData).toBe(true);
    // 3 inéditas do tema 2, depois 3 (60%) e 1 (100%) alternando, e por fim a respondida há mais tempo (b1).
    expect(plan.questionIds).toEqual(["b6", "b7", "b8", "c6", "a6", "c7", "a7", "c8", "a8", "b1"]);
    expect(plan).toMatchObject({ reviewCount: 0, newCount: 9, repeatCount: 1 });
  });

  it("usa mais inéditas do tema mais fraco quando os outros acabam", () => {
    const qs = questions(8);
    const attempts = [
      ...answer(["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8"], 2, 8),
      ...answer(["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"], 3, 8),
    ];

    const plan = planDailySession({ today, topicIds, questions: qs, attempts, reviews: [] });

    // b1 e c1 foram respondidas no mesmo instante (as mais antigas): o desempate é pelo id.
    expect(plan.questionIds).toEqual(["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "b1", "c1"]);
    expect(plan).toMatchObject({ newCount: 8, repeatCount: 2 });
  });

  it("nunca repete questão, mesmo quando uma revisão também é do tema mais fraco", () => {
    const plan = planDailySession({
      today,
      topicIds,
      questions: questions(5),
      attempts: answer(["a1"], 1, 0),
      reviews: [{ questionId: "a1", dueDate: today }],
    });

    expect(new Set(plan.questionIds).size).toBe(plan.questionIds.length);
  });

  it("com poucas questões no banco, devolve todas", () => {
    const plan = planDailySession({ today, topicIds, questions: questions(2), attempts: [], reviews: [] });
    expect(plan.questionIds).toHaveLength(6);
  });
});
