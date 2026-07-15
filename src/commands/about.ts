import type { CommandResult } from "./types";

// ponytail: placeholder — bio real la define content en 04-contenido.md
export function aboutCommand(_args: string[]): CommandResult {
  return { output: "Desarrollador de software, construyendo NicolasOS." };
}
