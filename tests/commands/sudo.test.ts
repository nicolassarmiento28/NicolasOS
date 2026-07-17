import { describe, it, expect } from "vitest";
import { sudoCommand } from "../../src/commands/sudo";

describe("sudoCommand", () => {
  it("devuelve un mensaje de permiso denegado", () => {
    const result = sudoCommand([]);
    expect(result.output).toMatch(/permiso denegado/i);
  });
});
