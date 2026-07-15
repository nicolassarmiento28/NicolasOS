export interface CommandResult {
  output: string; // texto/HTML a mostrar en el terminal, ya escapado si viene de input de usuario
  clearScreen?: boolean; // true solo para el comando `clear`
}
