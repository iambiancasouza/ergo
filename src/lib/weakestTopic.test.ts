import { describe, expect, it } from "vitest";

import { rankTopicsByWeakness, topicAccuracy, type TopicAttempt } from "./weakestTopic";

// n tentativas do tema, as `correct` primeiras certas, uma por minuto a partir de `start`.
function attempts(topicId: number, total: number, correct: number, start = "2026-11-01T10:00:00Z"): TopicAttempt[] {
  return Array.from({ length: total }, (_, index) => ({
    topicId,
    isCorrect: index < correct,
    answeredAt: new Date(Date.parse(start) + index * 60_000).toISOString(),
  }));
}

describe("topicAccuracy", () => {
  it("devolve null com menos de 5 tentativas", () => {
    expect(topicAccuracy(attempts(1, 4, 4), 1)).toBeNull();
  });

  it("calcula a % com 5 ou mais", () => {
    expect(topicAccuracy(attempts(1, 5, 3), 1)).toBe(60);
  });

  it("considera só as 30 tentativas mais recentes", () => {
    // 10 antigas erradas, depois 30 recentes certas: só as 30 contam.
    const old = attempts(1, 10, 0, "2026-10-01T10:00:00Z");
    const recent = attempts(1, 30, 30, "2026-11-01T10:00:00Z");
    expect(topicAccuracy([...old, ...recent], 1)).toBe(100);
  });

  it("ignora tentativas de outros temas", () => {
    expect(topicAccuracy([...attempts(1, 5, 5), ...attempts(2, 5, 0)], 1)).toBe(100);
  });
});

describe("rankTopicsByWeakness", () => {
  it("ordena do menor para o maior acerto", () => {
    const data = [...attempts(1, 5, 5), ...attempts(2, 5, 2), ...attempts(3, 5, 4)];
    expect(rankTopicsByWeakness([1, 2, 3], data)).toEqual([2, 3, 1]);
  });

  it("tema sem dados suficientes conta como 0% e vem primeiro", () => {
    const data = [...attempts(1, 5, 1), ...attempts(2, 3, 0)];
    expect(rankTopicsByWeakness([1, 2], data)).toEqual([2, 1]);
  });

  it("no empate, mantém a ordem dos temas", () => {
    expect(rankTopicsByWeakness([3, 1, 2], [])).toEqual([3, 1, 2]);
  });
});
