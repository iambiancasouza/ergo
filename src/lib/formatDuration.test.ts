import { describe, expect, it } from "vitest";

import { formatDuration } from "./formatDuration";

describe("formatDuration", () => {
  it.each([
    [0, "0:00"],
    [999, "0:00"],
    [1_000, "0:01"],
    [42_500, "0:42"],
    [90_000, "1:30"],
    [605_000, "10:05"],
    [3_600_000, "60:00"],
  ])("%i ms vira %s", (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });

  it("trata valores negativos como zero", () => {
    expect(formatDuration(-500)).toBe("0:00");
  });
});
