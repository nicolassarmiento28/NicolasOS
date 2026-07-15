import { describe, it, expect, vi, beforeEach } from "vitest";
import { openCommand } from "../../src/commands/open";
import { PROJECTS } from "../../src/commands/projects";

describe("openCommand", () => {
  beforeEach(() => {
    vi.stubGlobal("open", vi.fn());
  });

  it("abre el link del proyecto para un índice válido", () => {
    const result = openCommand(["1"]);
    expect(window.open).toHaveBeenCalledWith(
      PROJECTS[0].url,
      "_blank",
      "noopener,noreferrer",
    );
    expect(result.output).toContain(PROJECTS[0].nombre);
  });

  it("devuelve error para índice fuera de rango, sin llamar window.open", () => {
    const result = openCommand(["999"]);
    expect(window.open).not.toHaveBeenCalled();
    expect(result.output.length).toBeGreaterThan(0);
  });

  it("devuelve error para índice no numérico, sin llamar window.open", () => {
    const result = openCommand(["abc"]);
    expect(window.open).not.toHaveBeenCalled();
    expect(result.output.length).toBeGreaterThan(0);
  });
});
