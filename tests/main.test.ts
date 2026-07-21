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

  it("el control □ (maximizar/restaurar) muestra el contenido sin terminal en 1 click", async () => {
    await bootMain();
    const toggle = document.querySelector<HTMLButtonElement>("#window .win-maximize")!;
    toggle.click();
    const fallbackWindow = document.querySelector("#fallback-window")!;
    const win = document.querySelector("#window") as HTMLElement;
    expect((fallbackWindow as HTMLElement).hidden).toBe(false);
    expect(win.hidden).toBe(true);
    expect(fallbackWindow.textContent).toContain("Proyectos");
    expect(fallbackWindow.textContent).toContain("Skills");
    expect(fallbackWindow.textContent).toContain("Contacto");
  });

  it("el control □ de la vista normal vuelve a la terminal", async () => {
    await bootMain();
    document.querySelector<HTMLButtonElement>("#window .win-maximize")!.click();
    document.querySelector<HTMLButtonElement>("#fallback-window .win-maximize")!.click();
    const fallbackWindow = document.querySelector("#fallback-window") as HTMLElement;
    const win = document.querySelector("#window") as HTMLElement;
    expect(fallbackWindow.hidden).toBe(true);
    expect(win.hidden).toBe(false);
  });

  it("la vista normal tiene un botón con texto visible que vuelve a la terminal", async () => {
    await bootMain();
    document.querySelector<HTMLButtonElement>("#window .win-maximize")!.click();
    const backBtn = document.querySelector<HTMLButtonElement>(
      "#fallback-window .btn-back-to-terminal",
    )!;
    expect(backBtn).not.toBeNull();
    expect(backBtn.textContent).toContain("terminal");
    backBtn.click();
    const fallbackWindow = document.querySelector("#fallback-window") as HTMLElement;
    const win = document.querySelector("#window") as HTMLElement;
    expect(fallbackWindow.hidden).toBe(true);
    expect(win.hidden).toBe(false);
  });

  it("el control _ (minimizar) imprime un easter egg sin romper el parser ni el historial", async () => {
    await bootMain();
    document.querySelector<HTMLButtonElement>("#window .win-minimize")!.click();
    const output = document.querySelector("#output")!;
    expect(output.textContent).toContain("no minimiza nada");
    const input = document.querySelector<HTMLInputElement>("#input")!;
    input.value = "whoami";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(output.textContent).toContain("nicolas@os:~$ whoami");
  });

  it("el control X (cerrar) imprime un easter egg sin cerrar nada", async () => {
    await bootMain();
    document.querySelector<HTMLButtonElement>("#window .win-close")!.click();
    const output = document.querySelector("#output")!;
    expect(output.textContent).toContain("no puedes cerrarme");
    const win = document.querySelector("#window") as HTMLElement;
    expect(win.hidden).toBe(false);
  });

  it("el tema linux también muestra los controles de ventana (_ □ X), universales a todos los temas", async () => {
    await bootMain();
    const input = document.querySelector<HTMLInputElement>("#input")!;
    input.value = "theme linux";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    const controls = document.querySelector<HTMLElement>("#window .window-controls")!;
    expect(controls).not.toBeNull();
    expect(controls.querySelector(".win-close")).not.toBeNull();
  });

  it("cada proyecto en la vista normal muestra un link funcional a su demo y el ASCII banner está presente", async () => {
    await bootMain();
    document.querySelector<HTMLButtonElement>("#window .win-maximize")!.click();
    const fallbackWindow = document.querySelector("#fallback-window")!;
    const links = fallbackWindow.querySelectorAll<HTMLAnchorElement>("a.project-link");
    expect(links.length).toBeGreaterThan(0);
    links.forEach((a) => expect(a.href).toMatch(/^https?:\/\//));
    expect(fallbackWindow.querySelector(".ascii-banner")).not.toBeNull();
  });
  it('el botón de retorno de la vista normal dice exactamente "Volver a la terminal" (specs/10-diseno-visual.md)', async () => {
    await bootMain();
    document.querySelector<HTMLButtonElement>("#window .win-maximize")!.click();
    const btn = document.querySelector<HTMLButtonElement>("#fallback-window .btn-back-to-terminal")!;
    expect(btn.textContent).toBe("Volver a la terminal");
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

  it("mobile: compositionend (teclado virtual/IME) sincroniza el width igual que 'input', sin depender de ese evento (specs/10-diseno-visual.md)", async () => {
    await bootMain();
    const input = document.querySelector<HTMLInputElement>("#input")!;
    input.value = "w";
    // simula un teclado virtual mobile que dispara composition* en vez de
    // (o antes que) "input" para el primer carácter.
    input.dispatchEvent(new Event("compositionend"));
    expect(input.style.width).toBe(`${1 + 1}ch`);
  });

  it("cambiar a vista normal mientras matrix está activo lo deja corriendo detrás, no se detiene (specs/06-effects-v2.md)", async () => {
    await bootMain();
    const input = document.querySelector<HTMLInputElement>("#input")!;
    input.value = "matrix";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(document.getElementById("matrix-canvas")).not.toBeNull();

    document.querySelector<HTMLButtonElement>("#window .win-maximize")!.click();
    expect(document.getElementById("matrix-canvas")).not.toBeNull();

    document.querySelector<HTMLButtonElement>("#fallback-window .win-maximize")!.click();
    expect(document.getElementById("matrix-canvas")).not.toBeNull();
  });

  it("al cambiar de vista, el canvas de matrix se remide al viewport actual (mobile: barra de direcciones dinámica, specs/06-effects-v2.md)", async () => {
    await bootMain();
    const input = document.querySelector<HTMLInputElement>("#input")!;
    input.value = "matrix";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    Object.defineProperty(window, "innerWidth", { value: 390, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 700, configurable: true });
    document.querySelector<HTMLButtonElement>("#window .win-maximize")!.click();
    // resizeMatrix mide en el siguiente frame (specs/06-effects-v2.md:
    // esperar a que el layout de la nueva vista esté asentado antes de medir).
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const canvas = document.getElementById("matrix-canvas") as HTMLCanvasElement;
    expect(canvas.width).toBe(390);
    expect(canvas.height).toBe(700);
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

  it("las líneas de prompt (.echo) en el historial usan var(--theme-accent), nunca un color hardcodeado (specs/03-temas.md, bug conocido)", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const css = fs.readFileSync(
      path.resolve(__dirname, "../src/style.css"),
      "utf-8",
    );
    const echoRule = css.match(/#output \.echo\s*{([^}]*)}/)?.[1] ?? "";
    expect(echoRule).toContain("var(--theme-accent)");
    // ninguna otra regla de #output/.echo debe fijar un color hardcodeado
    // (ej. el verde #6f6 heredado de cyberpunk/hacker) que ignore el tema activo.
    expect(echoRule).not.toMatch(/#[0-9a-f]{3,6}/i);
  });

  it("el eco de un comando ya impreso se recolorea al cambiar de tema, no queda 'congelado' (specs/03-temas.md)", async () => {
    await bootMain();
    const input = document.querySelector<HTMLInputElement>("#input")!;
    const enter = new KeyboardEvent("keydown", { key: "Enter" });
    input.value = "whoami";
    input.dispatchEvent(enter);
    const echoLine = document.querySelector("#output .echo") as HTMLElement;
    expect(echoLine).not.toBeNull();
    // sin color inline: el color viene siempre de la CSS custom property del
    // tema activo (var(--theme-accent) en #output .echo), que applyTheme()
    // actualiza en documentElement al cambiar de tema — nunca se fija en JS
    // en el momento del render, así que las líneas viejas se actualizan solas.
    expect(echoLine.style.color).toBe("");
    input.value = "theme windows-xp";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(document.documentElement.style.getPropertyValue("--theme-accent")).toBe(
      THEMES["windows-xp"].accent,
    );
    // la línea vieja sigue sin color inline: sigue leyendo la var actualizada.
    expect(echoLine.style.color).toBe("");
  });

  it('ArrowUp x2 + ArrowDown x1 navega historial en el input real (DOM)', async () => {
    await bootMain();
    const input = document.querySelector<HTMLInputElement>('#input')!;
    input.value = 'whoami';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    input.value = 'about';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(input.value).toBe('about');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(input.value).toBe('whoami');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(input.value).toBe('about');
  });

  it('ejecutar comando nuevo resetea el indice de historial (ArrowUp vuelve al ultimo)', async () => {
    await bootMain();
    const input = document.querySelector<HTMLInputElement>('#input')!;
    input.value = 'whoami';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    input.value = 'about';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    input.value = 'projects';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(input.value).toBe('projects');
  });

  it("el boot overlay se muestra al cargar y desaparece de inmediato al presionar cualquier tecla, sin dejar residuos (specs/11-mejoras-interaccion.md)", async () => {
    await bootMain();
    expect(document.querySelector("#boot-overlay")).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(document.querySelector("#boot-overlay")).toBeNull();
    // el contenido final (banner, hint, chips) ya estaba presente desde el
    // primer frame, sin depender de que el boot log termine o se salte.
    const output = document.querySelector("#output")!;
    expect(output.textContent).toContain("projects");
  });

  it("el boot overlay también se saltea con un click en cualquier parte de la página", async () => {
    await bootMain();
    expect(document.querySelector("#boot-overlay")).not.toBeNull();
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(document.querySelector("#boot-overlay")).toBeNull();
  });

  it("saltar el boot cancela los timers de tipeo pendientes, sin dejarlos huérfanos corriendo sobre el overlay ya removido (specs/11-mejoras-interaccion.md, bug de auditoría)", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await bootMain();

    // dejamos terminar el tipeo del hint de fondo ("escribe help...", ajeno
    // al boot overlay) para aislar los timers del boot log bajo prueba.
    vi.advanceTimersByTime(2000);

    // saltamos ANTES de que termine de tipear el boot log, con timers de
    // tipeo todavía pendientes (el boot completo tarda ~2.1s).
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(document.querySelector("#boot-overlay")).toBeNull();

    // el fix real: el cancelador de runBootSequence() debe haber limpiado
    // sus setTimeout pendientes (clearTimeout), no solo desmontado el overlay.
    expect(vi.getTimerCount()).toBe(0);

    // avanzar el resto del tiempo del boot no debe reventar ni volver a tocar
    // el DOM ya removido (el bug original: onComplete/finishBoot llamado 2 veces).
    expect(() => vi.advanceTimersByTime(3000)).not.toThrow();
    expect(document.querySelector("#boot-overlay")).toBeNull();

    vi.useRealTimers();
  });

  it('ArrowLeft/ArrowRight no interceptan el historial (comportamiento nativo)', async () => {
    await bootMain();
    const input = document.querySelector<HTMLInputElement>('#input')!;
    input.value = 'whoami';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    const leftEvt = new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true });
    const rightEvt = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
    input.value = 'hola';
    const leftDefault = input.dispatchEvent(leftEvt);
    const rightDefault = input.dispatchEvent(rightEvt);
    expect(leftDefault).toBe(true);
    expect(rightDefault).toBe(true);
    expect(input.value).toBe('hola');
  });
});
