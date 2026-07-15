/** Distancia de edición (Levenshtein) entre dos strings. */
function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, (_, i) => [
    i,
    ...Array(cols - 1).fill(0),
  ]);
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[rows - 1][cols - 1];
}

/** Busca el comando real más parecido (distancia de edición 1-2). */
function closestCommand(cmd: string, commandNames: readonly string[]): string | undefined {
  let best: string | undefined;
  let bestDistance = Infinity;
  for (const name of commandNames) {
    const distance = levenshtein(cmd, name);
    if (distance <= 2 && distance < bestDistance) {
      best = name;
      bestDistance = distance;
    }
  }
  return best;
}

/** Mensaje para un comando no reconocido, según specs/03-temas.md y 01-onboarding-ux.md.
 * Si el texto coincide con un nombre de tema, sugiere "theme <nombre>".
 * Si no, y coincide (distancia de edición 1-2) con un comando real, sugiere ese comando.
 * En cualquier otro caso, devuelve el mensaje plano de "comando no encontrado". */
export function unknownCommandMessage(
  cmd: string,
  themeNames: readonly string[],
  commandNames: readonly string[] = [],
): string {
  if (themeNames.includes(cmd)) {
    return `Comando no encontrado: ${cmd}. ¿Quisiste decir "theme ${cmd}"?`;
  }
  const suggestion = closestCommand(cmd, commandNames);
  if (suggestion) {
    return `Comando no encontrado: ${cmd}. ¿Quisiste decir "${suggestion}"?`;
  }
  return `Comando no encontrado: ${cmd}. Escribe "help" para ver la lista.`;
}
