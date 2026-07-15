/** Mensaje para un comando no reconocido, según specs/03-temas.md.
 * Si el texto coincide con un nombre de tema, sugiere "theme <nombre>"
 * en vez del mensaje plano de "comando no encontrado". */
export function unknownCommandMessage(cmd: string, themeNames: readonly string[]): string {
  if (themeNames.includes(cmd)) {
    return `Comando no encontrado: ${cmd}. ¿Quisiste decir "theme ${cmd}"?`;
  }
  return `Comando no encontrado: ${cmd}. Escribe "help" para ver la lista.`;
}
