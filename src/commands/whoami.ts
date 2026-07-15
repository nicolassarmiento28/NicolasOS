import type { CommandResult } from "./types";

// ponytail: placeholder — bio real la define content en 04-contenido.md
export function whoamiCommand(_args: string[]): CommandResult {
  return { output: "Nicolás Sarmiento — desarrollador" };
}
