import { describe, it, expect } from "vitest";
import { historyCommand } from "../../src/commands/history";

describe("historyCommand", () => {
  it("muestra mensaje vacío sin historial", () => {
    const result = historyCommand([]);
    expect(result.output).toMatch(/no hay/i);
  });

  it("lista los comandos previos inyectados", () => {
    const result = historyCommand([], ["help", "about"]);
    expect(result.output).toContain("help");
    expect(result.output).toContain("about");
  });
});
