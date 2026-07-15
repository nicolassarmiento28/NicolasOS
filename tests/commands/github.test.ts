import { describe, it, expect, vi, beforeEach } from "vitest";
import { githubCommand } from "../../src/commands/github";

describe("githubCommand", () => {
  beforeEach(() => {
    vi.stubGlobal("open", vi.fn());
  });

  it("abre el perfil de GitHub en una nueva pestaña", () => {
    const result = githubCommand([]);
    expect(window.open).toHaveBeenCalledWith(
      "https://github.com/placeholder",
      "_blank",
      "noopener,noreferrer",
    );
    expect(result.output.length).toBeGreaterThan(0);
  });
});
