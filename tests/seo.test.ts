import { describe, expect, it } from "vitest";
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
});
