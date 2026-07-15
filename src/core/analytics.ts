const STORAGE_KEY = "nicolasos:command-counts";

/** Analítica local de uso de comandos: sin red, sin cookies, sin PII — solo
 * nombre de comando y contador, persistido en localStorage del navegador. */
export const Analytics = {
  /** Incrementa el contador del comando ejecutado. */
  track(cmd: string): void {
    if (!cmd) return;
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
