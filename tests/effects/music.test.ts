import { describe, it, expect, afterEach, vi } from "vitest";
import { startMusic, stopMusic, isMusicPlaying } from "../../src/effects/music";
import { parseInput } from "../../src/core/parser";
import { History } from "../../src/core/history";

class FakeAudioContext {
  destination = {};
  // arranca "suspended" como en mobile real (iOS Safari) hasta que resume()
  // se llama sincrónicamente dentro del gesto de usuario (specs/06-effects-v2.md,
  // bug "la música no suena en mobile").
  state: "suspended" | "running" | "closed" = "suspended";
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
  resume = vi.fn(() => {
    this.state = "running";
    return Promise.resolve();
  });
}

describe("music effect", () => {
  beforeEachSetup();

  afterEach(() => {
    stopMusic();
  });

  it("nunca arranca sola: isMusicPlaying es false sin llamar startMusic", () => {
    expect(isMusicPlaying()).toBe(false);
  });

  it("startMusic activa el estado y stopMusic lo apaga (toggle explícito)", () => {
    startMusic();
    expect(isMusicPlaying()).toBe(true);
    stopMusic();
    expect(isMusicPlaying()).toBe(false);
  });

  it("resume() se llama de forma síncrona dentro de startMusic, sin ningún await antes (bug: música no suena en mobile)", () => {
    // Reproduce el requisito de autoplay de iOS Safari: capturamos la
    // instancia real de AudioContext que crea startMusic() (no una nueva),
    // y confirmamos que su estado ya es "running" INMEDIATAMENTE al volver
    // de startMusic() -- en el mismo tick síncrono, sin esperar ningún
    // microtask/await. Si el código insertara un await antes de
    // ctx.resume(), este assert fallaría: el estado seguiría "suspended"
    // hasta el próximo microtask, que este test no espera.
    let created: FakeAudioContext | undefined;
    class SpyAudioContext extends FakeAudioContext {
      constructor() {
        super();
        created = this;
      }
    }
    // @ts-expect-error jsdom no implementa AudioContext
    globalThis.AudioContext = SpyAudioContext;

    startMusic();

    expect(created).toBeDefined();
    expect(created!.resume).toHaveBeenCalledTimes(1);
    expect(created!.state).toBe("running");
  });

  it("no rompe el parser ni el historial mientras la música está activa", () => {
    startMusic();
    expect(isMusicPlaying()).toBe(true);

    const history = new History();
    const lines = ["help", "theme linux", "proyectos", "clear"];
    for (const line of lines) {
      const parsed = parseInput(line);
      expect(parsed.cmd).toBeTruthy();
      history.add(line);
    }
    expect(history.list()).toEqual(lines);
    expect(history.up()).toBe("clear");
  });
});

function beforeEachSetup() {
  // @ts-expect-error jsdom no implementa AudioContext
  globalThis.AudioContext = FakeAudioContext;
}
