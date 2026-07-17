import { describe, it, expect, afterEach, vi } from "vitest";
import { startAmbientRain, stopAmbientRain, isAmbientRainRunning } from "../../src/themes/ambientRain";

describe("ambientRain", () => {
  afterEach(() => {
    stopAmbientRain();
    vi.unstubAllGlobals();
    Object.defineProperty(window, "innerWidth", { value: 1024, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 768, configurable: true });
  });

  it("no arranca si el usuario prefiere menos movimiento (prefers-reduced-motion)", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    startAmbientRain();
    expect(isAmbientRainRunning()).toBe(false);
  });

  it("al arrancar, el canvas cubre el viewport actual (innerWidth/innerHeight)", () => {
    Object.defineProperty(window, "innerWidth", { value: 390, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 844, configurable: true });
    startAmbientRain();
    const canvas = document.getElementById("ambient-rain-canvas") as HTMLCanvasElement;
    expect(canvas.width).toBe(390);
    expect(canvas.height).toBe(844);
  });

  // Bug confirmado en auditoría real 2026-07-17, corregido: ambientRain.ts
  // ahora escucha window.resize (handleResize) igual que matrix.ts, y
  // remide el canvas en cada evento — specs/06-effects-v2.md exige que la
  // lluvia ambiental cubra el 100% del viewport, no solo al iniciar.
  it("el canvas se re-mide si el viewport cambia después de iniciar", () => {
    Object.defineProperty(window, "innerWidth", { value: 390, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 844, configurable: true });
    startAmbientRain();

    Object.defineProperty(window, "innerWidth", { value: 428, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 926, configurable: true });
    window.dispatchEvent(new Event("resize"));

    const canvas = document.getElementById("ambient-rain-canvas") as HTMLCanvasElement;
    expect(canvas.width).toBe(428);
    expect(canvas.height).toBe(926);
  });
});
