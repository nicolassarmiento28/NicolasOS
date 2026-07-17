import { describe, it, expect, afterEach, vi } from "vitest";
import { musicCommand } from "../../src/commands/music";
import { stopMusic } from "../../src/effects/music";

class FakeAudioContext {
  destination = {};
  createGain() {
    return { gain: { value: 0 }, connect: vi.fn() };
  }
  createOscillator() {
    return {
      type: "sine",
      frequency: { value: 0 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  close = vi.fn();
  resume = vi.fn().mockResolvedValue(undefined);
}
// @ts-expect-error jsdom no implementa AudioContext
globalThis.AudioContext = FakeAudioContext;

describe("musicCommand", () => {
  afterEach(() => {
    stopMusic();
  });

  it("activa la música la primera vez", () => {
    const result = musicCommand([]);
    expect(result.output).toContain("activada");
  });

  it("la desactiva si ya está sonando (toggle)", () => {
    musicCommand([]);
    const result = musicCommand([]);
    expect(result.output).toContain("detenida");
  });

  it("music stop la detiene explícitamente", () => {
    musicCommand([]);
    const result = musicCommand(["stop"]);
    expect(result.output).toContain("detenida");
  });

  it("music stop es no-op seguro si no está sonando", () => {
    const result = musicCommand(["stop"]);
    expect(result.output).toContain("detenida");
  });
});
