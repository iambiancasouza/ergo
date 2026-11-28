import { describe, expect, it } from "vitest";

import { scheduleNext } from "./review";

const today = "2026-11-28";

describe("scheduleNext", () => {
  describe("errou", () => {
    it("questão nova entra na caixa 0, para amanhã", () => {
      expect(scheduleNext(null, false, today)).toEqual({ box: 0, dueDate: "2026-11-29" });
    });

    it("questão em qualquer caixa volta para a 0, mesmo antes de vencer", () => {
      expect(scheduleNext({ box: 3, dueDate: "2026-12-10" }, false, today)).toEqual({ box: 0, dueDate: "2026-11-29" });
    });
  });

  describe("acertou", () => {
    it("questão nova não entra na revisão", () => {
      expect(scheduleNext(null, true, today)).toBeNull();
    });

    it("revisão que ainda não venceu não muda", () => {
      expect(scheduleNext({ box: 0, dueDate: "2026-11-29" }, true, today)).toBeNull();
    });

    it.each([
      [0, 1, "2026-12-01"],
      [1, 2, "2026-12-05"],
      [2, 3, "2026-12-12"],
      [3, 4, "2026-12-28"],
    ])("revisão vencida na caixa %i sobe para a %i, volta em %s", (box, nextBox, dueDate) => {
      expect(scheduleNext({ box, dueDate: today }, true, today)).toEqual({ box: nextBox, dueDate });
    });

    it("revisão atrasada conta a partir de hoje, não da data antiga", () => {
      expect(scheduleNext({ box: 1, dueDate: "2026-11-01" }, true, today)).toEqual({ box: 2, dueDate: "2026-12-05" });
    });

    it("caixa 4 fica na 4 e volta em 30 dias", () => {
      expect(scheduleNext({ box: 4, dueDate: today }, true, today)).toEqual({ box: 4, dueDate: "2026-12-28" });
    });
  });
});
