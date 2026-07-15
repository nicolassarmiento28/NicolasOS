import type { CommandResult } from "./types";
import { PROJECTS } from "./projects";

/** Abre el link del proyecto n (1-indexado) en una nueva pestaña. */
export function openCommand(args: string[]): CommandResult {
  const raw = args[0];
  const index = Number(raw);

  if (raw === undefined || !Number.isInteger(index)) {
    return { output: `Uso: open <n> — n debe ser un número entero.` };
  }

  const project = PROJECTS[index - 1];
  if (!project) {
    return {
      output: `No existe el proyecto ${raw}. Usá "projects" para ver la lista.`,
    };
  }

  window.open(project.url, "_blank", "noopener,noreferrer");
  return { output: `Abriendo ${project.nombre}...` };
}
