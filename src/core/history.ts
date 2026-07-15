/** Historial de sesión con navegación tipo shell (flecha arriba/abajo). */
export class History {
  private entries: string[] = [];
  private cursor = 0; // índice en entries; entries.length === línea vacía actual

  /** Agrega un comando ejecutado, evitando duplicar la entrada anterior consecutiva. */
  add(raw: string): void {
    const cmd = raw.trim();
    if (!cmd) return;
    if (this.entries[this.entries.length - 1] !== cmd) {
      this.entries.push(cmd);
    }
    this.reset();
  }

  /** Resetea el cursor de navegación al final (línea vacía). */
  reset(): void {
    this.cursor = this.entries.length;
  }

  /** Navega hacia atrás (comando anterior). */
  up(): string {
    if (this.cursor > 0) this.cursor -= 1;
    return this.entries[this.cursor] ?? "";
  }

  /** Navega hacia adelante (comando siguiente), vuelve a vacío al llegar al final. */
  down(): string {
    if (this.cursor < this.entries.length) this.cursor += 1;
    return this.entries[this.cursor] ?? "";
  }

  list(): readonly string[] {
    return this.entries;
  }
}
