export interface ParsedCommand {
  cmd: string;
  args: string[];
}

// alias ES (y "cv") -> comando canónico, según specs/02-comandos-core.md
// Map en vez de objeto plano: evita que "__proto__"/"constructor" resuelvan
// contra Object.prototype y devuelvan un objeto/función en vez de string.
const ALIASES: Map<string, string> = new Map([
  ["ayuda", "help"],
  ["proyectos", "projects"],
  ["abrir", "open"],
  ["cv", "resume"],
  ["contacto", "contact"],
  ["tema", "theme"],
  ["limpiar", "clear"],
  ["historial", "history"],
]);

/** Convierte una línea de input en { cmd, args }. Tolera mayúsculas, espacios extra y alias ES. */
export function parseInput(input: string): ParsedCommand {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  const [cmd = "", ...args] = tokens;
  const normalized = cmd.toLowerCase();
  return { cmd: ALIASES.get(normalized) ?? normalized, args };
}
