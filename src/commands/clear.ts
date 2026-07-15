import type { CommandResult } from "./types";

/** Limpia la pantalla de la terminal. */
export function clearCommand(_args: string[]): CommandResult {
  return { output: "", clearScreen: true };
}
