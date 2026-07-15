import { describe, it, expect } from "vitest";
import { unknownCommandMessage } from "../../src/core/suggest";

describe("unknownCommandMessage", () => {
  it("sugiere theme <nombre> si el comando coincide con un nombre de tema", () => {
    const msg = unknownCommandMessage("cyberpunk", ["cyberpunk", "linux", "dos"]);
    expect(msg).toContain('theme cyberpunk');
    expect(msg).not.toContain("Escribe");
  });

  it("devuelve el mensaje plano si no coincide con ningún tema", () => {
    const msg = unknownCommandMessage("foo", ["cyberpunk", "linux", "dos"]);
    expect(msg).toContain("Comando no encontrado: foo");
    expect(msg).toContain("help");
  });
});
