import { describe, it, expect } from "vitest";
import { projectsCommand } from "../../src/commands/projects";
import { projects } from "../../src/data/content";

describe("projectsCommand", () => {
  it("devuelve una lista numerada con los 6 proyectos reales de content.ts", () => {
    const result = projectsCommand([]);
    const lines = result.output.split("\n");
    expect(lines).toHaveLength(projects.length);
    expect(lines).toHaveLength(6);
    expect(lines[0]).toMatch(/^1\. /);
    expect(lines[0]).toContain(projects[0].name);
  });

  it("ignora argumentos extra", () => {
    const result = projectsCommand(["algo"]);
    expect(result.output.length).toBeGreaterThan(0);
  });
});
