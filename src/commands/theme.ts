import type { CommandResult } from "./types";
import { applyTheme, THEMES } from "../themes/themes";

const THEME_NAMES = Object.keys(THEMES);

// Swatch de color por tema (specs/10-diseno-visual.md, "Swatch de color en el
// listado de `theme`"). THEME_NAMES viene de THEMES, no de input de usuario:
// seguro usar html: true acá.
function swatch(name: string): string {
  const tokens = THEMES[name];
  return (
    `<span style="display:inline-flex;align-items:center;gap:6px;margin-right:12px">` +
    `<span role="img" aria-label="Swatch de color del tema ${name}" ` +
    `style="display:inline-flex;width:14px;height:14px;border-radius:2px;` +
    `border:1px solid ${tokens.accent};overflow:hidden">` +
    `<span style="width:7px;height:100%;background:${tokens.bg}"></span>` +
    `<span style="width:7px;height:100%;background:${tokens.accent}"></span>` +
    `</span>${name}</span>`
  );
}

/** Lista los temas disponibles o cambia el tema activo (`theme <nombre>`). */
export function themeCommand(args: string[]): CommandResult {
  if (args.length === 0) {
    const swatches = THEME_NAMES.map(swatch).join("");
    return { output: `Temas disponibles: ${swatches}`, html: true };
  }
  const arg = args[0].toLowerCase();
  // acepta nombre o número de índice (1-based, según orden de listado)
  const index = Number(arg);
  const name = Number.isInteger(index) ? THEME_NAMES[index - 1] ?? arg : arg;
  if (!applyTheme(name)) {
    return {
      output: `Tema no encontrado: ${name}. Temas disponibles: ${THEME_NAMES.join(", ")}`,
    };
  }
  return { output: `Tema aplicado: ${name}` };
}
