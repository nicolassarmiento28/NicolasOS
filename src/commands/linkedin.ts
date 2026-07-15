import type { CommandResult } from "./types";

// ponytail: placeholder — URL real la define content en 04-contenido.md
const LINKEDIN_URL = "https://linkedin.com/in/placeholder";

/** Abre el perfil de LinkedIn en una nueva pestaña. */
export function linkedinCommand(_args: string[]): CommandResult {
  window.open(LINKEDIN_URL, "_blank", "noopener,noreferrer");
  return { output: "Abriendo LinkedIn..." };
}
