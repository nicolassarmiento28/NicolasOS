import { describe, it, expect, afterEach, vi } from "vitest";
import { startMusic, stopMusic, isMusicPlaying } from "../../src/effects/music";
import { parseInput } from "../../src/core/parser";
import { History } from "../../src/core/history";

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
