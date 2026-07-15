import type { CommandResult } from "./types";
import { projects } from "../data/content";

/** Lista numerada de proyectos. */
export function projectsCommand(_args: string[]): CommandResult {
  const output = projects
    .map((p, i) => `${i + 1}. ${p.name} - ${p.desc}`)
    .join("\n");
  return { output };
}
