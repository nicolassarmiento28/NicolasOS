import "./style.css";
import { parseInput } from "./core/parser";
import { History } from "./core/history";
import type { CommandResult } from "./commands/types";
import { historyCommand } from "./commands/history";
import { COMMANDS, COMMAND_NAMES } from "./core/registry";
import { applyTheme, DEFAULT_THEME, THEMES } from "./themes/themes";
import { unknownCommandMessage } from "./core/suggest";
import { Analytics } from "./core/analytics";
import { profile, projects, skills, contact } from "./data/content";

const history = new History();

// tema por defecto al arrancar (specs/03-temas.md): sin tema elegido en la
// sesión, el activo debe ser DEFAULT_THEME (dos), no los valores hardcodeados
// de :root en style.css (esos son solo fallback antes de que corra JS).
applyTheme(DEFAULT_THEME);

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
  <div id="window" class="window">
    <div class="titlebar">
      <div class="traffic-lights">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
      </div>
      <span class="titlebar-text">nicolas@os: ~</span>
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
  <div id="fallback-window" class="window" hidden>
    <div class="titlebar">
      <div class="traffic-lights">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
      </div>
      <span class="titlebar-text">nicolas@os: ~ (vista normal)</span>
      <button id="fallback-close" type="button">Vista terminal</button>
    </div>
    <div id="fallback-content"></div>
  </div>
`;

const output = document.querySelector<HTMLDivElement>("#output")!;
const input = document.querySelector<HTMLInputElement>("#input")!;
const fallbackToggle = document.querySelector<HTMLButtonElement>("#fallback-toggle")!;
const fallbackClose = document.querySelector<HTMLButtonElement>("#fallback-close")!;
const fallbackWindow = document.querySelector<HTMLDivElement>("#fallback-window")!;
const fallbackContent = document.querySelector<HTMLDivElement>("#fallback-content")!;
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

// el input crece con el texto tipeado (width: Nch, ver style.css) para que
// #cursor, inmediatamente después en el flujo normal, quede pegado al
// último carácter en vez de a un punto fijo (bug conocido,
// specs/10-diseno-visual.md).
function syncInputWidth(): void {
  input.style.width = `${Math.max(input.value.length, 1)}ch`;
}

input.addEventListener("input", syncInputWidth);

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
  syncInputWidth();
});

app.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).closest("#fallback-toggle, #fallback-window")) return;
  input.focus();
});
input.focus();

// boot: se auto-ejecuta "help" sin esperar interacción (criterio de
// aceptación de 01-onboarding-ux.md: la lista de comandos ya es visible al cargar).
printLine(ASCII_BANNER, "ascii-banner");
typeLine('NicolasOS — escribe "help" para ver los comandos disponibles.', "boot-text");
handleSubmit("help", false);

// vista fallback no técnica: mismo contenido (about, proyectos, skills,
// contacto) sin terminal, a 1 click desde cualquier estado. Mismo cromo de
// ventana, tipografía y paleta del tema activo, y el mismo ASCII banner del
// boot como ancla de identidad (specs/10-diseno-visual.md).
function renderFallbackView(): string {
  const projectCards = projects
    .map(
      (p) => `
        <article class="project-card">
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          <div class="chips">
            ${p.stack.map((s) => `<span class="chip">${s}</span>`).join("")}
          </div>
          <a class="project-link" href="${p.url}" target="_blank" rel="noopener noreferrer">Ver proyecto →</a>
        </article>`,
    )
    .join("");
  const frontend = skills.frontend.map((s) => s.name).join(", ");
  const backend = skills.backend.map((s) => s.name).join(", ");
  const ia = skills.ia.join(", ");
  return `
    <pre class="ascii-banner">${ASCII_BANNER}</pre>
    <section class="fallback-section">
      <h1>${profile.name} — ${profile.title}</h1>
      <p>${profile.location}</p>
      <p>${profile.bio}</p>
    </section>
    <section class="fallback-section">
      <h2>Proyectos</h2>
      <div class="project-grid">${projectCards}</div>
    </section>
    <section class="fallback-section">
      <h2>Skills</h2>
      <p>Frontend: ${frontend}</p>
      <p>Backend: ${backend}</p>
      <p>IA/agentes: ${ia}</p>
    </section>
    <section class="fallback-section">
      <h2>Contacto</h2>
      <p>Email: ${contact.email}</p>
      <p><a href="${contact.github}" target="_blank" rel="noopener noreferrer">GitHub</a></p>
      <p><a href="${contact.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a></p>
    </section>
  `;
}

function openFallback(): void {
  fallbackContent.innerHTML = renderFallbackView();
  fallbackWindow.hidden = false;
  win.hidden = true;
}

function closeFallback(): void {
  fallbackWindow.hidden = true;
  win.hidden = false;
  input.focus();
}

fallbackToggle.addEventListener("click", openFallback);
fallbackClose.addEventListener("click", closeFallback);
