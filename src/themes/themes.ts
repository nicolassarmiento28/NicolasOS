// Tokens de tema, según specs/03-temas.md y specs/06-effects-v2.md (hacker).
// Cada tema define bg, texto, acento, fuente y estilo de titlebar. applyTheme()
// los vuelca como CSS custom properties sobre documentElement — persisten
// solos mientras nadie llame applyTheme() de nuevo, no hace falta guardar
// estado de sesión aparte.

import { isAmbientRainRunning, startAmbientRain, stopAmbientRain } from "./ambientRain";

export interface ThemeTokens {
  bg: string;
  text: string;
  accent: string;
  font: string;
  titlebar: string;
  /** Color de texto/botón/puntos de la titlebar. Separado de `text` porque el
   * fondo de la titlebar (`titlebar`) puede tener bajo contraste con el color
   * de texto del cuerpo (ej. tema "dos": titlebar blanca, texto blanco) —
   * ver bug conocido "titlebar incompleto" en specs/10-diseno-visual.md. */
  titlebarText: string;
  /** Color tenue para texto secundario (labels de categoría de chips, etc.).
   * Por tema porque un gris fijo pensado para fondos oscuros pierde contraste
   * en temas claros como windows-xp — ver bug "labels invisibles" en
   * specs/10-diseno-visual.md. Cada valor cumple contraste WCAG >= 4.5:1
   * contra el `bg` de su propio tema. */
  dim: string;
  /** Efecto CRT (viñeta), sólo para temas tipo terminal (specs/10-diseno-visual.md). */
  crt: boolean;
  /** Intensidad de glow/text-shadow (prompt, banner, chips en hover). "intense" agrega
   * una segunda capa de text-shadow (--theme-glow-2) y un anillo de hover más ancho en
   * los chips — reservado para diferenciar hacker de cyberpunk/linux (specs/06-effects-v2.md). */
  glowIntensity: "none" | "subtle" | "strong" | "intense";
  /** Intensidad de las scanlines (separado de `crt`/viñeta). "intense" > "visible"
   * (usado por cyberpunk) para que hacker se lea más marcado. Ver specs/03-temas.md. */
  scanlinesIntensity: "none" | "subtle" | "visible" | "intense";
  /** Radio de borde de los chips. "sharp" = TTY austera, "rounded" = pill. */
  chipRadius: "sharp" | "rounded";
  /** Parpadeo aleatorio muy leve en la opacidad del texto del terminal (CRT viejo).
   * Elemento que linux NO tiene en absoluto (specs/06-effects-v2.md, tema hacker). */
  flicker: boolean;
  /** "breathe" = pulso de glow en vez de blink on/off. Ver tema hacker. */
  cursorStyle: "blink" | "breathe";
  /** Capa de fondo permanente con columnas de caracteres cayendo a opacity muy baja,
   * detrás del panel de terminal — distinto del comando `matrix` (easter egg a pantalla
   * completa). Ver src/themes/ambientRain.ts. */
  ambientRain: boolean;
}

const GLOW_PX: Record<ThemeTokens["glowIntensity"], string> = {
  none: "0px",
  subtle: "4px",
  strong: "8px",
  intense: "4px",
};

/** Segunda capa de text-shadow, solo no-cero en "intense" (halo real de dos capas,
 * `0 0 4px, 0 0 12px` del spec — la primera capa la da GLOW_PX). */
const GLOW_PX_2: Record<ThemeTokens["glowIntensity"], string> = {
  none: "0px",
  subtle: "0px",
  strong: "0px",
  intense: "12px",
};

/** Blur del anillo de glow en hover de los chips — separado de GLOW_PX para que
 * "intense" pueda tener un anillo bien visible sin inflar el text-shadow del resto. */
const HOVER_GLOW_PX: Record<ThemeTokens["glowIntensity"], string> = {
  none: "0px",
  subtle: "6px",
  strong: "10px",
  intense: "20px",
};

const SCANLINES_OPACITY: Record<ThemeTokens["scanlinesIntensity"], string> = {
  none: "0",
  subtle: "0.015",
  visible: "0.035",
  intense: "0.07",
};

const CHIP_RADIUS: Record<ThemeTokens["chipRadius"], string> = {
  sharp: "0",
  rounded: "999px",
};

export const THEMES: Record<string, ThemeTokens> = {
  cyberpunk: {
    bg: "#0a0014",
    text: "#f0f0f0",
    accent: "#ff00ff",
    font: "'Courier New', monospace",
    titlebar: "linear-gradient(90deg, #ff00ff, #00ffff)",
    titlebarText: "#f0f0f0",
    dim: "rgba(255, 255, 255, 0.5)",
    crt: true,
    glowIntensity: "strong",
    scanlinesIntensity: "visible",
    chipRadius: "rounded",
    flicker: false,
    cursorStyle: "blink",
    ambientRain: false,
  },
  linux: {
    bg: "#000000",
    text: "#33ff33",
    accent: "#33ff33",
    font: "'Courier New', monospace",
    titlebar: "#1a1a1a",
    titlebarText: "#33ff33",
    dim: "rgba(255, 255, 255, 0.5)",
    crt: false,
    glowIntensity: "none",
    scanlinesIntensity: "none",
    chipRadius: "sharp",
    flicker: false,
    cursorStyle: "blink",
    ambientRain: false,
  },
  dos: {
    bg: "#000000",
    text: "#ffffff",
    accent: "#ffffff",
    font: "'Consolas', monospace",
    titlebar: "#ffffff",
    titlebarText: "#000000",
    dim: "rgba(255, 255, 255, 0.5)",
    crt: true,
    glowIntensity: "none",
    scanlinesIntensity: "none",
    chipRadius: "sharp",
    flicker: false,
    cursorStyle: "blink",
    ambientRain: false,
  },
  "windows-xp": {
    bg: "#ece9d8",
    text: "#000000",
    accent: "#0a246a",
    font: "'Tahoma', sans-serif",
    titlebar:
      "linear-gradient(180deg, #3a6ea5 0%, #1c4d9e 50%, #0a246a 100%)",
    titlebarText: "#ffffff",
    // Gris medio, no el rgba(255,255,255,0.5) de los temas oscuros: contra el
    // fondo claro (#ece9d8) ese blanco semi-transparente es invisible (bug
    // conocido, specs/10-diseno-visual.md). #5a5a5a da contraste ~5.65:1
    // (>= 4.5:1 exigido); #6b6b6b mencionado en el spec da ~4.37:1, no alcanza.
    dim: "#5a5a5a",
    crt: false,
    glowIntensity: "none",
    scanlinesIntensity: "none",
    chipRadius: "sharp",
    flicker: false,
    cursorStyle: "blink",
    ambientRain: false,
  },
  // hacker: implementado según specs/06-effects-v2.md (usuario confirmó que ya
  // está en producción pese al bloqueo formal del spec — se corrige acá en vez
  // de removerlo). Distinto de linux en 4 ejes de 03-temas.md MÁS 3 elementos
  // que linux no tiene en absoluto: flicker, cursor "breathe" y lluvia ambiental.
  hacker: {
    bg: "#000000",
    text: "#00ff41",
    accent: "#00ff41",
    font: "'Courier New', monospace",
    titlebar: "#001a00",
    titlebarText: "#00ff41",
    dim: "rgba(255, 255, 255, 0.5)",
    crt: true,
    glowIntensity: "intense",
    scanlinesIntensity: "intense",
    chipRadius: "rounded",
    flicker: true,
    cursorStyle: "breathe",
    ambientRain: true,
  },
};

// Tema activo al cargar la terminal por primera vez, sin tema elegido en la
// sesión (specs/03-temas.md, sección "Tema por defecto"). `theme <n>` sigue
// permitiendo cambiarlo con normalidad; esto solo fija el estado inicial.
export const DEFAULT_THEME = "dos";

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
  root.style.setProperty("--theme-titlebar-text", tokens.titlebarText);
  root.style.setProperty("--dim", tokens.dim);
  root.style.setProperty("--theme-crt", tokens.crt ? "1" : "0");
  root.style.setProperty("--theme-glow", GLOW_PX[tokens.glowIntensity]);
  root.style.setProperty("--theme-glow-2", GLOW_PX_2[tokens.glowIntensity]);
  root.style.setProperty("--theme-chip-hover-glow", HOVER_GLOW_PX[tokens.glowIntensity]);
  root.style.setProperty(
    "--theme-scanlines-opacity",
    SCANLINES_OPACITY[tokens.scanlinesIntensity],
  );
  root.style.setProperty("--theme-chip-radius", CHIP_RADIUS[tokens.chipRadius]);
  root.dataset.themeFlicker = tokens.flicker ? "1" : "0";
  root.dataset.cursorStyle = tokens.cursorStyle;
  // lluvia ambiental: capa de fondo permanente mientras el tema la tenga activa,
  // no el comando `matrix` (src/effects/matrix.ts, easter egg a pantalla completa
  // sin tocar). Arranca/para sola al cambiar de tema.
  if (tokens.ambientRain && !isAmbientRainRunning()) startAmbientRain();
  if (!tokens.ambientRain && isAmbientRainRunning()) stopAmbientRain();
  currentTheme = name;
  return true;
}

/** Nombre del tema activo en la sesión actual. */
export function getCurrentTheme(): string {
  return currentTheme;
}
