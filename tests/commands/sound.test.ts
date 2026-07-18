import { describe, it, expect, afterEach, vi } from "vitest";
import { soundCommand } from "../../src/commands/sound";
import { disableSound, isSoundEnabled } from "../../src/effects/sound";

class FakeAudioContext {
  destination = {};
  currentTime = 0;
  createGain() {
    return { gain: { value: 0 }, connect: vi.fn() };
  }
  createOscillator() {
    return {
      type: "square",
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

describe("soundCommand", () => {
  afterEach(() => {
    disableSound();
  });

  it("arranca desactivado por default", () => {
    expect(isSoundEnabled()).toBe(false);
    const result = soundCommand([]);
    expect(result.output).toMatch(/desactivado/i);
  });

  it("'sound on' activa el opt-in", () => {
    const result = soundCommand(["on"]);
    expect(result.output).toMatch(/activado/i);
    expect(isSoundEnabled()).toBe(true);
  });

  it("'sound off' desactiva el opt-in", () => {
    soundCommand(["on"]);
    const result = soundCommand(["off"]);
    expect(result.output).toMatch(/desactivado/i);
    expect(isSoundEnabled()).toBe(false);
  });

  it("sin argumento no hace toggle, solo informa el estado", () => {
    soundCommand(["on"]);
    const result = soundCommand([]);
    expect(isSoundEnabled()).toBe(true);
    expect(result.output).toMatch(/activado/i);
  });

  it("argumento inválido devuelve mensaje de uso sin cambiar el estado", () => {
    const result = soundCommand(["foo"]);
    expect(isSoundEnabled()).toBe(false);
    expect(result.output).toMatch(/uso/i);
  });
});
