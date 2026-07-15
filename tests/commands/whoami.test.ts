import { describe, it, expect } from "vitest";
import { whoamiCommand } from "../../src/commands/whoami";

describe("whoamiCommand", () => {
  it("devuelve identidad sin depender de argumentos", () => {
    const result = whoamiCommand([]);
    expect(result.output).toContain("Nicolás Sarmiento");
  });

  it("ignora argumentos extra", () => {
    const result = whoamiCommand(["algo"]);
    expect(result.output).toContain("Nicolás Sarmiento");
  });
});
