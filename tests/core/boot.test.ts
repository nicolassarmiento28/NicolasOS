import { describe, it, expect, vi } from "vitest";
import { BOOT_LINES, bootDurationMs, runBootSequence, CHAR_DELAY_MS } from "../../src/core/boot";

// specs/11-mejoras-interaccion.md #4: boot log corto, salteable, duración
// medible (1.5-2.5s sin saltar).
describe("boot log estilo BIOS/Linux", () => {
  it("la duración total sin saltar está entre 1.5 y 2.5 segundos", () => {
    const ms = bootDurationMs();
    expect(ms).toBeGreaterThanOrEqual(1500);
    expect(ms).toBeLessThanOrEqual(2500);
  });

  it("tipea cada línea progresivamente y llama a onComplete al terminar todas", () => {
    vi.useFakeTimers();
    const container = document.createElement("div");
    const onComplete = vi.fn();
    runBootSequence(container, onComplete);

    // primer frame: nada tipeado todavía.
    expect(container.textContent).toBe("");

    vi.advanceTimersByTime(bootDurationMs() + 50);
    expect(container.textContent).toBe(BOOT_LINES.join(""));
    expect(onComplete).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("skip() cancela cualquier tipeo pendiente y llama a onComplete de inmediato, sin residuos a medio tipear", () => {
    vi.useFakeTimers();
    const container = document.createElement("div");
    const onComplete = vi.fn();
    const skip = runBootSequence(container, onComplete);

    // avanza un poco, pero no lo suficiente para completar la primera línea.
    vi.advanceTimersByTime(CHAR_DELAY_MS * 2);
    const partial = container.textContent;
    expect(partial).not.toBe("");
    expect(partial).not.toBe(BOOT_LINES.join(""));

    skip();
    expect(onComplete).toHaveBeenCalledTimes(1);

    // avanzar más tiempo no debe seguir tipeando ni volver a llamar onComplete.
    vi.advanceTimersByTime(bootDurationMs());
    expect(onComplete).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("skip() es idempotente (llamarlo dos veces no llama onComplete dos veces)", () => {
    const container = document.createElement("div");
    const onComplete = vi.fn();
    const skip = runBootSequence(container, onComplete);
    skip();
    skip();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
