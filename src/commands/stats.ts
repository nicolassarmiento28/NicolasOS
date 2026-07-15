import type { CommandResult } from "./types";
import { Analytics } from "../core/analytics";

/** Muestra el conteo local de uso de comandos (sin red, sin cookies de terceros). */
export function statsCommand(_args: string[]): CommandResult {
  const counts = Object.entries(Analytics.getCounts()).sort((a, b) => b[1] - a[1]);
  if (counts.length === 0) {
    return { output: "Todavía no hay estadísticas de uso." };
  }
  return {
    output: counts.map(([cmd, n]) => `${cmd}: ${n}`).join("\n"),
  };
}
