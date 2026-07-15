import { describe, it, expect } from "vitest";
import { skillsCommand } from "../../src/commands/skills";
import { skills } from "../../src/data/content";

describe("skillsCommand", () => {
  it("incluye las 3 categorías de content.ts", () => {
    const result = skillsCommand([]);
    expect(result.output).toContain(skills.frontend[0].name);
    expect(result.output).toContain(skills.backend[0].name);
    expect(result.output).toContain(skills.ia[0]);
  });

  it("ignora argumentos extra", () => {
    const result = skillsCommand(["algo"]);
    expect(result.output.length).toBeGreaterThan(0);
  });
});
