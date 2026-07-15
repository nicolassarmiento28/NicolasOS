import type { CommandResult } from "./types";

// ponytail: placeholder — URL real la define content en 04-contenido.md
const RESUME_URL = "/cv.pdf";

/** Abre/descarga el CV en una nueva pestaña. */
export function resumeCommand(_args: string[]): CommandResult {
  window.open(RESUME_URL, "_blank", "noopener,noreferrer");
  return { output: "Abriendo CV..." };
}
