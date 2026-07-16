import { describe, it, expect, beforeEach, vi } from "vitest";

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
    const fallbackView = document.querySelector("#fallback-view")!;
    const win = document.querySelector("#window") as HTMLElement;
    expect((fallbackView as HTMLElement).hidden).toBe(false);
    expect(win.hidden).toBe(true);
    expect(fallbackView.textContent).toContain("Proyectos");
    expect(fallbackView.textContent).toContain("Skills");
    expect(fallbackView.textContent).toContain("Contacto");
  });
});
