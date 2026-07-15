import type { CommandResult } from "./types";
import { COMMAND_NAMES } from "../core/registry";

/** Lista los comandos disponibles como chips tappeables (spec 01-onboarding-ux.md). */
export function helpCommand(_args: string[]): CommandResult {
  const chips = COMMAND_NAMES.map(
    (c) => `<button type="button" class="chip" data-cmd="${c}">${c}</button>`,
  ).join(" ");
  return { output: chips, html: true };
}
