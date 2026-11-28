import { describe, expect, it } from "vitest";

import { addDays, dayKeyIn, formatLongDate } from "./dayKey";

describe("formatLongDate", () => {
  it.each([
    ["2026-11-27T15:00:00Z", "Sexta, 27 de novembro"],
    ["2026-11-28T15:00:00Z", "Sábado, 28 de novembro"],
    ["2026-11-29T15:00:00Z", "Domingo, 29 de novembro"],
    ["2026-12-01T15:00:00Z", "Terça, 1 de dezembro"],
  ])("%s em São Paulo → %s", (instant, expected) => {
    expect(formatLongDate(new Date(instant), "America/Sao_Paulo")).toBe(expected);
  });

  it("usa o fuso da pessoa", () => {
    // 02:30 UTC de sábado ainda é sexta à noite em São Paulo.
    expect(formatLongDate(new Date("2026-11-28T02:30:00Z"), "America/Sao_Paulo")).toBe("Sexta, 27 de novembro");
  });
});

describe("dayKeyIn", () => {
  // 02:30 UTC de 28/11 ainda é 27/11 em São Paulo (UTC−3) e já é 28/11 em Tóquio (UTC+9).
  const instant = new Date("2026-11-28T02:30:00Z");

  it("usa o fuso da pessoa, não o UTC", () => {
    expect(dayKeyIn(instant, "America/Sao_Paulo")).toBe("2026-11-27");
    expect(dayKeyIn(instant, "Asia/Tokyo")).toBe("2026-11-28");
    expect(dayKeyIn(instant, "UTC")).toBe("2026-11-28");
  });

  it("completa mês e dia com zero", () => {
    expect(dayKeyIn(new Date("2026-03-05T15:00:00Z"), "America/Sao_Paulo")).toBe("2026-03-05");
  });
});

describe("addDays", () => {
  it.each([
    ["2026-11-28", 1, "2026-11-29"],
    ["2026-11-30", 1, "2026-12-01"],
    ["2026-12-31", 1, "2027-01-01"],
    ["2028-02-28", 1, "2028-02-29"],
    ["2027-02-28", 1, "2027-03-01"],
    ["2026-11-28", 30, "2026-12-28"],
    ["2026-03-01", -1, "2026-02-28"],
    ["2026-11-28", 0, "2026-11-28"],
  ])("%s + %i dia(s) = %s", (day, days, expected) => {
    expect(addDays(day, days)).toBe(expected);
  });
});
