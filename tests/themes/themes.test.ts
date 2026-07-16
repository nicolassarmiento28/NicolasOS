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
      expect(root.style.getPropertyValue("--theme-titlebar-dots")).toBe(
        tokens.showTitlebarDots ? "flex" : "none",
      );
    }
  });

  it("linux y hacker se distinguen visualmente (no solo tono de verde)", () => {
    // linux: austero, sin glow/scanlines/dots, chips rectos (specs/03-temas.md)
    expect(THEMES.linux.glowIntensity).toBe("none");
    expect(THEMES.linux.scanlinesIntensity).toBe("none");
    expect(THEMES.linux.chipRadius).toBe("sharp");
    expect(THEMES.linux.showTitlebarDots).toBe(false);
    expect(THEMES.linux.crt).toBe(false);

    // hacker (v2, bloqueado): efecto máximo
    expect(THEMES.hacker.glowIntensity).toBe("strong");
    expect(THEMES.hacker.scanlinesIntensity).toBe("visible");
    expect(THEMES.hacker.showTitlebarDots).toBe(true);
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
