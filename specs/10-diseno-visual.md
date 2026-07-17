con menos contraste — la legibilidad no se sacrifica por jerarquía visual.

**Criterio de aceptación**: captura de Playwright confirma que los chips
del grupo "extra" tienen el mismo contraste de color que los demás grupos,
en los cinco temas — ninguno se ve significativamente más tenue que el resto.

**Estado**: revisado por diseno-visual (2026-07-16) contra `src/style.css`.
`.chip-extra` solo define `font-size: 0.9em`; sin `--dim`, `opacity` ni
overrides de `color`/`border-color`/hover. Aprobado por lectura de CSS
(colores heredan de `--theme-accent`/`--theme-bg` como el resto de chips).
Pendiente: captura Playwright en los cinco temas para cierre formal del
criterio visual (pedir a onboarding-ux o qa-testing).
