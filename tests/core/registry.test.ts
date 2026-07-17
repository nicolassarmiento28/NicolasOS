import { describe, it, expect } from "vitest";
import { COMMANDS, COMMAND_NAMES } from "../../src/core/registry";

describe("registry", () => {
  it("COMMANDS contiene exactamente los comandos esperados", () => {
    expect(Object.keys(COMMANDS).sort()).toEqual(
      [
        "help",
        "whoami",
        "about",
        "projects",
        "open",
        "skills",
        "resume",
        "contact",
        "github",
        "linkedin",
        "theme",
        "clear",
        "sudo",
        "matrix",
        "music",
        "stats",
        "analytics",
        "view",
      ].sort(),
    );
  });

  it("no incluye 'experience' (eliminado)", () => {
    expect(COMMANDS).not.toHaveProperty("experience");
  });

  it("COMMAND_NAMES incluye 'history' además de las claves de COMMANDS", () => {
    expect(COMMAND_NAMES).toContain("history");
    expect(COMMAND_NAMES).toEqual([...Object.keys(COMMANDS), "history"]);
  });

  it("cada valor de COMMANDS es una función invocable", () => {
    for (const fn of Object.values(COMMANDS)) {
      expect(typeof fn).toBe("function");
    }
  });
});
