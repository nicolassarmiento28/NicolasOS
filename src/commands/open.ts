import type { CommandResult } from "./types";
import { projects } from "../data/content";

/** Abre el link del proyecto n (1-indexado) en una nueva pestaña. Usa el deploy en vivo, o github si no hay. */
export function openCommand(args: string[]): CommandResult {
  const raw = args[0];
  const index = Number(raw);

  if (raw === undefined || !Number.isInteger(index)) {
    return { output: `Uso: open <n> — n debe ser un número entero.` };
  }

  const project = projects[index - 1];
  if (!project) {
    return {
      output: `No existe el proyecto ${raw}. Usa "projects" para ver la lista.`,
    };
  }

  const url = project.url || project.githubUrl;
  window.open(url, "_blank", "noopener,noreferrer");
  return { output: `Abriendo ${project.name}...` };
}
