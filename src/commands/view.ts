import type { CommandResult } from "./types";

/** Alterna entre vista terminal y vista normal (`view` / `vista`), misma acción que el control □. */
export function viewCommand(_args: string[]): CommandResult {
  return { output: "", toggleView: true };
}
