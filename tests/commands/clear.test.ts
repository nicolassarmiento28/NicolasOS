import { describe, it, expect } from "vitest";
import { clearCommand } from "../../src/commands/clear";

describe("clearCommand", () => {
  it("devuelve clearScreen: true", () => {
    const result = clearCommand([]);
    expect(result.clearScreen).toBe(true);
  });
});
