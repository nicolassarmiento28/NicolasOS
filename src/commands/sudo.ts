import type { CommandResult } from "./types";

/** Easter egg — no hay lógica de permisos real. */
export function sudoCommand(_args: string[]): CommandResult {
  return { output: "Permiso denegado: este no es ese tipo de OS" };
}
