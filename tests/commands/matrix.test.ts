import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { matrixCommand } from "../../src/commands/matrix";
import { stopMatrix } from "../../src/effects/matrix";

describe("matrixCommand", () => {
  beforeEach(() => {
    // jsdom no implementa canvas 2d por defecto: mock mínimo de lo que usa matrix.ts
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillRect: vi.fn(),
      fillText: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  afterEach(() => {
    stopMatrix();
  });

  it("activa matrix la primera vez", () => {
    const result = matrixCommand([]);
    expect(result.output).toBe("Matrix activado");
  });

  it("desactiva matrix si ya está corriendo (toggle)", () => {
    matrixCommand([]);
    const result = matrixCommand([]);
    expect(result.output).toBe("Matrix desactivado");
  });
});
