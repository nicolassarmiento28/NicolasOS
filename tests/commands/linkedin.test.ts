import { describe, it, expect, vi, beforeEach } from "vitest";
import { linkedinCommand } from "../../src/commands/linkedin";

describe("linkedinCommand", () => {
  beforeEach(() => {
    vi.stubGlobal("open", vi.fn());
  });

  it("abre el perfil de LinkedIn en una nueva pestaña", () => {
    const result = linkedinCommand([]);
    expect(window.open).toHaveBeenCalledWith(
      "https://linkedin.com/in/placeholder",
      "_blank",
      "noopener,noreferrer",
    );
    expect(result.output.length).toBeGreaterThan(0);
  });
});
