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
    window.visualViewport.addEventListener("resize", handleResize);
  } else {
    window.addEventListener("resize", handleResize);
  }
}

function startDrawLoop(ctx: CanvasRenderingContext2D, myGeneration: number): void {
  const columns = Math.floor(logicalWidth / FONT_SIZE);
  const drops = new Array(columns).fill(1);

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
}

/** Redimensiona el canvas al viewport visible actual (mobile: barra de direcciones dinámica). */
function handleResize(): void {
  if (!canvas) return;
  applyCanvasSize();
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
  requestAnimationFrame(applyCanvasSize);
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
    window.visualViewport.removeEventListener("resize", handleResize);
  } else {
    window.removeEventListener("resize", handleResize);
  }
  canvas?.remove();
  canvas = null;
}
