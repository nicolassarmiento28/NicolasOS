import type { CommandResult } from "./types";

// ponytail: placeholder — skills reales las define content en 04-contenido.md
const SKILLS = [
  "TypeScript",
  "JavaScript",
  "React",
  "Node.js",
  "Vite",
  "CSS",
  "Git",
];

/** Lista de tecnologías (v1, placeholder). */
export function skillsCommand(_args: string[]): CommandResult {
  return { output: SKILLS.join("\n") };
}
