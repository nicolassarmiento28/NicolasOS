import { describe, it, expect, beforeEach } from "vitest";
import { Analytics } from "../../src/core/analytics";

describe("Analytics", () => {
  beforeEach(() => localStorage.clear());

  it("incrementa el contador de un comando", () => {
    Analytics.track("help");
    Analytics.track("help");
    Analytics.track("about");
    expect(Analytics.getCounts()).toEqual({ help: 2, about: 1 });
  });

  it("persiste en localStorage (no cookies, no red)", () => {
    Analytics.track("projects");
    const raw = localStorage.getItem("nicolasos:command-counts");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual({ projects: 1 });
  });

  it("ignora comandos vacíos", () => {
    Analytics.track("");
    expect(Analytics.getCounts()).toEqual({});
  });
});
