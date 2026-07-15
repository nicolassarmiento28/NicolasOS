/** Loop ambiental de fondo con Web Audio API (sin asset externo). Opt-in explícito, nunca autoplay. */

const VOLUME = 0.05; // bajo por default

let ctx: AudioContext | null = null;
let oscillators: OscillatorNode[] = [];
let gainNode: GainNode | null = null;

/** ¿Está sonando la música? Consultable por el comando para hacer toggle. */
export function isMusicPlaying(): boolean {
  return ctx !== null;
}

/** Arranca el loop ambiental (no-op si ya está sonando). Requiere acción explícita del usuario. */
export function startMusic(): void {
  if (isMusicPlaying()) return;

  ctx = new AudioContext();
  gainNode = ctx.createGain();
  gainNode.gain.value = VOLUME;
  gainNode.connect(ctx.destination);

  // acorde simple sostenido en vez de asset de audio real
  const freqs = [220, 277.18, 329.63]; // A3, C#4, E4
  oscillators = freqs.map((freq) => {
    const osc = ctx!.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gainNode!);
    osc.start();
    return osc;
  });
}

/** Detiene el loop y libera el AudioContext (no-op si no está sonando). */
export function stopMusic(): void {
  oscillators.forEach((osc) => osc.stop());
  oscillators = [];
  gainNode = null;
  ctx?.close();
  ctx = null;
}
