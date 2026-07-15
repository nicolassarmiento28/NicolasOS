import type { CommandResult } from "./types";
import { applyTheme, THEMES } from "../themes/themes";

const THEME_NAMES = Object.keys(THEMES);

/** Lista los temas disponibles o cambia el tema activo (`theme <nombre>`). */
export function themeCommand(args: string[]): CommandResult {
  if (args.length === 0) {
    return { output: `Temas disponibles: ${THEME_NAMES.join(", ")}` };
  }
  const name = args[0].toLowerCase();
  if (!applyTheme(name)) {
    return {
      output: `Tema no encontrado: ${name}. Temas disponibles: ${THEME_NAMES.join(", ")}`,
    };
  }
  return { output: `Tema aplicado: ${name}` };
}
