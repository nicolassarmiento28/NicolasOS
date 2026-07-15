import { describe, it, expect, vi, beforeEach } from "vitest";
import { githubCommand } from "../../src/commands/github";
import { contact } from "../../src/data/content";

describe("githubCommand", () => {
  beforeEach(() => {
    vi.stubGlobal("open", vi.fn());
  });

  it("abre el perfil real de GitHub en una nueva pestaña de forma segura", () => {
    const result = githubCommand([]);
    expect(window.open).toHaveBeenCalledWith(
      contact.github,
      "_blank",
      "noopener,noreferrer",
    );
    expect(result.output.length).toBeGreaterThan(0);
  });
});
