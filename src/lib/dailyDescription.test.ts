import { describe, expect, it } from "vitest";

import { describeDailyPlan } from "./dailyDescription";

const base = { reviewCount: 0, newCount: 0, repeatCount: 0, weakestTopicName: "Associação lógica", weakestHasData: true };

describe("describeDailyPlan", () => {
  it("revisões e novas com o tema mais fraco, como no esboço", () => {
    expect(describeDailyPlan({ ...base, reviewCount: 6, newCount: 4 })).toBe(
      "6 revisões de questões que você errou + 4 novas, com foco em associação lógica, seu tema mais fraco.",
    );
  });

  it("sem dados suficientes não chama nenhum tema de mais fraco", () => {
    expect(describeDailyPlan({ ...base, newCount: 10, weakestHasData: false })).toBe("10 novas, de vários temas.");
  });

  it("singular", () => {
    expect(describeDailyPlan({ ...base, reviewCount: 1, newCount: 1 })).toBe(
      "1 revisão de questão que você errou + 1 nova, com foco em associação lógica, seu tema mais fraco.",
    );
  });

  it("só revisões e repetidas, sem novas", () => {
    expect(describeDailyPlan({ ...base, reviewCount: 3, repeatCount: 7 })).toBe(
      "3 revisões de questões que você errou + 7 para repetir.",
    );
  });
});
