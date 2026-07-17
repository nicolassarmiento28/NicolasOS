import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { startMatrix, stopMatrix, isMatrixRunning } from "../../src/effects/matrix";
import { parseInput } from "../../src/core/parser";
import { History } from "../../src/core/history";

describe("matrix effect", () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillRect: vi.fn(),
      fillText: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  afterEach(() => {
    stopMatrix();
  });

  it("no rompe el parser ni el historial mientras la animación está activa", () => {
    startMatrix();
    expect(isMatrixRunning()).toBe(true);

    const history = new History();
    const lines = ["help", "theme linux", "proyectos", "clear"];
    for (const line of lines) {
      const parsed = parseInput(line);
      expect(parsed.cmd).toBeTruthy();
      history.add(line);
    }
    expect(history.list()).toEqual(lines);
    expect(history.up()).toBe("clear");
    expect(history.up()).toBe("proyectos");
  });

  it("stopMatrix cancela la animación y remueve el canvas del DOM", () => {
    const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");
    startMatrix();
    expect(document.getElementById("matrix-canvas")).not.toBeNull();

    stopMatrix();
    expect(cancelSpy).toHaveBeenCalled();
    expect(isMatrixRunning()).toBe(false);
    expect(document.getElementById("matrix-canvas")).toBeNull();
  });

  it("el canvas usa z-index negativo (necesario para pintar detrás de #terminal, que es static)", () => {
    startMatrix();
    const canvas = document.getElementById("matrix-canvas") as HTMLCanvasElement;
    expect(canvas).not.toBeNull();
    expect(Number(canvas.style.zIndex)).toBeLessThan(0);
  });

  it("asume que #terminal sigue siendo position:static sin z-index propio", () => {
    // Guard de la premisa detrás del test anterior: un z-index negativo en
    // el canvas solo pinta "detrás" de #terminal porque #terminal es
    // static/z-index:auto (src/style.css). Si alguien le agrega `position`
    // o `z-index` a la regla #terminal, este test falla y avisa que hay
    // que revisar de nuevo el z-index del canvas en src/effects/matrix.ts.
    const css = readFileSync("src/style.css", "utf-8");
    const terminalRule = css.match(/#terminal\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(terminalRule).not.toMatch(/position\s*:/);
    expect(terminalRule).not.toMatch(/z-index\s*:/);
  });

  it("Escape detiene la animación (atajo rápido, no la única forma de salir)", () => {
    startMatrix();
    expect(isMatrixRunning()).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(isMatrixRunning()).toBe(false);
    expect(document.getElementById("matrix-canvas")).toBeNull();
  });

  it("redimensiona el canvas al viewport visible en resize (mobile: barra de direcciones dinámica)", () => {
    startMatrix();
    const canvas = document.getElementById("matrix-canvas") as HTMLCanvasElement;
    Object.defineProperty(window, "innerWidth", { value: 390, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 700, configurable: true });
    window.dispatchEvent(new Event("resize"));
    expect(canvas.width).toBe(390);
    expect(canvas.height).toBe(700);
  });

  it("no deja el listener de resize colgado después de stopMatrix", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    startMatrix();
    stopMatrix();

    const adds = addSpy.mock.calls.filter((c) => c[0] === "resize").length;
    const removes = removeSpy.mock.calls.filter((c) => c[0] === "resize").length;
    expect(adds).toBe(1);
    expect(removes).toBe(1);
  });

  it("no deja el listener de Escape colgado después de stopMatrix (sin fuga entre sesiones)", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");

    startMatrix();
    stopMatrix();
    startMatrix();
    stopMatrix();

    const adds = addSpy.mock.calls.filter((c) => c[0] === "keydown").length;
    const removes = removeSpy.mock.calls.filter((c) => c[0] === "keydown").length;
    expect(adds).toBe(2);
    expect(removes).toBe(2);
  });
});
