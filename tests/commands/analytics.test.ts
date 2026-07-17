import { describe, it, expect, beforeEach } from "vitest";
import { analyticsCommand } from "../../src/commands/analytics";
import { Analytics } from "../../src/core/analytics";

describe("analyticsCommand", () => {
  beforeEach(() => localStorage.clear());

  it("arranca desactivada por default", () => {
    expect(Analytics.isEnabled()).toBe(false);
    const result = analyticsCommand([]);
    expect(result.output).toMatch(/desactivada/i);
  });

  it("'analytics on' activa el opt-in", () => {
    const result = analyticsCommand(["on"]);
    expect(result.output).toMatch(/activada/i);
    expect(Analytics.isEnabled()).toBe(true);
  });

  it("'analytics off' desactiva el opt-in", () => {
    Analytics.enable();
    const result = analyticsCommand(["off"]);
    expect(result.output).toMatch(/desactivada/i);
    expect(Analytics.isEnabled()).toBe(false);
  });
});
