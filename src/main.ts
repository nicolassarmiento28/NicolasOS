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
import { experienceCommand } from "./commands/experience";
import { resumeCommand } from "./commands/resume";
import { contactCommand } from "./commands/contact";
import { githubCommand } from "./commands/github";
import { linkedinCommand } from "./commands/linkedin";
import { themeCommand } from "./commands/theme";
import { clearCommand } from "./commands/clear";
import { historyCommand } from "./commands/history";
import { sudoCommand } from "./commands/sudo";

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
  experience: experienceCommand,
  resume: resumeCommand,
  contact: contactCommand,
  github: githubCommand,
  linkedin: linkedinCommand,
  theme: themeCommand,
  clear: clearCommand,
  sudo: sudoCommand,
};

const history = new History();

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <div id="terminal">
    <div id="output"></div>
    <div id="input-line">
      <span id="prompt">nicolas@os:~$</span>
      <input id="input" type="text" autocomplete="off" autofocus />
    </div>
  </div>
`;

const output = document.querySelector<HTMLDivElement>("#output")!;
const input = document.querySelector<HTMLInputElement>("#input")!;

function printLine(text: string, className = ""): void {
  const line = document.createElement("div");
  if (className) line.className = className;
  line.textContent = text;
  output.appendChild(line);
}

function runCommand(raw: string): CommandResult {
  const { cmd, args } = parseInput(raw);
  if (!cmd) return { output: "" };
  if (cmd === "history") return historyCommand(args, history.list());
  const handler = COMMANDS[cmd];
  if (!handler) {
    return { output: `Comando no encontrado: ${cmd}. Escribí "help" para ver la lista.` };
  }
  return handler(args);
}

function handleSubmit(raw: string): void {
  printLine(`nicolas@os:~$ ${raw}`, "echo");
  history.add(raw);
  const result = runCommand(raw);
  if (result.clearScreen) {
    output.innerHTML = "";
    return;
  }
  if (result.output) printLine(result.output);
}

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

app.addEventListener("click", () => input.focus());
input.focus();

printLine('NicolasOS — escribí "help" para ver los comandos disponibles.');
