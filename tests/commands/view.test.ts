import { describe, it, expect } from "vitest";
import { viewCommand } from "../../src/commands/view";
import { parseInput } from "../../src/core/parser";

describe("viewCommand", () => {
  it("señala toggleView sin imprimir output", () => {
    const result = viewCommand([]);
    expect(result.toggleView).toBe(true);
    expect(result.output).toBe("");
  });

  it("el alias 'vista' resuelve a 'view'", () => {
    expect(parseInput("vista").cmd).toBe("view");
  });
});
