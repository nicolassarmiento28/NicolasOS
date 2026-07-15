import type { CommandResult } from "./types";

/** Easter egg — no hay lógica de permisos real. */
export function sudoCommand(_args: string[]): CommandResult {
  return { output: "Permission denied: this isn't that kind of OS." };
}
