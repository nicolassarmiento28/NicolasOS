import type { CommandResult } from "./types";
import { contact } from "../data/content";

/** Abre el perfil de GitHub en una nueva pestaña. */
export function githubCommand(_args: string[]): CommandResult {
  window.open(contact.github, "_blank", "noopener,noreferrer");
  return { output: "Abriendo GitHub..." };
}
