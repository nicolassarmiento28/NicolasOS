import type { CommandResult } from "./types";
import { contact } from "../data/content";

/** Abre el perfil de LinkedIn en una nueva pestaña. */
export function linkedinCommand(_args: string[]): CommandResult {
  window.open(contact.linkedin, "_blank", "noopener,noreferrer");
  return { output: "Abriendo LinkedIn..." };
}
