### Bug conocido a evitar: color hardcodeado que ignora el tema activo
En el tema `windows-xp`, el texto `nicolas@os` en las líneas de comandos
ya impresas en pantalla aparece verde en vez de azul (el acento propio de
ese tema). La causa más probable es que el color del prompt está
hardcodeado (ej. un verde fijo heredado de cyberpunk/hacker) en el
componente que renderiza cada línea de historial, en vez de leer siempre
la variable CSS `--accent` del tema activo. Esto debe corregirse en dos
niveles:
1. Cualquier línea de prompt, en cualquier tema, usa `--accent` del tema
   ACTUALMENTE activo — nunca un color fijo en el código.
2. Si el usuario cambia de tema con líneas de historial ya impresas, esas
   líneas viejas también se actualizan al nuevo color — no quedan
   "congeladas" con el color de cuando se escribieron.

**Estado: RESUELTO.** Causa raíz confirmada: `#output .echo { color: #6f6; }`
en `src/style.css` era un verde fijo. Cambiado a `color: var(--theme-accent);`.
Al ser una CSS custom property dinámica seteada por `applyTheme()` (y no
un `style.color` inline por línea), un solo cambio resuelve ambos niveles
del bug: color correcto desde el arranque en cualquier tema, y
actualización retroactiva del historial ya impreso al cambiar de tema
(nada "congela" el color por línea).

**Criterio de aceptación**: en el tema windows-xp desde el arranque (sin
cambiar de tema), todas las líneas de prompt son azules, ninguna verde.
Test adicional: cambiar de tema con historial ya impreso confirma que
TODO el texto de prompt se actualiza al color del nuevo tema.
