import { describe, expect, it } from "vitest";

import { pickSlice, sliceCenter, spinTarget } from "./topicWheel";

// Onde o meio da fatia fica depois de girar, de 0 a 360 (0 = sob o ponteiro).
const positionAfter = (rotation: number, index: number, count: number) =>
  (((sliceCenter(index, count) + rotation) % 360) + 360) % 360;

describe("pickSlice", () => {
  it("fica entre 0 e count − 1", () => {
    expect(pickSlice(11, () => 0)).toBe(0);
    expect(pickSlice(11, () => 0.5)).toBe(5);
    expect(pickSlice(11, () => 0.999999)).toBe(10);
  });
});

describe("spinTarget", () => {
  it.each([
    [0, 0],
    [0, 7],
    [123, 3],
    [1977.5, 10],
    [-40, 5],
  ])("a partir de %d°, a fatia %i para sob o ponteiro", (current, index) => {
    const target = spinTarget(current, index, 11);
    expect(positionAfter(target, index, 11)).toBeCloseTo(0);
  });

  it("sempre gira para a frente, com pelo menos as voltas pedidas", () => {
    const target = spinTarget(250, 4, 11, 5);
    expect(target).toBeGreaterThanOrEqual(250 + 5 * 360);
    expect(target).toBeLessThan(250 + 6 * 360);
  });

  it("girar de novo para a mesma fatia ainda dá as voltas inteiras", () => {
    const first = spinTarget(0, 2, 11);
    const second = spinTarget(first, 2, 11);
    expect(second - first).toBe(5 * 360);
  });
});
