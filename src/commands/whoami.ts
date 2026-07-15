import type { CommandResult } from "./types";
import { profile } from "../data/content";

export function whoamiCommand(_args: string[]): CommandResult {
  return { output: `${profile.name} — ${profile.title} (${profile.location})` };
}
