import { describe, expect, it } from "vitest";

import { summarizeAttempts } from "./sessionResult";

describe("summarizeAttempts", () => {
  it("soma acertos e tempo e calcula a média", () => {
    const stats = summarizeAttempts([
      { isCorrect: true, timeMs: 30_000 },
      { isCorrect: false, timeMs: 90_000 },
      { isCorrect: true, timeMs: 60_000 },
    ]);

    expect(stats).toEqual({ total: 3, correct: 2, percent: 67, totalMs: 180_000, averageMs: 60_000 });
  });

  it("arredonda a porcentagem e a média", () => {
    const stats = summarizeAttempts([
      { isCorrect: true, timeMs: 1_000 },
      { isCorrect: false, timeMs: 1_001 },
      { isCorrect: false, timeMs: 1_001 },
    ]);

    expect(stats.percent).toBe(33);
    expect(stats.averageMs).toBe(1_001);
  });

  it("não divide por zero sem respostas", () => {
    expect(summarizeAttempts([])).toEqual({ total: 0, correct: 0, percent: 0, totalMs: 0, averageMs: 0 });
  });
});
