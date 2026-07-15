import { describe, it, expect, beforeEach } from "vitest";
import { themeCommand } from "../../src/commands/theme";
import { getCurrentTheme } from "../../src/themes/themes";

describe("themeCommand", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("style");
  });

  it("lista los temas disponibles sin argumentos", () => {
    const result = themeCommand([]);
    expect(result.output).toContain("cyberpunk");
    expect(result.output).toContain("linux");
    expect(result.output).toContain("dos");
  });

  it("theme <n> aplica las variables CSS del tema y confirma el cambio", () => {
    const result = themeCommand(["linux"]);
    expect(result.output).toContain("linux");
    expect(document.documentElement.style.getPropertyValue("--theme-text")).toBe("#33ff33");
  });

  it("el tema aplicado persiste al ejecutar otro comando", () => {
    themeCommand(["dos"]);
    // simula la ejecución de otro comando cualquiera: el estado del tema
    // vive en documentElement/módulo, ningún otro comando lo resetea
    themeCommand([]);
    expect(getCurrentTheme()).toBe("dos");
    expect(document.documentElement.style.getPropertyValue("--theme-bg")).toBe("#000000");
  });

  it("informa error con un nombre de tema inválido, sin lanzar excepción", () => {
    const result = themeCommand(["windows-xp"]);
    expect(result.output).toContain("no encontrado");
  });
});
