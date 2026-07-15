import { describe, it, expect, vi, beforeEach } from "vitest";
import { resumeCommand } from "../../src/commands/resume";
import { resumeUrl } from "../../src/data/content";

describe("resumeCommand", () => {
  beforeEach(() => {
    vi.stubGlobal("open", vi.fn());
  });

  it("abre el CV en una nueva pestaña con noopener,noreferrer (content.ts define resumeUrl)", () => {
    const result = resumeCommand([]);
    expect(window.open).toHaveBeenCalledWith(resumeUrl, "_blank", "noopener,noreferrer");
    expect(result.output).toBe("Abriendo CV...");
  });
});
