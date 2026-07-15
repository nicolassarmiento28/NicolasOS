import { describe, it, expect, vi, beforeEach } from "vitest";
import { resumeCommand } from "../../src/commands/resume";

describe("resumeCommand", () => {
  beforeEach(() => {
    vi.stubGlobal("open", vi.fn());
  });

  it("abre el CV en una nueva pestaña", () => {
    const result = resumeCommand([]);
    expect(window.open).toHaveBeenCalledWith(
      "/cv.pdf",
      "_blank",
      "noopener,noreferrer",
    );
    expect(result.output.length).toBeGreaterThan(0);
  });
});
