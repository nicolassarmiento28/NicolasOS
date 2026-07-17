import { describe, it, expect, beforeEach } from "vitest";
import { statsCommand } from "../../src/commands/stats";
import { Analytics } from "../../src/core/analytics";

describe("statsCommand", () => {
  beforeEach(() => localStorage.clear());

  it("muestra mensaje cuando no hay datos todavía (con opt-in ya dado)", () => {
    Analytics.enable();
    const result = statsCommand([]);
    expect(result.output).toMatch(/no hay/i);
  });

  it("muestra mensaje de opt-in cuando la analítica está desactivada", () => {
    const result = statsCommand([]);
    expect(result.output).toMatch(/analytics on/i);
  });

  it("muestra los comandos más usados primero", () => {
    Analytics.enable();
    Analytics.track("help");
    Analytics.track("help");
    Analytics.track("about");
    const result = statsCommand([]);
    const lines = result.output.split("\n");
    expect(lines[0]).toBe("help: 2");
    expect(lines[1]).toBe("about: 1");
  });
});
