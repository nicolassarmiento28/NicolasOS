const STORAGE_KEY = "nicolasos:command-counts";
const OPT_IN_KEY = "nicolasos:analytics-enabled";

/** Analítica local de uso de comandos: sin red, sin cookies, sin PII — solo
 * nombre de comando y contador, persistido en localStorage del navegador.
 * Arranca DESACTIVADA por default (specs/08-seguridad.md: opt-in explícito
 * para cualquier colección de datos del visitante). Mismo patrón que
 * `music`: nada se escribe hasta que el usuario corre `analytics on`. */
export const Analytics = {
  /** ¿El usuario dio opt-in explícito? */
  isEnabled(): boolean {
    return localStorage.getItem(OPT_IN_KEY) === "1";
  },

  /** Activa el tracking (acción explícita del usuario, comando `analytics on`). */
  enable(): void {
    localStorage.setItem(OPT_IN_KEY, "1");
  },

  /** Desactiva el tracking. No borra el historial ya acumulado. */
  disable(): void {
    localStorage.removeItem(OPT_IN_KEY);
  },

  /** Incrementa el contador del comando ejecutado. No-op si no hay opt-in. */
  track(cmd: string): void {
    if (!cmd || !this.isEnabled()) return;
    const counts = this.getCounts();
    counts[cmd] = (counts[cmd] ?? 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  },

  /** Devuelve el mapa comando -> veces ejecutado. */
  getCounts(): Record<string, number> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },
};
