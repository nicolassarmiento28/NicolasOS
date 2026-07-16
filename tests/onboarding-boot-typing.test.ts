import { describe, it, expect, beforeEach, vi } from "vitest";

// Criterio de aceptación (specs/10-diseno-visual.md): el texto de boot se
// tipea carácter a carácter, no aparece de golpe. Confirmamos que en el
// primer frame el texto completo NO está presente, y que avanzando el
// tiempo sí se completa progresivamente.
describe("boot con efecto de escritura", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("el texto de boot no está 100% presente en el primer frame", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.body.innerHTML = '<div id="app"></div>';
    await import("../src/main");

    const boot = document.querySelector<HTMLElement>(".boot-text")!;
    const fullText = 'NicolasOS — escribe "help" para ver los comandos disponibles.';
    // primer frame: nada tipeado todavía (el primer tick corre sincrónico
    // con longitud 0, el resto vía setTimeout).
    expect(boot.textContent).not.toBe(fullText);

    vi.advanceTimersByTime(fullText.length * 24 + 50);
    expect(boot.textContent).toBe(fullText);

    vi.useRealTimers();
  });
});
