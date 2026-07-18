import { describe, it, expect } from "vitest";
import { autocompleteCommand } from "../../src/core/autocomplete";

const names = ["help", "whoami", "about", "projects", "open", "skills", "resume"];

describe("autocompleteCommand", () => {
  it("completa a la única coincidencia (pro -> projects)", () => {
    const { match, options } = autocompleteCommand("pro", names);
    expect(match).toBe("projects");
    expect(options).toEqual(["projects"]);
  });

  it("lista las opciones en vez de completar cuando el prefijo es ambiguo", () => {
    const { match, options } = autocompleteCommand("o", ["open", "options", "about"]);
    expect(match).toBeUndefined();
    expect(options).toEqual(["open", "options"]);
  });

  it("no hace nada si no hay ninguna coincidencia", () => {
    const { match, options } = autocompleteCommand("zzz", names);
    expect(match).toBeUndefined();
    expect(options).toEqual([]);
  });

  it("input vacío no matchea nada", () => {
    const { match, options } = autocompleteCommand("", names);
    expect(match).toBeUndefined();
    expect(options).toEqual([]);
  });
});
