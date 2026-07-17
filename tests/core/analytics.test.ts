import { describe, it, expect, beforeEach } from "vitest";
import { Analytics } from "../../src/core/analytics";

describe("Analytics", () => {
  beforeEach(() => localStorage.clear());

  it("arranca desactivado: track() sin opt-in no escribe nada en localStorage (specs/08-seguridad.md)", () => {
    expect(Analytics.isEnabled()).toBe(false);
    Analytics.track("help");
    Analytics.track("about");
    expect(localStorage.getItem("nicolasos:command-counts")).toBeNull();
    expect(Analytics.getCounts()).toEqual({});
  });

  it("incrementa el contador de un comando solo tras opt-in explícito", () => {
    Analytics.enable();
    Analytics.track("help");
    Analytics.track("help");
    Analytics.track("about");
    expect(Analytics.getCounts()).toEqual({ help: 2, about: 1 });
  });

  it("persiste en localStorage (no cookies, no red) tras opt-in", () => {
    Analytics.enable();
    Analytics.track("projects");
    const raw = localStorage.getItem("nicolasos:command-counts");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual({ projects: 1 });
  });

  it("ignora comandos vacíos", () => {
    Analytics.enable();
    Analytics.track("");
    expect(Analytics.getCounts()).toEqual({});
  });

  it("disable() detiene el tracking sin borrar el historial ya acumulado", () => {
    Analytics.enable();
    Analytics.track("help");
    Analytics.disable();
    Analytics.track("about");
    expect(Analytics.getCounts()).toEqual({ help: 1 });
  });
});
