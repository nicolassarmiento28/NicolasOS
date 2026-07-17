import type { CommandResult } from "./types";
import { Analytics } from "../core/analytics";

/** Activa/desactiva la analítica local de uso (`analytics on|off`). Opt-in
 * explícito, nunca activada por default (specs/08-seguridad.md). */
export function analyticsCommand(args: string[]): CommandResult {
  const arg = args[0]?.toLowerCase();
  if (arg === "on") {
    Analytics.enable();
    return { output: "Analítica activada (uso local, sin red, sin cookies). Usa 'analytics off' para desactivar." };
  }
  if (arg === "off") {
    Analytics.disable();
    return { output: "Analítica desactivada." };
  }
  return {
    output: `Analítica local ${Analytics.isEnabled() ? "activada" : "desactivada"}. Uso: analytics on | analytics off`,
  };
}
