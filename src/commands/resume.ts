import type { CommandResult } from "./types";
import { resumeUrl } from "../data/content";

/** Abre el CV en una nueva pestaña, o avisa si todavía no está disponible. */
export function resumeCommand(_args: string[]): CommandResult {
  if (!resumeUrl) {
    return { output: "CV no disponible todavía." };
  }
  window.open(resumeUrl, "_blank", "noopener,noreferrer");
  return { output: "Abriendo CV..." };
}
