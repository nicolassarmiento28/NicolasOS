import { describe, it, expect } from "vitest";
import { skillsCommand } from "../../src/commands/skills";

describe("skillsCommand", () => {
  it("devuelve una lista de tecnologías no vacía", () => {
    const result = skillsCommand([]);
    expect(result.output.split("\n").length).toBeGreaterThan(0);
  });

  it("ignora argumentos extra", () => {
    const result = skillsCommand(["algo"]);
    expect(result.output.length).toBeGreaterThan(0);
  });
});
