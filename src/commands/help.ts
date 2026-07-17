import type { CommandResult } from "./types";
import { COMMAND_NAMES } from "../core/registry";

// Agrupación visual de chips por categoría (specs/10-diseno-visual.md).
// Comandos no listados acá (ej. uno agregado al registry sin categorizar)
// caen en "extra" por defecto, para no romper la regresión de
// "refleja un comando nuevo sin tocar help.ts".
const CATEGORIES: { label: string; cmds: string[]; extra?: boolean }[] = [
  { label: "info", cmds: ["about", "whoami", "skills", "projects"] },
  { label: "contacto", cmds: ["contact", "github", "linkedin", "resume"] },
  { label: "sistema", cmds: ["theme", "clear", "history", "view"] },
  { label: "extra", cmds: ["sudo", "matrix", "music", "stats"], extra: true },
];

function chip(cmd: string, extra: boolean): string {
  const cls = extra ? "chip chip-extra" : "chip";
  return `<button type="button" class="${cls}" data-cmd="${cmd}">${cmd}</button>`;
}

/** Lista los comandos disponibles como chips tappeables, agrupados por categoría (spec 01-onboarding-ux.md, 10-diseno-visual.md). */
export function helpCommand(_args: string[]): CommandResult {
  const known = new Set(CATEGORIES.flatMap((g) => g.cmds));
  const uncategorized = COMMAND_NAMES.filter((c) => !known.has(c));
  const groups = CATEGORIES.map((g) => {
    const cmds = g.cmds.filter((c) => COMMAND_NAMES.includes(c));
    const extraCmds = g.extra ? [...cmds, ...uncategorized] : cmds;
    return `<div class="chip-group"><div class="chip-group-label">${g.label}</div>${extraCmds
      .map((c) => chip(c, !!g.extra))
      .join(" ")}</div>`;
  });
  return { output: groups.join(""), html: true };
}
