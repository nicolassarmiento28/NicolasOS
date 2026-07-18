export interface AutocompleteResult {
  /** único comando que matchea el prefijo, si lo hay */
  match?: string;
  /** todas las coincidencias, para listarlas cuando hay ambigüedad (>1) */
  options: string[];
}

/**
 * Autocompletado de Tab (specs/11-mejoras-interaccion.md #1): busca entre
 * `names` (comandos + alias) los que empiezan con `partial`. Una sola
 * coincidencia -> `match`. Ninguna o varias -> sin `match`, listadas en
 * `options` para que el caller decida (main.ts imprime, no autocompleta a ciegas).
 */
export function autocompleteCommand(
  partial: string,
  names: readonly string[],
): AutocompleteResult {
  const prefix = partial.trim().toLowerCase();
  if (!prefix) return { options: [] };
  const options = names.filter((name) => name.startsWith(prefix));
  return options.length === 1 ? { match: options[0], options } : { options };
}
