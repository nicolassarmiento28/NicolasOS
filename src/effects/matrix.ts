/** Animación de lluvia de código estilo Matrix, en un canvas fixed detrás del terminal. */

const CHARS = "アイウエオカキクケコサシスセソ0123456789ABCDEF";
const FONT_SIZE = 16;

let canvas: HTMLCanvasElement | null = null;
let rafId: number | null = null;

/** ¿Está la animación corriendo? Consultable por el comando para hacer toggle. */
export function isMatrixRunning(): boolean {
  return rafId !== null;
}

/** Arranca la animación (no-op si ya está corriendo). */
export function startMatrix(): void {
  if (isMatrixRunning()) return;

  canvas = document.createElement("canvas");
  canvas.id = "matrix-canvas";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  // #terminal es position:static (src/style.css) sin z-index propio, así
  // que CUALQUIER z-index positivo en un elemento posicionado (fixed) pinta
  // por encima de contenido static, sin importar el valor. Solo un z-index
  // NEGATIVO corre detrás de contenido static, sin tapar prompt/output/input.
  canvas.style.zIndex = "-1";
  canvas.style.pointerEvents = "none";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const columns = Math.floor(canvas.width / FONT_SIZE);
  const drops = new Array(columns).fill(1);

  function draw(): void {
    if (!ctx || !canvas) return;
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff41";
    ctx.font = `${FONT_SIZE}px monospace`;
    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      ctx.fillText(char, i * FONT_SIZE, drops[i] * FONT_SIZE);
      if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
    rafId = requestAnimationFrame(draw);
  }

  rafId = requestAnimationFrame(draw);
  document.addEventListener("keydown", handleEscape);
}

function handleEscape(e: KeyboardEvent): void {
  if (e.key === "Escape") stopMatrix();
}

/** Detiene la animación y limpia el canvas del DOM (no-op si no está corriendo). */
export function stopMatrix(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  document.removeEventListener("keydown", handleEscape);
  canvas?.remove();
  canvas = null;
}
