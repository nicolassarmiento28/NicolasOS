import { describe, it, expect, vi } from "vitest";
import { helpCommand } from "../../src/commands/help";

describe("helpCommand", () => {
  it("lista los comandos v1 disponibles", () => {
    const result = helpCommand([]);
    expect(result.output).toContain("help");
    expect(result.output).toContain("projects");
    expect(result.output).toContain("theme");
  });

  it("incluye music, matrix y stats (regresión: help.ts no debe tener una lista propia)", () => {
    const result = helpCommand([]);
    expect(result.output).toContain('data-cmd="music"');
    expect(result.output).toContain('data-cmd="matrix"');
    expect(result.output).toContain('data-cmd="stats"');
  });

  it("refleja un comando nuevo agregado al registry sin tocar help.ts", async () => {
    vi.resetModules();
    vi.doMock("../../src/core/registry", () => ({
      COMMAND_NAMES: ["help", "comando-ficticio"],
    }));
    const { helpCommand: helpWithFakeRegistry } = await import("../../src/commands/help");
    const result = helpWithFakeRegistry([]);
    expect(result.output).toContain('data-cmd="comando-ficticio"');
    vi.doUnmock("../../src/core/registry");
    vi.resetModules();
  });

  it("no incluye el comando experience (eliminado, sin experiencia laboral)", () => {
    const result = helpCommand([]);
    expect(result.output).not.toMatch(/\bexperience\b/);
  });

  it("ignora argumentos extra", () => {
    const result = helpCommand(["algo"]);
    expect(result.output).toContain("help");
  });

  it("devuelve chips tappeables con data-cmd por comando", () => {
    const result = helpCommand([]);
    expect(result.html).toBe(true);
    expect(result.output).toContain('data-cmd="projects"');
    expect(result.output).toContain('data-cmd="theme"');
  });
});
