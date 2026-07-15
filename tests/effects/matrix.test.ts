import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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
});
