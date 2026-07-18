import type { CommandResult } from "./types";
import { enableSound, disableSound, isSoundEnabled } from "../effects/sound";

/** Activa/desactiva el sonido de tecleo (`sound on|off`). Opt-in explícito,
 * arranca desactivado, sin toggle implícito si no se pasa argumento. */
export function soundCommand(args: string[]): CommandResult {
  const arg = args[0]?.toLowerCase();
  if (arg === "on") {
    enableSound();
    return { output: "Sonido de tecleo activado. Usa 'sound off' para desactivar." };
  }
  if (arg === "off") {
    disableSound();
    return { output: "Sonido de tecleo desactivado." };
  }
  return {
    output: `Sonido de tecleo ${isSoundEnabled() ? "activado" : "desactivado"}. Uso: sound on | sound off`,
  };
}
