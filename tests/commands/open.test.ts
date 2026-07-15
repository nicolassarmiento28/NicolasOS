import { describe, it, expect, vi, beforeEach } from "vitest";
import { openCommand } from "../../src/commands/open";
import { projects } from "../../src/data/content";

describe("openCommand", () => {
  beforeEach(() => {
    vi.stubGlobal("open", vi.fn());
  });

  it("abre el link en vivo del proyecto para un índice válido", () => {
    const result = openCommand(["1"]);
    expect(window.open).toHaveBeenCalledWith(
      projects[0].url,
      "_blank",
      "noopener,noreferrer",
    );
    expect(result.output).toContain(projects[0].name);
  });

  it("usa noopener,noreferrer al abrir el link", () => {
    openCommand(["1"]);
    const call = (window.open as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    expect(call[2]).toBe("noopener,noreferrer");
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
