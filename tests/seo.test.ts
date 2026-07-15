import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { profile, projects } from "../src/data/content";
// Import ?raw: lee index.html como texto plano, sin ejecutar JS ni DOM,
// confirmando que el contenido SEO está en el HTML fuente (specs/05-seo-fallback.md).
import html from "../index.html?raw";

describe("SEO fallback estático en index.html", () => {
  it("incluye la bio real del perfil", () => {
    const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
    expect(normalize(html)).toContain(normalize(profile.bio));
  });

  it("incluye los nombres de los 6 proyectos reales", () => {
    expect(projects).toHaveLength(6);
    for (const project of projects) {
      expect(html).toContain(project.name);
    }
  });

  it("incluye meta tags Open Graph básicos", () => {
    expect(html).toMatch(/property="og:title"/);
    expect(html).toMatch(/property="og:description"/);
    expect(html).toMatch(/property="og:type"/);
  });

  it("incluye og:url y og:image con valores absolutos no vacíos", () => {
    const urlMatch = html.match(/property="og:url" content="([^"]+)"/);
    const imageMatch = html.match(/property="og:image" content="([^"]+)"/);
    expect(urlMatch?.[1]).toMatch(/^https?:\/\//);
    expect(imageMatch?.[1]).toMatch(/^https?:\/\//);
  });

  it("el archivo referenciado por og:image existe en public/", () => {
    const imageMatch = html.match(/property="og:image" content="[^"]*\/([^"/]+)"/);
    expect(imageMatch?.[1]).toBeTruthy();
    expect(existsSync(`public/${imageMatch![1]}`)).toBe(true);
  });
});

describe("CSP en index.html (specs/08-seguridad.md)", () => {
  it("define un meta tag CSP que restringe script-src al propio origen", () => {
    const cspMatch = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/);
    expect(cspMatch?.[1]).toBeTruthy();
    const csp = cspMatch![1];
    expect(csp).toMatch(/script-src[^;]*'self'/);
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-eval'/);
  });
});
