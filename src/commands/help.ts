import type { CommandResult } from "./types";

// ponytail: lista de texto plano; chips tappeables son tarea de 01-onboarding-ux.md
const COMMANDS = [
  "help",
  "whoami",
  "about",
  "projects",
  "open",
  "skills",
  "resume",
  "contact",
  "github",
  "linkedin",
  "theme",
  "clear",
  "history",
  "sudo",
];

/** Lista los comandos disponibles (v1). */
export function helpCommand(_args: string[]): CommandResult {
  return { output: COMMANDS.join("\n") };
}
