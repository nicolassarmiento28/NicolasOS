import { describe, it, expect, vi, beforeEach } from "vitest";
import { resumeCommand } from "../../src/commands/resume";

describe("resumeCommand", () => {
  beforeEach(() => {
    vi.stubGlobal("open", vi.fn());
  });

  it("no abre ningún link y avisa que el CV no está disponible (content.ts define resumeUrl como undefined)", () => {
    const result = resumeCommand([]);
    expect(window.open).not.toHaveBeenCalled();
    expect(result.output).toBe("CV no disponible todavía.");
  });
});
