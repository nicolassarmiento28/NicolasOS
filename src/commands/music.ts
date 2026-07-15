import type { CommandResult } from "./types";
import { startMusic, stopMusic, isMusicPlaying } from "../effects/music";

/** Alterna la música ambiental de fondo (`music` / `musica`). Opt-in explícito, nunca autoplay. */
export function musicCommand(args: string[]): CommandResult {
  if (args[0] === "stop") {
    stopMusic();
    return { output: "Música detenida" };
  }

  if (isMusicPlaying()) {
    stopMusic();
    return { output: "Música detenida" };
  }
  startMusic();
  return { output: "Música activada (uso: music stop para detener)" };
}
