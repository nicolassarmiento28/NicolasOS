
**Criterio de aceptación**: captura de Playwright confirma controles estilo
Windows (`_ □ X`) alineados a la derecha en los CINCO temas (cyberpunk,
linux, dos, windows-xp, hacker) — ninguno queda sin ellos. Test de que `□`
cambia de vista correctamente, y que `_`/`X` muestran su mensaje de easter
egg sin romper nada.

**Estado revisado (2026-07-16, diseño-visual, revisión de código sin
Playwright)**: confirmado. `.window-controls` en `src/style.css` es
`display: flex` incondicional, sin selector por tema. `src/main.ts` renderiza
el mismo bloque de controles en ambas vistas sin condicionar por theme
activo. No quedan referencias a `showWindowControls`/
`--theme-window-controls` en el repo (removidas del modelo `Theme` y de
CSS). La distinción linux/hacker sigue intacta solo vía
`glowIntensity`/`scanlinesIntensity`/`chipRadius` en `src/themes/themes.ts`,
sin depender de los controles. Pendiente: verificación visual real con
Playwright (onboarding-ux o qa-testing) para cerrar el criterio de
aceptación completo.

