import { describe, it, expect, beforeEach, vi } from "vitest";
import { THEMES } from "../src/themes/themes";

// main.ts corre su bootstrap al importarse (side effects sobre el DOM),
// por eso cada test resetea el DOM y re-importa el módulo con vi.resetModules.
async function bootMain(): Promise<void> {
  document.body.innerHTML = '<div id="app"></div>';
  await import("../src/main");
}

describe("boot y onboarding-ux", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("al cargar sin interacción, ya se ve la lista de comandos (auto-ejecuta help)", async () => {
    await bootMain();
    const output = document.querySelector("#output")!;
    expect(output.textContent).toContain("projects");
    expect(output.textContent).toContain("whoami");
  });

  it("muestra el hint fijo 'escribe help para empezar'", async () => {
    await bootMain();
    expect(document.querySelector("#hint")?.textContent).toMatch(/help/i);
  });

  it("tocar un chip ejecuta el mismo comando que escribirlo y presionar enter", async () => {
    await bootMain();
    const chip = document.querySelector<HTMLButtonElement>('[data-cmd="whoami"]')!;
    chip.click();
    const output = document.querySelector("#output")!;
    // el eco de "whoami" y su resultado deben aparecer, igual que si se
    // hubiera escrito en el input y presionado enter.
    expect(output.textContent).toContain("nicolas@os:~$ whoami");
  });

  it("el botón de vista normal muestra el contenido sin terminal en 1 click", async () => {
    await bootMain();
    const toggle = document.querySelector<HTMLButtonElement>("#fallback-toggle")!;
    toggle.click();
    const fallbackWindow = document.querySelector("#fallback-window")!;
    const win = document.querySelector("#window") as HTMLElement;
    expect((fallbackWindow as HTMLElement).hidden).toBe(false);
    expect(win.hidden).toBe(true);
    expect(fallbackWindow.textContent).toContain("Proyectos");
    expect(fallbackWindow.textContent).toContain("Skills");
    expect(fallbackWindow.textContent).toContain("Contacto");
  });

  it("cada proyecto en la vista normal muestra un link funcional a su demo y el ASCII banner está presente", async () => {
    await bootMain();
    document.querySelector<HTMLButtonElement>("#fallback-toggle")!.click();
    const fallbackWindow = document.querySelector("#fallback-window")!;
    const links = fallbackWindow.querySelectorAll<HTMLAnchorElement>("a.project-link");
    expect(links.length).toBeGreaterThan(0);
    links.forEach((a) => expect(a.href).toMatch(/^https?:\/\//));
    expect(fallbackWindow.querySelector(".ascii-banner")).not.toBeNull();
  });
  it("el input crece con el texto tipeado para que el cursor quede pegado al final (no fijo)", async () => {
    await bootMain();
    const input = document.querySelector<HTMLInputElement>("#input")!;
    input.value = "whoami";
    input.dispatchEvent(new Event("input"));
    // +1 de margen (ver main.ts, syncInputWidth): evita que el cálculo en
    // `ch`, que redondea hacia abajo, corte el último carácter tipeado.
    expect(input.style.width).toBe(`${input.value.length + 1}ch`);
  });

  it("el primer carácter tipeado no queda cortado por un width calculado para el estado vacío (specs/10-diseno-visual.md)", async () => {
    await bootMain();
    const input = document.querySelector<HTMLInputElement>("#input")!;
    input.value = "w";
    input.dispatchEvent(new Event("input"));
    // el width del fallback en `ch` debe cubrir el carácter con margen, y
    // field-sizing: content (CSS) es quien realmente evita el corte donde
    // está soportado.
    expect(input.style.width).toBe(`${1 + 1}ch`);
  });

  it("carga la terminal con el tema 'dos' por defecto, no cyberpunk (specs/03-temas.md)", async () => {
    document.documentElement.removeAttribute("style");
    await bootMain();
    const root = document.documentElement;
    expect(root.style.getPropertyValue("--theme-bg")).toBe(THEMES.dos.bg);
    expect(root.style.getPropertyValue("--theme-text")).toBe(THEMES.dos.text);
    expect(root.style.getPropertyValue("--theme-accent")).toBe(THEMES.dos.accent);
    expect(root.style.getPropertyValue("--theme-bg")).not.toBe(THEMES.cyberpunk.bg);
    expect(root.style.getPropertyValue("--theme-accent")).not.toBe(THEMES.cyberpunk.accent);
  });
});
