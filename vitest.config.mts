import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Testes só das funções puras de src/lib (sem React nem banco), então o
// ambiente é Node puro, sem jsdom.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
