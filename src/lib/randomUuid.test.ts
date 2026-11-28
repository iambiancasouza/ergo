import { describe, expect, it } from "vitest";
import { z } from "zod";

import { randomUuid } from "./randomUuid";

describe("randomUuid", () => {
  it("gera um UUID que o schema da Server Action aceita", () => {
    for (let i = 0; i < 100; i++) {
      expect(z.uuid().safeParse(randomUuid()).success).toBe(true);
    }
  });

  it("marca a versão 4 e a variante padrão", () => {
    const [, , version, variant] = randomUuid().split("-");
    expect(version[0]).toBe("4");
    expect(["8", "9", "a", "b"]).toContain(variant[0]);
  });

  it("não repete", () => {
    const ids = new Set(Array.from({ length: 1_000 }, randomUuid));
    expect(ids.size).toBe(1_000);
  });
});
