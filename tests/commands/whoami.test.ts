import { describe, it, expect } from "vitest";
import { whoamiCommand } from "../../src/commands/whoami";
import { profile } from "../../src/data/content";

describe("whoamiCommand", () => {
  it("devuelve identidad real de content.ts", () => {
    const result = whoamiCommand([]);
    expect(result.output).toContain(profile.name);
    expect(result.output).toContain(profile.title);
  });

  it("ignora argumentos extra", () => {
    const result = whoamiCommand(["algo"]);
    expect(result.output).toContain(profile.name);
  });
});
