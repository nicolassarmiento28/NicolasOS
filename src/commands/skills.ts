import type { CommandResult } from "./types";
import { skills } from "../data/content";

/** Grid de tecnologías por categoría. */
export function skillsCommand(_args: string[]): CommandResult {
  const frontend = skills.frontend.map((s) => s.name).join(", ");
  const backend = skills.backend.map((s) => s.name).join(", ");
  const ia = skills.ia.join(", ");
  const output = [
    `Frontend: ${frontend}`,
    `Backend: ${backend}`,
    `IA/agentes: ${ia}`,
  ].join("\n");
  return { output };
}
