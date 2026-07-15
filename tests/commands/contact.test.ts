import { describe, it, expect } from "vitest";
import { contactCommand } from "../../src/commands/contact";

describe("contactCommand", () => {
  it("devuelve un email de contacto", () => {
    const result = contactCommand([]);
    expect(result.output).toContain("@");
  });
});
