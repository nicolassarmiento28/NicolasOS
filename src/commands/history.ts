import type { CommandResult } from "./types";

// ponytail: este comando rompe la firma estándar (args) => CommandResult
// a propósito, porque necesita el historial de sesión. En vez de importar
// un estado global compartido (prohibido por 02-comandos-core.md), lo recibe
// inyectado como segundo parámetro. Quien invoque los comandos (el motor,
// tarea futura) le pasa la lista de src/core/history.ts (History.list()).
/** Muestra los comandos usados en la sesión. */
export function historyCommand(
  _args: string[],
  sessionHistory: readonly string[] = [],
): CommandResult {
  if (sessionHistory.length === 0) {
    return { output: "No hay comandos en el historial todavía." };
  }
  return {
    output: sessionHistory
      .map((cmd, i) => `${i + 1}  ${cmd}`)
      .join("\n"),
  };
}
