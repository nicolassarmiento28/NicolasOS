// Boot log extendido estilo BIOS/Linux (specs/11-mejoras-interaccion.md #4).
// Corre ANTES del ASCII banner/hint (que main.ts ya renderiza de forma
// síncrona e inmediata — no se toca ese flujo, ver comentario en main.ts).
// Mismo efecto de tipeo que ya define specs/10-diseno-visual.md (24ms/char).

export const BOOT_LINES = [
  "Cargando módulos...  OK",
  "Montando filesystem...  OK",
  "Iniciando shell...  OK",
];

export const CHAR_DELAY_MS = 24;
// pausa breve entre líneas para que se lea como un boot log real, no un
// tipeo continuo sin pausas.
export const LINE_PAUSE_MS = 150;

/**
 * Duración total del boot sin saltar, en ms — inspeccionable/testeable sin
 * depender del reloj real (criterio de aceptación: 1.5-2.5s).
 */
export function bootDurationMs(): number {
  const typingMs = BOOT_LINES.reduce((sum, line) => sum + line.length * CHAR_DELAY_MS, 0);
  const pauseMs = LINE_PAUSE_MS * BOOT_LINES.length;
  return typingMs + pauseMs;
}

/**
 * Tipea BOOT_LINES dentro de `container`, una por una, y llama a
 * `onComplete` cuando termina. Devuelve `skip()`: cancela cualquier timer
 * pendiente y llama a `onComplete` de inmediato, sin dejar líneas a medio
 * tipear (el caller es responsable de vaciar/ocultar `container`).
 */
export function runBootSequence(container: HTMLElement, onComplete: () => void): () => void {
  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  let lineIndex = 0;

  function typeLine(text: string, done: () => void): void {
    const line = document.createElement("div");
    line.className = "boot-log-line";
    container.appendChild(line);
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      line.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) {
        timers.push(setTimeout(tick, CHAR_DELAY_MS));
      } else {
        timers.push(setTimeout(done, LINE_PAUSE_MS));
      }
    };
    tick();
  }

  function next(): void {
    if (cancelled) return;
    if (lineIndex >= BOOT_LINES.length) {
      onComplete();
      return;
    }
    const text = BOOT_LINES[lineIndex];
    lineIndex++;
    typeLine(text, next);
  }
  next();

  return function skip(): void {
    if (cancelled) return;
    cancelled = true;
    timers.forEach(clearTimeout);
    onComplete();
  };
}
