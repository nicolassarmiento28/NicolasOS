/** Tecleo con sonido corto vía Web Audio API (sin asset externo). Opt-in explícito, nunca autoplay. */

const VOLUME = 0.03; // bajo por default
const CLICK_DURATION = 0.03; // segundos, sonido corto tipo "click"

let enabled = false; // vive solo en memoria de sesión, sin persistencia (mismo criterio que analytics.ts)
let ctx: AudioContext | null = null;
let currentOsc: OscillatorNode | null = null;

/** ¿Está activado el sonido de tecleo? */
export function isSoundEnabled(): boolean {
  return enabled;
}

/** Activa el sonido de tecleo (requiere acción explícita del usuario). */
export function enableSound(): void {
  enabled = true;
}

/** Desactiva el sonido de tecleo. */
export function disableSound(): void {
  enabled = false;
  stopCurrent();
}

function stopCurrent(): void {
  // anti-solapamiento: cancela el oscillator anterior antes de arrancar uno
  // nuevo, así tipear rápido no acumula nodos de audio sumándose/distorsionando.
  currentOsc?.stop();
  currentOsc = null;
}

/** Dispara un click corto por cada tecla. No-op si el sonido está desactivado. */
export function playKeystroke(): void {
  if (!enabled) return;

  stopCurrent();

  ctx ??= new AudioContext();
  void ctx.resume();

  const gainNode = ctx.createGain();
  gainNode.gain.value = VOLUME;
  gainNode.connect(ctx.destination);

  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.value = 600;
  osc.connect(gainNode);
  osc.start();
  osc.stop(ctx.currentTime + CLICK_DURATION);

  currentOsc = osc;
}
