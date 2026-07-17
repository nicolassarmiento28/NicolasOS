/** Animación de lluvia de código estilo Matrix, en un canvas fixed detrás del terminal. */

const CHARS = "アイウエオカキクケコサシスセソ0123456789ABCDEF";
const FONT_SIZE = 16;

let canvas: HTMLCanvasElement | null = null;
let rafId: number | null = null;
// isMatrixRunning() se consulta síncronamente (ej. toggle del comando)
// justo después de startMatrix(), pero rafId recién se asigna dentro del
// rAF de medición (async) — sin esta bandera separada, un toggle rápido
// vería isMatrixRunning() en false todavía y "activaría" matrix dos veces
// en vez de desactivarlo.
let running = false;
// `running` sola no alcanza para descartar un rAF huérfano de una
// generación anterior: si start->stop->start ocurre antes de que ese rAF
// dispare, `running` vuelve a true por el start nuevo y el guard no lo
// distingue del actual. `generation` se incrementa en cada startMatrix y
// cada callback encolado lo captura por closure, comparándolo contra el
// valor module-level actual antes de seguir.
let generation = 0;
// Tamaño lógico (CSS px) del buffer actual, usado por el loop de dibujo.
// El buffer real (canvas.width/height) está escalado por devicePixelRatio,
// así que el loop dibuja en coordenadas lógicas y deja que ctx.scale() haga
// la conversión a píxeles físicos (ver applyCanvasSize).
let logicalWidth = 0;
let logicalHeight = 0;
// Gotas de la animación (una por columna). Se regeneran en initDrops(), no
// solo al arrancar: un resize (ej. teclado virtual mobile) cambia el buffer
// del canvas, que el navegador limpia automáticamente al setear width/height
// — sin regenerar acá, la franja recién visible queda negra sin lluvia.
let drops: number[] = [];
// La apertura del teclado virtual dispara varios eventos visualViewport
// resize/scroll seguidos mientras anima (confirmado en iOS y Android, no es
// un solo evento) — cada uno de esos, sin debounce, llamaría applyCanvasSize
// (que limpia TODO el buffer nativamente al setear canvas.width/height) antes
// de que la animación llegue a rellenar la franja recién expuesta. Debounce:
// solo el último evento de la ráfaga aplica el resize.
let viewportDebounceId: ReturnType<typeof setTimeout> | null = null;
const VIEWPORT_DEBOUNCE_MS = 120;

// Overlay de debug temporal (?debug=matrix en la URL) para diagnosticar en
// dispositivo real sin cable/consola remota: muestra en vivo los valores de
// visualViewport y cuántos eventos crudos vs aplicaciones reales de resize
// hubo, para confirmar o descartar hipótesis de causa raíz sin adivinar.
// ponytail: hack de diagnóstico a propósito, se saca cuando el bug quede
// cerrado — no es parte de la superficie normal del producto.
const debugEnabled = new URLSearchParams(location.search).get("debug") === "matrix";
let debugEl: HTMLDivElement | null = null;
let rawEventCount = 0;
let appliedCount = 0;

function debugLog(): void {
  if (!debugEnabled || !debugEl) return;
  const vv = window.visualViewport;
  debugEl.textContent =
    `raw events: ${rawEventCount} | applied: ${appliedCount}\n` +
    `vv.height: ${vv?.height?.toFixed(1)} | vv.width: ${vv?.width?.toFixed(1)}\n` +
    `vv.offsetTop: ${vv?.offsetTop?.toFixed(1)} | vv.offsetLeft: ${vv?.offsetLeft?.toFixed(1)}\n` +
    `innerHeight: ${window.innerHeight} | innerWidth: ${window.innerWidth}\n` +
    `canvas: ${logicalWidth}x${logicalHeight} @ transform ${canvas?.style.transform ?? "-"}`;
}

/**
 * Ajusta el arreglo de gotas al número de columnas actual sin resetear las
 * que ya existían: agrega columnas nuevas en 1 (arrancan cayendo) o recorta
 * el excedente si el viewport se achicó. Preserva la caída en curso del resto.
 */
function initDrops(): void {
  const columns = Math.floor(logicalWidth / FONT_SIZE);
  if (columns > drops.length) {
    while (drops.length < columns) drops.push(1);
  } else if (columns < drops.length) {
    drops.length = columns;
  }
}

/** ¿Está la animación corriendo? Consultable por el comando para hacer toggle. */
export function isMatrixRunning(): boolean {
  return running;
}

/** Arranca la animación (no-op si ya está corriendo). */
export function startMatrix(): void {
  if (isMatrixRunning()) return;
  running = true;
  generation++;
  const myGeneration = generation;

  canvas = document.createElement("canvas");
  canvas.id = "matrix-canvas";
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  // Canvas es un elemento "replaced": con position:fixed + inset:0 pero SIN
  // width/height CSS explícitos, el navegador usa el tamaño intrínseco (los
  // atributos width/height en px) como tamaño de caja en vez de estirarlo
  // para llenar el viewport — ahí estaban las franjas sin cubrir en mobile.
  // width/height:100% en un position:fixed resuelve contra
  // document.documentElement.clientWidth/Height, que EXCLUYE el scrollbar
  // clásico de la vista normal (con contenido scrolleable) — dejando una
  // franja sin cubrir del ancho del scrollbar. Por eso el tamaño CSS se
  // setea en px explícitos desde applyCanvasSize(), con el mismo valor
  // (visualViewport / innerWidth) que ya se usa para el buffer.
  // #terminal es position:static (src/style.css) sin z-index propio, así
  // que CUALQUIER z-index positivo en un elemento posicionado (fixed) pinta
  // por encima de contenido static, sin importar el valor. Solo un z-index
  // NEGATIVO corre detrás de contenido static, sin tapar prompt/output/input.
  canvas.style.zIndex = "-1";
  canvas.style.pointerEvents = "none";
  document.body.appendChild(canvas);

  if (debugEnabled) {
    rawEventCount = 0;
    appliedCount = 0;
    debugEl = document.createElement("div");
    debugEl.id = "matrix-debug";
    debugEl.style.cssText =
      "position:fixed;top:0;left:0;z-index:9999;background:rgba(255,0,0,0.85);" +
      "color:#fff;font:11px monospace;padding:6px;white-space:pre;pointer-events:none;";
    document.body.appendChild(debugEl);
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // El tamaño real del canvas (para medir viewport y devicePixelRatio) solo
  // es correcto una vez que el elemento está montado y el navegador terminó
  // de asentar el layout (en mobile, la barra de direcciones dinámica). Un
  // requestAnimationFrame garantiza que ya hubo al menos un layout pass.
  requestAnimationFrame(() => {
    if (generation !== myGeneration) return;
    applyCanvasSize();
    startDrawLoop(ctx, myGeneration);
  });

  document.addEventListener("keydown", handleEscape);
  // mobile: la barra de direcciones aparece/desaparece y cambia el viewport
  // visible sin disparar "resize" de forma confiable en todos los browsers —
  // visualViewport sí lo cubre. Fallback a window.resize donde no exista.
  if (window.visualViewport) {
    // Debounced: ver comentario de viewportDebounceId. window.resize (rama
    // else, desktop/fallback) NO se debounca: ahí es un evento único
    // explícito, no una ráfaga.
    window.visualViewport.addEventListener("resize", handleViewportChange);
    // El offset puede cambiar sin cambiar el tamaño (ej. el usuario sigue
    // escribiendo y el viewport visual se reposiciona) — "resize" solo no
    // alcanza, hace falta también "scroll" del visualViewport.
    window.visualViewport.addEventListener("scroll", handleViewportChange);
  } else {
    window.addEventListener("resize", handleResize);
  }
}

function startDrawLoop(ctx: CanvasRenderingContext2D, myGeneration: number): void {
  initDrops();

  function draw(): void {
    if (!ctx || !canvas || !running || generation !== myGeneration) return;
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);
    ctx.fillStyle = "#00ff41";
    ctx.font = `${FONT_SIZE}px monospace`;
    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      ctx.fillText(char, i * FONT_SIZE, drops[i] * FONT_SIZE);
      if (drops[i] * FONT_SIZE > logicalHeight && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
    rafId = requestAnimationFrame(draw);
  }

  rafId = requestAnimationFrame(draw);
}

/**
 * Setea el buffer real del canvas (width/height en px físicos, escalado por
 * devicePixelRatio) para que el dibujo salga nítido en pantallas retina/
 * mobile, y escala el contexto para que el resto del código dibuje en
 * coordenadas lógicas (CSS px). El tamaño de caja CSS también se setea acá,
 * en px explícitos (no `100%`, ver comentario en startMatrix) para cubrir
 * el viewport completo incluso cuando hay scrollbar clásico (ver
 * viewportWidth/viewportHeight para la fuente usada en cada eje).
 */
function applyCanvasSize(): void {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  logicalWidth = viewportWidth();
  logicalHeight = viewportHeight();
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;
  canvas.width = Math.round(logicalWidth * dpr);
  canvas.height = Math.round(logicalHeight * dpr);
  const ctx = canvas.getContext("2d");
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  applyCanvasOffset();
  debugLog();
}

// Al abrir el teclado virtual, el navegador scrollea la página para mantener
// el input enfocado visible: visualViewport se achica Y se desplaza
// (offsetTop > 0), pero el layout viewport (referencia de position:fixed) no
// cambia — el canvas queda del tamaño correcto pero mal posicionado, dejando
// la franja inferior real (fuera del canvas) negra. Compensamos con
// translate() en vez de top/left para no pelear con inset:0 ya seteado.
function applyCanvasOffset(): void {
  if (!canvas) return;
  const vv = window.visualViewport;
  const x = vv?.offsetLeft ?? 0;
  const y = vv?.offsetTop ?? 0;
  canvas.style.transform = `translate(${x}px, ${y}px)`;
}

/**
 * Handler compartido de visualViewport resize/scroll: debounce genérico
 * (no depende de timings de ninguna plataforma) — reprograma el timer en
 * cada evento y solo aplica resize+offset una vez que la ráfaga terminó,
 * para no limpiar el buffer del canvas una vez por cada evento intermedio.
 */
function handleViewportChange(): void {
  rawEventCount++;
  debugLog();
  if (viewportDebounceId !== null) clearTimeout(viewportDebounceId);
  viewportDebounceId = setTimeout(() => {
    viewportDebounceId = null;
    handleResize();
  }, VIEWPORT_DEBOUNCE_MS);
}

/** Redimensiona el canvas al viewport visible actual (mobile: barra de direcciones dinámica). */
function handleResize(): void {
  if (!canvas) return;
  appliedCount++;
  applyCanvasSize();
  // Setear canvas.width/height (dentro de applyCanvasSize) limpia el buffer
  // nativamente — tratar el resize como un mini-reinicio del grid evita que
  // la franja recién visible quede negra.
  initDrops();
  debugLog();
}

/**
 * Fuerza un remedido del canvas. Se llama al alternar entre vista terminal
 * y vista normal: el DOM cambia (fallback se monta/desmonta) y en mobile
 * eso puede mover la barra de direcciones sin disparar resize/visualViewport
 * de forma confiable. No-op si matrix no está corriendo.
 */
export function resizeMatrix(): void {
  if (!canvas) return;
  // Igual que en startMatrix: esperar un frame para medir después de que el
  // cambio de vista (terminal <-> normal) termine de asentar el layout.
  requestAnimationFrame(() => {
    applyCanvasSize();
    initDrops();
  });
}

// El ancho no sufre el problema de la barra de direcciones dinámica (esa
// solo afecta el alto), y visualViewport.width EXCLUYE el ancho del
// scrollbar vertical clásico — dejaba una franja sin cubrir en vista normal
// con contenido scrolleable. innerWidth sí lo incluye.
function viewportWidth(): number {
  return window.innerWidth;
}

function viewportHeight(): number {
  return window.visualViewport?.height ?? window.innerHeight;
}

function handleEscape(e: KeyboardEvent): void {
  if (e.key === "Escape") stopMatrix();
}

/** Detiene la animación y limpia el canvas del DOM (no-op si no está corriendo). */
export function stopMatrix(): void {
  running = false;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  document.removeEventListener("keydown", handleEscape);
  if (window.visualViewport) {
    window.visualViewport.removeEventListener("resize", handleViewportChange);
    window.visualViewport.removeEventListener("scroll", handleViewportChange);
  } else {
    window.removeEventListener("resize", handleResize);
  }
  if (viewportDebounceId !== null) {
    clearTimeout(viewportDebounceId);
    viewportDebounceId = null;
  }
  canvas?.remove();
  canvas = null;
  debugEl?.remove();
  debugEl = null;
}
