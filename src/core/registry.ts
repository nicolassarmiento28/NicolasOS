import type { CommandResult } from "../commands/types";
import { helpCommand } from "../commands/help";
import { whoamiCommand } from "../commands/whoami";
import { aboutCommand } from "../commands/about";
import { projectsCommand } from "../commands/projects";
import { openCommand } from "../commands/open";
import { skillsCommand } from "../commands/skills";
import { resumeCommand } from "../commands/resume";
import { contactCommand } from "../commands/contact";
import { githubCommand } from "../commands/github";
import { linkedinCommand } from "../commands/linkedin";
import { themeCommand } from "../commands/theme";
import { clearCommand } from "../commands/clear";
import { sudoCommand } from "../commands/sudo";
import { matrixCommand } from "../commands/matrix";
import { musicCommand } from "../commands/music";
import { statsCommand } from "../commands/stats";
import { analyticsCommand } from "../commands/analytics";
import { viewCommand } from "../commands/view";

// registro de comandos: firma estándar (args) => CommandResult, según
// src/commands/types.ts. Fuente única de verdad — main.ts despacha desde
// acá y help.ts genera los chips desde acá, nunca una lista aparte.
// "history" es el único caso especial (necesita la sesión), se resuelve
// aparte en main.ts/runCommand.
export const COMMANDS: Record<string, (args: string[]) => CommandResult> = {
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
  matrix: matrixCommand,
  music: musicCommand,
  stats: statsCommand,
  analytics: analyticsCommand,
  view: viewCommand,
};

// nombres de comandos reales, usados para sugerencias de typo (ver src/core/suggest.ts)
export const COMMAND_NAMES = [...Object.keys(COMMANDS), "history"];
