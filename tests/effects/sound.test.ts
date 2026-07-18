import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { enableSound, disableSound, isSoundEnabled, playKeystroke } from "../../src/effects/sound";

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

describe("sound effect", () => {
  beforeEach(() => {
    // @ts-expect-error jsdom no implementa AudioContext
    globalThis.AudioContext = FakeAudioContext;
  });

  afterEach(() => {
    disableSound();
  });

  it("nunca arranca solo: isSoundEnabled es false por default", () => {
    expect(isSoundEnabled()).toBe(false);
  });

  it("playKeystroke es no-op si el sonido está desactivado (no crea oscillator)", () => {
    const spy = vi.spyOn(FakeAudioContext.prototype, "createOscillator");
    playKeystroke();
    expect(spy).not.toHaveBeenCalled();
  });

  it("playKeystroke crea un oscillator por tecla cuando está activado", () => {
    enableSound();
    const spy = vi.spyOn(FakeAudioContext.prototype, "createOscillator");
    playKeystroke();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("teclas rápidas no acumulan oscillators: cada nuevo keystroke detiene el anterior", () => {
    enableSound();
    playKeystroke();
    // capturamos el oscillator devuelto por la primera llamada espiando stop()
    const stopSpy = vi.fn();
    const originalCreateOscillator = FakeAudioContext.prototype.createOscillator;
    let secondOsc: ReturnType<typeof originalCreateOscillator> | undefined;
    vi.spyOn(FakeAudioContext.prototype, "createOscillator").mockImplementationOnce(function (
      this: FakeAudioContext,
    ) {
      const osc = originalCreateOscillator.call(this);
      osc.stop = stopSpy;
      secondOsc = osc;
      return osc;
    });
    playKeystroke(); // primer click activo antes de este, debe cancelarse
    expect(secondOsc).toBeDefined();
    // el segundo oscillator ya se detuvo a sí mismo (stop programado corto)
    const callsAfterOwnSchedule = stopSpy.mock.calls.length;

    // un tercer keystroke debe cancelar explícitamente el oscillator del segundo
    // (llamada extra a stop(), antes de que su stop programado llegara a correr)
    playKeystroke();
    expect(stopSpy.mock.calls.length).toBeGreaterThan(callsAfterOwnSchedule);
  });

  it("disableSound apaga el estado", () => {
    enableSound();
    expect(isSoundEnabled()).toBe(true);
    disableSound();
    expect(isSoundEnabled()).toBe(false);
  });
});
