import type { CommandResult } from "./types";

// ponytail: placeholder — URL real la define content en 04-contenido.md
const GITHUB_URL = "https://github.com/placeholder";

/** Abre el perfil de GitHub en una nueva pestaña. */
export function githubCommand(_args: string[]): CommandResult {
  window.open(GITHUB_URL, "_blank", "noopener,noreferrer");
  return { output: "Abriendo GitHub..." };
}
