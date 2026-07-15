import type { CommandResult } from "./types";

// ponytail: 03-temas.md todavía no está implementado (src/themes/ no existe).
// Este comando solo lista los nombres previstos; "theme <n>" para cambiar el
// tema activo se conecta cuando exista el sistema de temas real.
const THEMES = ["cyberpunk", "linux", "dos"];

/** Lista los temas disponibles (placeholder, sin lógica de cambio real). */
export function themeCommand(_args: string[]): CommandResult {
  return { output: `Temas disponibles: ${THEMES.join(", ")}` };
}
