import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import html from "../../index.html?raw";
import { openCommand } from "../../src/commands/open";
import { unknownCommandMessage } from "../../src/core/suggest";
import { projects } from "../../src/data/content";

const XSS_PAYLOAD = "<img src=x onerror=alert(1)>";

// Checklist final de tests (specs/08-seguridad.md líneas 51-111), 7 puntos.

describe("1. XSS vía input del usuario", () => {
  it("comando desconocido: el payload se refleja como texto literal, nunca ejecutable", () => {
    const msg = unknownCommandMessage(XSS_PAYLOAD, [], []);
    expect(msg).toContain(XSS_PAYLOAD);
    // el mensaje resultante se imprime siempre vía textContent (main.ts:
    // printLine solo usa innerHTML si html=true, y este flujo nunca lo pasa).
  });

  it("open <n> con argumento inválido tipo XSS: falla con mensaje, no rompe ni ejecuta nada", () => {
    vi.stubGlobal("open", vi.fn());
    const result = openCommand([XSS_PAYLOAD]);
    expect(result.output).toContain("Uso: open");
    expect(result.output).not.toContain(XSS_PAYLOAD);
    expect(result.html).toBeFalsy();
    expect(window.open).not.toHaveBeenCalled();
  });
});

describe("2. Links externos: todo target=\"_blank\" lleva rel=\"noopener noreferrer\"", () => {
  function collectSourceFiles(dir: string): string[] {
    const entries = readdirSync(dir, { withFileTypes: true });
    let files: string[] = [];
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) files = files.concat(collectSourceFiles(full));
      else if (/\.(ts|html)$/.test(entry.name)) files.push(full);
    }
    return files;
  }

  it("grep en src/ e index.html: ningún target=\"_blank\" sin rel=\"noopener noreferrer\" en el mismo elemento", () => {
    const root = join(__dirname, "../../");
    const files = [
      ...collectSourceFiles(join(root, "src")),
      join(root, "index.html"),
    ];
    const offenders: string[] = [];
    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      // captura el string/atributo completo del elemento (hasta '>' o backtick de cierre de línea de template)
      const tagMatches = content.match(/<a\b[^>]*target=["']_blank["'][^>]*>/g) ?? [];
      for (const tag of tagMatches) {
        if (!/rel=["'][^"']*noopener[^"']*noreferrer|rel=["'][^"']*noreferrer[^"']*noopener/.test(tag)) {
          offenders.push(`${file}: ${tag}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("3. open <n> no es un open redirect", () => {
  beforeEach(() => {
    vi.stubGlobal("open", vi.fn());
  });

  it("solo abre URLs presentes en content.ts (Project.url/githubUrl), nunca una URL arbitraria", () => {
    openCommand(["1"]);
    const openedUrl = (window.open as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const validUrls = projects.map((p) => p.url || p.githubUrl);
    expect(validUrls).toContain(openedUrl);
  });

  it("n fuera de rango: falla con mensaje, no llama window.open", () => {
    const result = openCommand([String(projects.length + 1)]);
    expect(result.output).toMatch(/No existe el proyecto/);
    expect(window.open).not.toHaveBeenCalled();
  });

  it("n no numérico: falla con mensaje, no llama window.open", () => {
    const result = openCommand(["not-a-number"]);
    expect(result.output).toMatch(/Uso: open/);
    expect(window.open).not.toHaveBeenCalled();
  });
});

describe("5. Content Security Policy", () => {
  it("index.html incluye un meta tag CSP con script-src restringido al propio origen", () => {
    const match = html.match(
      /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/,
    );
    expect(match).not.toBeNull();
    expect(match![1]).toMatch(/script-src[^;]*'self'/);
  });
});

describe("7. Clickjacking", () => {
  it("vercel.json define X-Frame-Options: DENY o frame-ancestors 'none' para todas las rutas", () => {
    const vercelJson = JSON.parse(
      readFileSync(join(__dirname, "../../vercel.json"), "utf-8"),
    );
    const allHeaders = (vercelJson.headers ?? []).flatMap(
      (rule: { headers: { key: string; value: string }[] }) => rule.headers,
    );
    const hasXFrameOptions = allHeaders.some(
      (h: { key: string; value: string }) =>
        h.key === "X-Frame-Options" && h.value === "DENY",
    );
    const hasFrameAncestors = allHeaders.some(
      (h: { key: string; value: string }) =>
        h.key === "Content-Security-Policy" && /frame-ancestors 'none'/.test(h.value),
    );
    expect(hasXFrameOptions || hasFrameAncestors).toBe(true);
  });
});
