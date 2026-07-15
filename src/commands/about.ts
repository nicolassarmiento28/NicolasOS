import type { CommandResult } from "./types";
import { profile } from "../data/content";

export function aboutCommand(_args: string[]): CommandResult {
  return { output: profile.bio };
}
