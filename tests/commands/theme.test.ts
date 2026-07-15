import { describe, it, expect } from "vitest";
import { themeCommand } from "../../src/commands/theme";

describe("themeCommand", () => {
  it("lista los temas disponibles", () => {
    const result = themeCommand([]);
    expect(result.output).toContain("cyberpunk");
    expect(result.output).toContain("linux");
    expect(result.output).toContain("dos");
  });
});
