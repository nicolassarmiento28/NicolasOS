import { describe, it, expect } from "vitest";
import { projectsCommand, PROJECTS } from "../../src/commands/projects";

describe("projectsCommand", () => {
  it("devuelve una lista numerada con todos los proyectos", () => {
    const result = projectsCommand([]);
    const lines = result.output.split("\n");
    expect(lines).toHaveLength(PROJECTS.length);
    expect(lines[0]).toMatch(/^1\. /);
  });

  it("ignora argumentos extra", () => {
    const result = projectsCommand(["algo"]);
    expect(result.output.length).toBeGreaterThan(0);
  });
});
