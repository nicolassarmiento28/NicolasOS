import type { CommandResult } from "./types";
import { contact } from "../data/content";

/** Info de contacto. */
export function contactCommand(_args: string[]): CommandResult {
  return { output: `Email: ${contact.email}` };
}
