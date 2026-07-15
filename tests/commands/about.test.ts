import { describe, it, expect } from "vitest";
import { aboutCommand } from "../../src/commands/about";
import { profile } from "../../src/data/content";

describe("aboutCommand", () => {
  it("devuelve la bio real de content.ts", () => {
    const result = aboutCommand([]);
    expect(result.output).toBe(profile.bio);
  });

  it("ignora argumentos extra", () => {
    const result = aboutCommand(["algo"]);
    expect(result.output).toBe(profile.bio);
  });
});
