import "./style.css";
import { parseInput } from "./core/parser";
import { History } from "./core/history";
import type { CommandResult } from "./commands/types";
import { helpCommand } from "./commands/help";
import { whoamiCommand } from "./commands/whoami";
import { aboutCommand } from "./commands/about";
import { projectsCommand } from "./commands/projects";
import { openCommand } from "./commands/open";
import { skillsCommand } from "./commands/skills";
import { resumeCommand } from "./commands/resume";
import { contactCommand } from "./commands/contact";
import { githubCommand } from "./commands/github";
import { linkedinCommand } from "./commands/linkedin";
import { themeCommand } from "./commands/theme";
import { clearCommand } from "./commands/clear";
import { historyCommand } from "./commands/history";
import { sudoCommand } from "./commands/sudo";
import { matrixCommand } from "./commands/matrix";
import { musicCommand } from "./commands/music";
import { statsCommand } from "./commands/stats";
import { THEMES } from "./themes/themes";
import { unknownCommandMessage } from "./core/suggest";
import { Analytics } from "./core/analytics";
import { profile, projects, skills, contact } from "./data/content";

// registro de comandos: firma estándar (args) => CommandResult, según
// src/commands/types.ts. "history" es el único caso especial (necesita la
// sesión), se resuelve aparte en runCommand.
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
  matrix: matrixCommand,
  music: musicCommand,
  stats: statsCommand,
};

// nombres de comandos reales, usados para sugerencias de typo (ver src/core/suggest.ts)
const COMMAND_NAMES = [...Object.keys(COMMANDS), "history"];

const history = new History();

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <button id="fallback-toggle" type="button">Vista normal</button>
  <div id="terminal">
    <div id="hint">Escribe "help" para empezar.</div>
    <div id="output"></div>
    <div id="input-line">
      <span id="prompt">nicolas@os:~$</span>
      <input id="input" type="text" autocomplete="off" autofocus />
    </div>
  </div>
  <div id="fallback-view" hidden></div>
`;

const output = document.querySelector<HTMLDivElement>("#output")!;
const input = document.querySelector<HTMLInputElement>("#input")!;
const fallbackToggle = document.querySelector<HTMLButtonElement>("#fallback-toggle")!;
const fallbackView = document.querySelector<HTMLDivElement>("#fallback-view")!;
const terminal = document.querySelector<HTMLDivElement>("#terminal")!;

function printLine(text: string, className = "", html = false): void {
  const line = document.createElement("div");
  if (className) line.className = className;
  // "html" solo debe ser true para contenido de confianza generado por
  // nuestros propios comandos (ej. help), nunca con input crudo del usuario.
  if (html) line.innerHTML = text;
  else line.textContent = text;
  output.appendChild(line);
}

function runCommand(raw: string): CommandResult {
  const { cmd, args } = parseInput(raw);
  if (!cmd) return { output: "" };
  if (cmd === "history") {
    Analytics.track(cmd);
    return historyCommand(args, history.list());
  }
  const handler = COMMANDS[cmd];
  if (!handler) {
    return { output: unknownCommandMessage(cmd, Object.keys(THEMES), COMMAND_NAMES) };
  }
  Analytics.track(cmd);
  return handler(args);
}

function handleSubmit(raw: string, echo = true): void {
  if (echo) printLine(`nicolas@os:~$ ${raw}`, "echo");
  history.add(raw);
  const result = runCommand(raw);
  if (result.clearScreen) {
    output.innerHTML = "";
    return;
  }
  if (result.output) printLine(result.output, "", result.html);
}

// chips tappeables: click en un chip de "help" ejecuta el comando como si
// se hubiera escrito y presionado enter (spec 01-onboarding-ux.md).
output.addEventListener("click", (e) => {
  const target = (e.target as HTMLElement).closest<HTMLElement>("[data-cmd]");
  if (!target) return;
  handleSubmit(target.dataset.cmd!);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const raw = input.value;
    input.value = "";
    handleSubmit(raw);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    input.value = history.up();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    input.value = history.down();
  }
});

app.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).closest("#fallback-toggle, #fallback-view")) return;
  input.focus();
});
input.focus();

// boot: se auto-ejecuta "help" sin esperar interacción (criterio de
// aceptación de 01-onboarding-ux.md: la lista de comandos ya es visible al cargar).
printLine('NicolasOS — escribe "help" para ver los comandos disponibles.');
handleSubmit("help", false);

// vista fallback no técnica: mismo contenido (about, proyectos, skills,
// contacto) sin terminal, a 1 click desde cualquier estado.
function renderFallbackView(): string {
  const projectItems = projects
    .map((p) => `<li><strong>${p.name}</strong>: ${p.desc} (${p.stack.join(", ")})</li>`)
    .join("");
  const frontend = skills.frontend.map((s) => s.name).join(", ");
  const backend = skills.backend.map((s) => s.name).join(", ");
  const ia = skills.ia.join(", ");
  return `
    <h1>${profile.name} — ${profile.title}</h1>
    <p>${profile.location}</p>
    <p>${profile.bio}</p>
    <h2>Proyectos</h2>
    <ul>${projectItems}</ul>
    <h2>Skills</h2>
    <p>Frontend: ${frontend}</p>
    <p>Backend: ${backend}</p>
    <p>IA/agentes: ${ia}</p>
    <h2>Contacto</h2>
    <p>Email: ${contact.email}</p>
    <p><a href="${contact.github}" target="_blank" rel="noopener noreferrer">GitHub</a></p>
    <p><a href="${contact.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a></p>
  `;
}

let fallbackOpen = false;
fallbackToggle.addEventListener("click", () => {
  fallbackOpen = !fallbackOpen;
  if (fallbackOpen) {
    fallbackView.innerHTML = renderFallbackView();
    fallbackView.hidden = false;
    terminal.hidden = true;
    fallbackToggle.textContent = "Vista terminal";
  } else {
    fallbackView.hidden = true;
    terminal.hidden = false;
    fallbackToggle.textContent = "Vista normal";
    input.focus();
  }
});
