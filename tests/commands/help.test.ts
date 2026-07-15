import { describe, it, expect } from "vitest";
import { helpCommand } from "../../src/commands/help";

describe("helpCommand", () => {
  it("lista los comandos v1 disponibles", () => {
    const result = helpCommand([]);
    expect(result.output).toContain("help");
    expect(result.output).toContain("projects");
    expect(result.output).toContain("theme");
  });

  it("ignora argumentos extra", () => {
    const result = helpCommand(["algo"]);
    expect(result.output).toContain("help");
  });
});
