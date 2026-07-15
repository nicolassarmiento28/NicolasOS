import { describe, it, expect, vi, beforeEach } from "vitest";
import { helpCommand } from "../../src/commands/help";
import { whoamiCommand } from "../../src/commands/whoami";
import { aboutCommand } from "../../src/commands/about";
import { projectsCommand } from "../../src/commands/projects";
import { openCommand } from "../../src/commands/open";
import { skillsCommand } from "../../src/commands/skills";
import { resumeCommand } from "../../src/commands/resume";
import { contactCommand } from "../../src/commands/contact";
import { githubCommand } from "../../src/commands/github";
import { linkedinCommand } from "../../src/commands/linkedin";
import { themeCommand } from "../../src/commands/theme";
import { clearCommand } from "../../src/commands/clear";
import { sudoCommand } from "../../src/commands/sudo";
import { historyCommand } from "../../src/commands/history";
import type { CommandResult } from "../../src/commands/types";

// Regresión de seguridad (ver revisión de src/commands/types.ts `html` flag):
// `CommandResult.html: true` se renderiza vía innerHTML en src/main.ts. Hoy
// solo help.ts lo usa con contenido hardcodeado. Este test barre TODO el
// registro de comandos con un payload XSS como argumento — si algún comando
// futuro copia el patrón de help.ts y por error interpola input de usuario
// en `output` con `html: true`, este test falla en vez de depender de
// revisión manual.
const XSS_PAYLOAD = '<img src=x onerror=alert(1)>';

const COMMANDS: Record<string, (args: string[]) => CommandResult> = {
  help: helpCommand,
  whoami: whoamiCommand,
  about: aboutCommand,
  projects: projectsCommand,
  open: openCommand,
  skills: skillsCommand,
  resume: resumeCommand,
  contact: contactCommand,
  github: githubCommand,
  linkedin: linkedinCommand,
  theme: themeCommand,
  clear: clearCommand,
  sudo: sudoCommand,
};

describe("regresión: ningún comando refleja input de usuario sin sanitizar cuando html=true", () => {
  beforeEach(() => {
    vi.stubGlobal("open", vi.fn());
  });

  for (const [name, handler] of Object.entries(COMMANDS)) {
    it(`${name}: no incluye el payload XSS crudo en un output con html:true`, () => {
      const result = handler([XSS_PAYLOAD]);
      if (result.html) {
        expect(result.output).not.toContain(XSS_PAYLOAD);
      }
    });
  }

  it("history: no incluye el payload XSS crudo en un output con html:true", () => {
    const result = historyCommand([], [XSS_PAYLOAD]);
    if (result.html) {
      expect(result.output).not.toContain(XSS_PAYLOAD);
    }
  });
});
