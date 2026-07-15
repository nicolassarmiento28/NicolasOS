// Tokens de tema, según specs/03-temas.md. Cada tema define bg, texto,
// acento, fuente y estilo de titlebar. applyTheme() los vuelca como CSS
// custom properties sobre documentElement — persisten solos mientras nadie
// llame applyTheme() de nuevo, no hace falta guardar estado de sesión aparte.

export interface ThemeTokens {
  bg: string;
  text: string;
  accent: string;
  font: string;
  titlebar: string;
}

export const THEMES: Record<string, ThemeTokens> = {
  cyberpunk: {
    bg: "#0a0014",
    text: "#f0f0f0",
    accent: "#ff00ff",
    font: "'Courier New', monospace",
    titlebar: "linear-gradient(90deg, #ff00ff, #00ffff)",
  },
  linux: {
    bg: "#000000",
    text: "#33ff33",
    accent: "#33ff33",
    font: "'Courier New', monospace",
    titlebar: "#1a1a1a",
  },
  dos: {
    bg: "#000000",
    text: "#ffffff",
    accent: "#ffffff",
    font: "'Consolas', monospace",
    titlebar: "#ffffff",
  },
  "windows-xp": {
    bg: "#ece9d8",
    text: "#000000",
    accent: "#0a246a",
    font: "'Tahoma', sans-serif",
    titlebar:
      "linear-gradient(180deg, #3a6ea5 0%, #1c4d9e 50%, #0a246a 100%)",
  },
  hacker: {
    bg: "#000000",
    text: "#00ff41",
    accent: "#00ff41",
    font: "'Courier New', monospace",
    titlebar: "#001a00",
  },
};

export const DEFAULT_THEME = "cyberpunk";

let currentTheme = DEFAULT_THEME;

/** Aplica un tema como variables CSS sobre documentElement. Devuelve false si el nombre no existe. */
export function applyTheme(name: string): boolean {
  const tokens = THEMES[name];
  if (!tokens) return false;
  const root = document.documentElement;
  root.style.setProperty("--theme-bg", tokens.bg);
  root.style.setProperty("--theme-text", tokens.text);
  root.style.setProperty("--theme-accent", tokens.accent);
  root.style.setProperty("--theme-font", tokens.font);
  root.style.setProperty("--theme-titlebar", tokens.titlebar);
  currentTheme = name;
  return true;
}

/** Nombre del tema activo en la sesión actual. */
export function getCurrentTheme(): string {
  return currentTheme;
}
