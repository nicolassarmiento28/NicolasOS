import { describe, it, expect, vi, beforeEach } from "vitest";
import { linkedinCommand } from "../../src/commands/linkedin";
import { contact } from "../../src/data/content";

describe("linkedinCommand", () => {
  beforeEach(() => {
    vi.stubGlobal("open", vi.fn());
  });

  it("abre el perfil real de LinkedIn en una nueva pestaña de forma segura", () => {
    const result = linkedinCommand([]);
    expect(window.open).toHaveBeenCalledWith(
      contact.linkedin,
      "_blank",
      "noopener,noreferrer",
    );
    expect(result.output.length).toBeGreaterThan(0);
  });
});
