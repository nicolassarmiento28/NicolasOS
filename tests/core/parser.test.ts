import { describe, expect, it } from "vitest";
import { parseInput } from "../../src/core/parser";

describe("parseInput", () => {
  it("separa cmd y args", () => {
    expect(parseInput("open 2")).toEqual({ cmd: "open", args: ["2"] });
  });

  it("normaliza mayúsculas del comando", () => {
    expect(parseInput("HELP")).toEqual({ cmd: "help", args: [] });
  });

  it("tolera espacios extra líder, final y múltiples", () => {
    expect(parseInput("   open    2   ")).toEqual({ cmd: "open", args: ["2"] });
  });

  it("maneja input vacío sin explotar", () => {
    expect(parseInput("")).toEqual({ cmd: "", args: [] });
  });

  it("maneja input solo espacios sin explotar", () => {
    expect(parseInput("   ")).toEqual({ cmd: "", args: [] });
  });

  it("resuelve alias ES a comando canónico", () => {
    expect(parseInput("ayuda")).toEqual({ cmd: "help", args: [] });
  });

  it("resuelve alias ES con args", () => {
    expect(parseInput("proyectos")).toEqual({ cmd: "projects", args: [] });
  });

  it("resuelve alias 'cv' a 'resume'", () => {
    expect(parseInput("cv")).toEqual({ cmd: "resume", args: [] });
  });

  it("resuelve alias en mayúsculas", () => {
    expect(parseInput("PROYECTOS")).toEqual({ cmd: "projects", args: [] });
  });

  it("no resuelve '__proto__' contra Object.prototype (cmd sigue siendo string literal)", () => {
    const result = parseInput("__proto__");
    expect(result).toEqual({ cmd: "__proto__", args: [] });
    expect(typeof result.cmd).toBe("string");
  });

  it("no resuelve 'constructor' contra Object.prototype (cmd sigue siendo string literal)", () => {
    const result = parseInput("constructor");
    expect(result).toEqual({ cmd: "constructor", args: [] });
    expect(typeof result.cmd).toBe("string");
  });

  it("resuelve alias 'tema' a 'theme'", () => {
    expect(parseInput("tema")).toEqual({ cmd: "theme", args: [] });
  });

  it("resuelve alias 'limpiar' a 'clear'", () => {
    expect(parseInput("limpiar")).toEqual({ cmd: "clear", args: [] });
  });

  it("resuelve alias 'historial' a 'history'", () => {
    expect(parseInput("historial")).toEqual({ cmd: "history", args: [] });
  });
});
