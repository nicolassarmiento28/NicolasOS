import { beforeEach, describe, expect, it } from "vitest";
import { History } from "../../src/core/history";

describe("History", () => {
  let history: History;

  beforeEach(() => {
    history = new History();
  });

  it("no duplica entradas consecutivas idénticas", () => {
    history.add("help");
    history.add("help");
    expect(history.list()).toEqual(["help"]);
  });

  it("sí agrega la misma entrada si no es consecutiva", () => {
    history.add("help");
    history.add("about");
    history.add("help");
    expect(history.list()).toEqual(["help", "about", "help"]);
  });

  it("navega hacia arriba (comando anterior)", () => {
    history.add("help");
    history.add("about");
    expect(history.up()).toBe("about");
    expect(history.up()).toBe("help");
    // no hay más atrás, se queda en el primero
    expect(history.up()).toBe("help");
  });

  it("navega hacia abajo (comando siguiente) con reset a vacío", () => {
    history.add("help");
    history.add("about");
    history.up();
    history.up();
    expect(history.down()).toBe("about");
    expect(history.down()).toBe("");
  });

  it("resetea el cursor al ejecutar un comando nuevo", () => {
    history.add("help");
    history.add("about");
    history.up();
    history.add("projects");
    expect(history.up()).toBe("projects");
  });
});
