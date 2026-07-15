import { describe, it, expect } from "vitest";
import { contactCommand } from "../../src/commands/contact";
import { contact } from "../../src/data/content";

describe("contactCommand", () => {
  it("devuelve el email real de content.ts", () => {
    const result = contactCommand([]);
    expect(result.output).toContain(contact.email);
  });
});
