import "./style.css";
import { parseInput } from "./core/parser";
import { History } from "./core/history";
import type { CommandResult } from "./commands/types";
import { historyCommand } from "./commands/history";
import { COMMANDS, COMMAND_NAMES } from "./core/registry";
import { THEMES } from "./themes/themes";
import { unknownCommandMessage } from "./core/suggest";
import { Analytics } from "./core/analytics";
import { profile, projects, skills, contact } from "./data/content";

const history = new History();

// banner ASCII de "NicolasOS" (specs/10-diseno-visual.md): se muestra de
// golpe (tipear ASCII art letra por letra se ve raro), antes de los chips
// de help. Color de acento vía CSS (--theme-accent), no fijo.
const ASCII_BANNER = `
 _   _ _           _         ___  ____
| \\ | (_) ___ ___ | | __ _ __/ _ \\/ ___|
|  \\| | |/ __/ _ \\| |/ _\` |____| | \\___ \\
| |\\  | | (_| (_) | | (_| |____| |_ ___) |
|_| \\_|_|\\___\\___/|_|\\__,_|   \\___/|____/
`.trim();

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <div id="window">
    <div id="titlebar">
      <div id="traffic-lights">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
      </div>
      <span id="titlebar-text">nicolas@os: ~</span>
      <button id="fallback-toggle" type="button">Vista normal</button>
    </div>
    <div id="terminal">
      <div id="hint">Escribe "help" para empezar.</div>
      <div id="output"></div>
      <div id="input-line">
        <span id="prompt">nicolas@os:~$</span>
        <input id="input" type="text" autocomplete="off" autofocus />
        <span id="cursor"></span>
      </div>
    </div>
  </div>
  <div id="fallback-view" hidden></div>
`;

const output = document.querySelector<HTMLDivElement>("#output")!;
const input = document.querySelector<HTMLInputElement>("#input")!;
const fallbackToggle = document.querySelector<HTMLButtonElement>("#fallback-toggle")!;
const fallbackView = document.querySelector<HTMLDivElement>("#fallback-view")!;
const win = document.querySelector<HTMLDivElement>("#window")!;

/**
 * Efecto de escritura (specs/10-diseno-visual.md): tipea `text` carácter a
 * carácter a ~24ms/char en vez de aparecer de golpe. No bloquea el resto
 * del boot (chips, foco del input) — corre en background con setTimeout.
 * Por eso el criterio de aceptación ("el texto no está 100% presente en
 * el primer frame") se cumple solo, sin lógica extra.
 */
function typeLine(text: string, className = ""): void {
  const line = document.createElement("div");
  if (className) line.className = className;
  output.appendChild(line);
  let i = 0;
  const tick = () => {
    line.textContent = text.slice(0, i);
    i++;
    if (i <= text.length) setTimeout(tick, 24);
  };
  tick();
}

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
printLine(ASCII_BANNER, "ascii-banner");
typeLine('NicolasOS — escribe "help" para ver los comandos disponibles.', "boot-text");
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
    win.hidden = true;
    fallbackToggle.textContent = "Vista terminal";
  } else {
    fallbackView.hidden = true;
    win.hidden = false;
    fallbackToggle.textContent = "Vista normal";
    input.focus();
  }
});
