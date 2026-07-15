import type { CommandResult } from "./types";

// ponytail: placeholder — datos reales los define content en 04-contenido.md
const EMAIL = "contacto@ejemplo.com";

/** Info de contacto (v1, placeholder). */
export function contactCommand(_args: string[]): CommandResult {
  return { output: `Email: ${EMAIL}` };
}
