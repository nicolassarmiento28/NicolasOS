import type { CommandResult } from "./types";

// ponytail: placeholder — historial real lo define content en 04-contenido.md
const EXPERIENCE = [
  { rol: "Frontend Developer", empresa: "Empresa Ejemplo S.A.", periodo: "2023 - presente" },
  { rol: "Junior Developer", empresa: "Otra Empresa", periodo: "2021 - 2023" },
];

/** Timeline laboral (v1, placeholder). */
export function experienceCommand(_args: string[]): CommandResult {
  const output = EXPERIENCE.map(
    (e) => `${e.periodo} — ${e.rol} @ ${e.empresa}`,
  ).join("\n");
  return { output };
}
