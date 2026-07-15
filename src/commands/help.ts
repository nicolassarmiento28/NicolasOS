import type { CommandResult } from "./types";

// lista de comandos disponibles (v1)
export const COMMANDS = [
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

/** Lista los comandos disponibles como chips tappeables (spec 01-onboarding-ux.md). */
export function helpCommand(_args: string[]): CommandResult {
  const chips = COMMANDS.map(
    (c) => `<button type="button" class="chip" data-cmd="${c}">${c}</button>`,
  ).join(" ");
  return { output: chips, html: true };
}
