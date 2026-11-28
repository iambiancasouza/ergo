import { describe, expect, it } from "vitest";

import { resultHeadline } from "./resultHeadline";

describe("resultHeadline", () => {
  it.each([
    [100, "Perfeito!"],
    [99, "Bom treino!"],
    [70, "Bom treino!"],
    [69, "Continue praticando"],
    [40, "Continue praticando"],
    [39, "Hora de revisar"],
    [0, "Hora de revisar"],
  ])("%i%% → %s", (percent, expected) => {
    expect(resultHeadline(percent)).toBe(expected);
  });
});
