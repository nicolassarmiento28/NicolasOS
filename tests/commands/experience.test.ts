import { describe, it, expect } from "vitest";
import { experienceCommand } from "../../src/commands/experience";

describe("experienceCommand", () => {
  it("devuelve un timeline no vacío", () => {
    const result = experienceCommand([]);
    expect(result.output.length).toBeGreaterThan(0);
    expect(result.output).toContain("—");
  });
});
