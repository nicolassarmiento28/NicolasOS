import type { CommandResult } from "./types";
import { startMatrix, stopMatrix, isMatrixRunning } from "../effects/matrix";

/** Alterna la animación de lluvia de código Matrix (`matrix` / `matriz`). */
export function matrixCommand(_args: string[]): CommandResult {
  if (isMatrixRunning()) {
    stopMatrix();
    return { output: "Matrix desactivado" };
  }
  startMatrix();
  return { output: "Matrix activado" };
}
