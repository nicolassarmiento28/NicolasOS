import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { startMatrix, stopMatrix, isMatrixRunning, resizeMatrix } from "../../src/effects/matrix";
import { parseInput } from "../../src/core/parser";
import { History } from "../../src/core/history";

describe("matrix effect", () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillRect: vi.fn(),
      fillText: vi.fn(),
      setTransform: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    // jsdom no implementa requestAnimationFrame de forma útil para tests
    // síncronos: cada llamada "de afuera" (el rAF de medición en
    // startMatrix/resizeMatrix) corre inmediato para poder afirmar sobre el
    // estado post-medición sin esperas reales. Una llamada que ocurre
    // DENTRO de la ejecución de otro callback (el loop de dibujo
    // re-encolándose a sí mismo) no se ejecuta, para no recursar
    // infinitamente en el mismo tick.
    let rafId = 0;
    let depth = 0;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      rafId++;
      if (depth === 0) {
        depth++;
        cb(0);
        depth--;
      }
      return rafId;
    });
  });

  afterEach(() => {
    stopMatrix();
    vi.unstubAllGlobals();
    // Object.defineProperty en window persiste entre tests del mismo
    // archivo (jsdom no resetea `window`): limpiar visualViewport para que
    // un test no herede el valor que dejó el anterior.
    Object.defineProperty(window, "visualViewport", { value: undefined, configurable: true });
    Object.defineProperty(window, "devicePixelRatio", { value: 1, configurable: true });
  });

  it("no rompe el parser ni el historial mientras la animación está activa", () => {
    startMatrix();
    expect(isMatrixRunning()).toBe(true);

    const history = new History();
    const lines = ["help", "theme linux", "proyectos", "clear"];
    for (const line of lines) {
      const parsed = parseInput(line);
      expect(parsed.cmd).toBeTruthy();
      history.add(line);
    }
    expect(history.list()).toEqual(lines);
    expect(history.up()).toBe("clear");
    expect(history.up()).toBe("proyectos");
  });

  it("stopMatrix cancela la animación y remueve el canvas del DOM", () => {
    const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");
    startMatrix();
    expect(document.getElementById("matrix-canvas")).not.toBeNull();

    stopMatrix();
    expect(cancelSpy).toHaveBeenCalled();
    expect(isMatrixRunning()).toBe(false);
    expect(document.getElementById("matrix-canvas")).toBeNull();
  });

  it("el canvas usa z-index negativo (necesario para pintar detrás de #terminal, que es static)", () => {
    startMatrix();
    const canvas = document.getElementById("matrix-canvas") as HTMLCanvasElement;
    expect(canvas).not.toBeNull();
    expect(Number(canvas.style.zIndex)).toBeLessThan(0);
  });

  it("asume que #terminal sigue siendo position:static sin z-index propio", () => {
    // Guard de la premisa detrás del test anterior: un z-index negativo en
    // el canvas solo pinta "detrás" de #terminal porque #terminal es
    // static/z-index:auto (src/style.css). Si alguien le agrega `position`
    // o `z-index` a la regla #terminal, este test falla y avisa que hay
    // que revisar de nuevo el z-index del canvas en src/effects/matrix.ts.
    const css = readFileSync("src/style.css", "utf-8");
    const terminalRule = css.match(/#terminal\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(terminalRule).not.toMatch(/position\s*:/);
    expect(terminalRule).not.toMatch(/z-index\s*:/);
  });

  it("Escape detiene la animación (atajo rápido, no la única forma de salir)", () => {
    startMatrix();
    expect(isMatrixRunning()).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(isMatrixRunning()).toBe(false);
    expect(document.getElementById("matrix-canvas")).toBeNull();
  });

  it("el canvas cubre el viewport seteando width/height CSS en px explícitos (no 100%)", () => {
    // Con position:fixed + inset:0, un canvas SIN width/height CSS usa su
    // tamaño intrínseco (los atributos width/height) como caja en vez de
    // estirarse — esa es la causa raíz de las franjas en mobile. Y
    // width/height:100% en un fixed resuelve contra clientWidth (excluye
    // scrollbar clásico), así que el tamaño se setea en px explícitos.
    Object.defineProperty(window, "innerWidth", { value: 390, configurable: true });
    Object.defineProperty(window, "visualViewport", {
      value: { width: 390, height: 844, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      configurable: true,
    });
    startMatrix();
    const canvas = document.getElementById("matrix-canvas") as HTMLCanvasElement;
    expect(canvas.style.width).toBe("390px");
    expect(canvas.style.height).toBe("844px");
  });

  it("vista normal con scrollbar clásico: canvas.style.width sigue window.innerWidth, no visualViewport.width ni document.documentElement.clientWidth", () => {
    // Reproduce el bug reportado: en la vista normal (con scroll)
    // visualViewport.width EXCLUYE el ancho del scrollbar clásico (a
    // diferencia de innerWidth), y document.documentElement.clientWidth
    // también lo excluye. El ancho del canvas debe seguir innerWidth para
    // no dejar la franja de 15px reportada por QA.
    Object.defineProperty(window, "innerWidth", { value: 428, configurable: true });
    Object.defineProperty(document.documentElement, "clientWidth", { value: 413, configurable: true });
    Object.defineProperty(window, "visualViewport", {
      value: { width: 413, height: 844, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      configurable: true,
    });
    startMatrix();
    const canvas = document.getElementById("matrix-canvas") as HTMLCanvasElement;
    expect(canvas.style.width).toBe("428px");
    expect(canvas.style.width).not.toBe("413px");
  });

  it("setea el buffer real (canvas.width/height) escalado por devicePixelRatio, no solo el tamaño CSS", () => {
    Object.defineProperty(window, "devicePixelRatio", { value: 3, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: 390, configurable: true });
    Object.defineProperty(window, "visualViewport", {
      value: { width: 390, height: 844, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      configurable: true,
    });
    startMatrix();
    const canvas = document.getElementById("matrix-canvas") as HTMLCanvasElement;
    expect(canvas.width).toBe(390 * 3);
    expect(canvas.height).toBe(844 * 3);
  });

  it("redimensiona el buffer al viewport visible en resize (mobile: barra de direcciones dinámica)", () => {
    startMatrix();
    const canvas = document.getElementById("matrix-canvas") as HTMLCanvasElement;
    Object.defineProperty(window, "devicePixelRatio", { value: 1, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: 390, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 700, configurable: true });
    window.dispatchEvent(new Event("resize"));
    expect(canvas.width).toBe(390);
    expect(canvas.height).toBe(700);
  });

  it("no deja el listener de resize colgado después de stopMatrix", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    startMatrix();
    stopMatrix();

    const adds = addSpy.mock.calls.filter((c) => c[0] === "resize").length;
    const removes = removeSpy.mock.calls.filter((c) => c[0] === "resize").length;
    expect(adds).toBe(1);
    expect(removes).toBe(1);
  });

  it("resizeMatrix remide el buffer al viewport actual (mobile: cambio de vista mueve la barra de direcciones)", () => {
    startMatrix();
    Object.defineProperty(window, "devicePixelRatio", { value: 1, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: 390, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 844, configurable: true });
    resizeMatrix();
    const canvas = document.getElementById("matrix-canvas") as HTMLCanvasElement;
    expect(canvas.width).toBe(390);
    expect(canvas.height).toBe(844);
  });

  it("resizeMatrix usa innerWidth para el ancho (visualViewport.width excluye el scrollbar clásico) y prioriza visualViewport para el alto (barra de direcciones mobile)", () => {
    startMatrix();
    Object.defineProperty(window, "devicePixelRatio", { value: 1, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: 390, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 900, configurable: true });
    Object.defineProperty(window, "visualViewport", {
      value: { width: 375, height: 844, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      configurable: true,
    });
    resizeMatrix();
    const canvas = document.getElementById("matrix-canvas") as HTMLCanvasElement;
    expect(canvas.width).toBe(390);
    expect(canvas.height).toBe(844);
  });

  it("resizeMatrix no rompe nada si matrix no está corriendo", () => {
    expect(() => resizeMatrix()).not.toThrow();
  });

  it("start -> stop (antes del rAF de medición) -> start no deja dos draw loops corriendo en paralelo", () => {
    // Reproduce la condición de carrera: stopMatrix() corre ANTES de que
    // el rAF de medición inicial de startMatrix() #1 dispare. Sin el guard
    // `running`, ese rAF viejo terminaba llamando startDrawLoop() igual,
    // y su draw() se re-encolaba para siempre sin que stopMatrix() pudiera
    // cancelarlo (rafId quedaba pisado por el loop nuevo).
    const pending: FrameRequestCallback[] = [];
    let rafId = 0;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      rafId++;
      pending.push(cb);
      return rafId;
    });

    startMatrix(); // agenda el rAF de medición #1 (pending[0]), sin correrlo
    stopMatrix(); // running = false, canvas = null, antes de que el rAF corra
    startMatrix(); // agenda el rAF de medición #2 (pending[1])

    // Dispara ambos rAF de medición en el orden real del reporte: el
    // huérfano (#1) dispara DESPUÉS de que start #2 ya puso running=true de
    // nuevo — el escenario exacto que rompía el guard basado solo en
    // `running`. Solo debe sobrevivir un draw loop (el de start #2).
    let cursor = 0;
    pending[cursor++](0); // meas #1 huérfano: debe abortar (generation stale)
    pending[cursor++](0); // meas #2 vigente: arranca el draw loop real

    // Cada "frame" corre solo los callbacks agregados por el frame
    // anterior. Si el huérfano también hubiera arrancado su propio loop,
    // cada frame encolaría dos callbacks nuevos en vez de uno.
    for (let frame = 0; frame < 5; frame++) {
      const start = cursor;
      const end = pending.length;
      for (let i = start; i < end; i++) pending[i](0);
      cursor = end;
      const newlyQueued = pending.length - end;
      expect(newlyQueued).toBe(1);
    }

    stopMatrix();
  });

  it("no deja el listener de Escape colgado después de stopMatrix (sin fuga entre sesiones)", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");

    startMatrix();
    stopMatrix();
    startMatrix();
    stopMatrix();

    const adds = addSpy.mock.calls.filter((c) => c[0] === "keydown").length;
    const removes = removeSpy.mock.calls.filter((c) => c[0] === "keydown").length;
    expect(adds).toBe(2);
    expect(removes).toBe(2);
  });
});
