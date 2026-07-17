import { describe, it, expect, beforeEach } from "vitest";
import { applyTheme, getCurrentTheme, THEMES } from "../../src/themes/themes";

describe("applyTheme", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("style");
  });

  it("aplica las variables CSS correctas para cada tema", () => {
    for (const [name, tokens] of Object.entries(THEMES)) {
      applyTheme(name);
      const root = document.documentElement;
      expect(root.style.getPropertyValue("--theme-bg")).toBe(tokens.bg);
      expect(root.style.getPropertyValue("--theme-text")).toBe(tokens.text);
      expect(root.style.getPropertyValue("--theme-accent")).toBe(tokens.accent);
      expect(root.style.getPropertyValue("--theme-titlebar")).toBe(tokens.titlebar);
      expect(root.style.getPropertyValue("--theme-crt")).toBe(tokens.crt ? "1" : "0");
      expect(root.style.getPropertyValue("--dim")).toBe(tokens.dim);
    }
  });

  it("windows-xp usa un --dim con contraste suficiente contra su fondo claro, distinto del gris de los temas oscuros", () => {
    applyTheme("windows-xp");
    const dim = document.documentElement.style.getPropertyValue("--dim");
    expect(dim).toBe(THEMES["windows-xp"].dim);
    expect(dim).not.toBe("rgba(255, 255, 255, 0.5)");
  });

  it("linux y hacker se distinguen visualmente (no solo tono de verde)", () => {
    // linux: austero, sin glow/scanlines, chips rectos (specs/03-temas.md)
    expect(THEMES.linux.glowIntensity).toBe("none");
    expect(THEMES.linux.scanlinesIntensity).toBe("none");
    expect(THEMES.linux.chipRadius).toBe("sharp");
    expect(THEMES.linux.crt).toBe(false);
    expect(THEMES.linux.flicker).toBe(false);
    expect(THEMES.linux.ambientRain).toBe(false);
    expect(THEMES.linux.cursorStyle).toBe("blink");

    // hacker (specs/06-effects-v2.md): efecto máximo, MÁS elementos que linux
    // no tiene en absoluto (flicker, cursor "breathe", lluvia ambiental).
    expect(THEMES.hacker.glowIntensity).toBe("intense");
    expect(THEMES.hacker.scanlinesIntensity).toBe("intense");
    expect(THEMES.hacker.flicker).toBe(true);
    expect(THEMES.hacker.ambientRain).toBe(true);
    expect(THEMES.hacker.cursorStyle).toBe("breathe");
  });

  it("hacker aplica flicker y cursorStyle como data attributes en documentElement", () => {
    applyTheme("hacker");
    const root = document.documentElement;
    expect(root.dataset.themeFlicker).toBe("1");
    expect(root.dataset.cursorStyle).toBe("breathe");
    expect(root.style.getPropertyValue("--theme-glow-2")).toBe("12px");
    expect(root.style.getPropertyValue("--theme-chip-hover-glow")).toBe("20px");

    applyTheme("linux");
    expect(root.dataset.themeFlicker).toBe("0");
    expect(root.dataset.cursorStyle).toBe("blink");
    expect(root.style.getPropertyValue("--theme-glow-2")).toBe("0px");
  });

  it("devuelve false y no cambia el tema activo ante un nombre inválido", () => {
    applyTheme("linux");
    const ok = applyTheme("commodore-64");
    expect(ok).toBe(false);
    expect(getCurrentTheme()).toBe("linux");
  });

  it("el tema activo persiste entre llamadas (sesión)", () => {
    applyTheme("dos");
    expect(getCurrentTheme()).toBe("dos");
    // simula otra acción cualquiera sin volver a llamar applyTheme
    expect(getCurrentTheme()).toBe("dos");
  });
});
