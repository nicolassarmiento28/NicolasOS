/**
 * Lluvia de código ambiental para el tema hacker (specs/06-effects-v2.md).
 * Capa de fondo permanente, opacity muy baja, detrás del panel de terminal —
 * DISTINTA del comando `matrix` (src/effects/matrix.ts, easter egg a pantalla
 * completa con su propio canvas). No comparte estado ni módulo con ese.
 */

const CHARS = "01アイウエオカキクケコ";
const FONT_SIZE = 14;

let canvas: HTMLCanvasElement | null = null;
let rafId: number | null = null;
let frame = 0;

export function isAmbientRainRunning(): boolean {
  return rafId !== null;
}

/** Arranca la lluvia ambiental (no-op si ya corre o si el usuario prefiere menos movimiento). */
export function startAmbientRain(): void {
  if (isAmbientRainRunning()) return;
  // accesibilidad: prefers-reduced-motion → directamente no arrancamos la capa,
  // no hace falta una variante "reducida" para una decoración de fondo.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  canvas = document.createElement("canvas");
  canvas.id = "ambient-rain-canvas";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  // z-index -2: detrás del canvas del comando `matrix` (-1) y de todo el
  // contenido static del terminal (mismo truco que src/effects/matrix.ts).
  canvas.style.zIndex = "-2";
  canvas.style.pointerEvents = "none";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const columns = Math.floor(canvas.width / FONT_SIZE);
  const drops = new Array(columns).fill(0).map(() => Math.random() * -50);

  function draw(): void {
    if (!ctx || !canvas) return;
    frame++;
    // ponytail: solo redibuja 1 de cada 4 frames → lento y liviano, sin
    // setInterval propio ni bloquear el hilo principal/input del terminal.
    if (frame % 4 === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 255, 65, 0.07)";
      ctx.font = `${FONT_SIZE}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(char, i * FONT_SIZE, drops[i] * FONT_SIZE);
        drops[i] = drops[i] * FONT_SIZE > canvas.height ? 0 : drops[i] + 0.4;
      }
    }
    rafId = requestAnimationFrame(draw);
  }

  rafId = requestAnimationFrame(draw);
}

/** Detiene la lluvia ambiental y limpia el canvas (no-op si no está corriendo). */
export function stopAmbientRain(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  canvas?.remove();
  canvas = null;
}
