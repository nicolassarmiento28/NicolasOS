import { describe, it, expect } from "vitest";
import { unknownCommandMessage } from "../../src/core/suggest";

describe("unknownCommandMessage", () => {
  it("sugiere theme <nombre> si el comando coincide con un nombre de tema", () => {
    const msg = unknownCommandMessage("cyberpunk", ["cyberpunk", "linux", "dos"]);
    expect(msg).toContain('theme cyberpunk');
    expect(msg).not.toContain("Escribe");
  });

  it("devuelve el mensaje plano si no coincide con ningún tema ni comando", () => {
    const msg = unknownCommandMessage("foo", ["cyberpunk", "linux", "dos"]);
    expect(msg).toContain("Comando no encontrado: foo");
    expect(msg).toContain("help");
  });

  const commandNames = ["help", "whoami", "about", "projects", "open", "skills", "resume"];

  it("sugiere el comando real más cercano a distancia de edición 1", () => {
    const msg = unknownCommandMessage("hlep", [], commandNames);
    expect(msg).toContain('"help"');
  });

  it("sugiere el comando real más cercano a distancia de edición 2", () => {
    const msg = unknownCommandMessage("projcts", [], commandNames);
    expect(msg).toContain('"projects"');
  });

  it("no sugiere nada si la distancia es mayor a 2", () => {
    const msg = unknownCommandMessage("xyzxyz", [], commandNames);
    expect(msg).not.toContain("quisiste");
    expect(msg).toContain("Comando no encontrado: xyzxyz");
  });

  it("prioriza la sugerencia de tema sobre la de comando si ambas aplican", () => {
    const msg = unknownCommandMessage("linux", ["linux"], ["linux"]);
    expect(msg).toContain("theme linux");
  });
});
