import type { CommandResult } from "./types";

// ponytail: placeholder — proyectos reales los define content en 04-contenido.md
export const PROJECTS = [
  {
    nombre: "NicolasOS",
    descripcion: "Portafolio terminal-style hecho con Vite + TypeScript.",
    url: "https://github.com/nicolassarmiento/nicolasos",
  },
  {
    nombre: "Proyecto Placeholder 2",
    descripcion: "Descripción de ejemplo, pendiente de contenido real.",
    url: "https://github.com/nicolassarmiento/placeholder-2",
  },
  {
    nombre: "Proyecto Placeholder 3",
    descripcion: "Descripción de ejemplo, pendiente de contenido real.",
    url: "https://github.com/nicolassarmiento/placeholder-3",
  },
];

/** Lista numerada de proyectos (v1, placeholder). */
export function projectsCommand(_args: string[]): CommandResult {
  const output = PROJECTS.map(
    (p, i) => `${i + 1}. ${p.nombre} - ${p.descripcion}`,
  ).join("\n");
  return { output };
}
