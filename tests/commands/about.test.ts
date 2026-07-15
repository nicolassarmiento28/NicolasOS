import { describe, it, expect } from "vitest";
import { aboutCommand } from "../../src/commands/about";

describe("aboutCommand", () => {
  it("devuelve una bio corta sin depender de argumentos", () => {
    const result = aboutCommand([]);
    expect(result.output.length).toBeGreaterThan(0);
  });

  it("ignora argumentos extra", () => {
    const result = aboutCommand(["algo"]);
    expect(result.output.length).toBeGreaterThan(0);
  });
});
