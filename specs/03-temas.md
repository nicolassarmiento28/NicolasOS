# 03-temas.md

## Objetivo
Sistema de temas visuales activables con el comando `theme <n>`.

## Temas v1 (recortado a 3 para bajar carga de QA)
1. cyberpunk — negro + magenta/cian neón, máximo efecto (glow fuerte, chips redondeados, scanlines visibles)
2. linux — TTY verde clásico, austero: sin glow, sin scanlines, chips de
   bordes rectos (`border-radius: 0`), y **sin barra de título tipo mac**
   (sin los 3 puntos de colores — una TTY real no tiene cromo de ventana).
   Ver detalle abajo.
3. dos — negro/blanco, cursor de bloque

Temas 4 (windows xp) y 5 (hacker) quedan en `06-effects-v2.md`.

### Bug conocido a evitar: linux y hacker se ven idénticos
Ambos usan verde y quedaron con la misma plantilla visual (glow, chips
redondeados, titlebar con puntos), sin ninguna diferencia real más allá
del tono de color. Deben diferenciarse en identidad, no solo en hex:

- **linux**: verde apagado (`#33ff33`), CERO `text-shadow`/glow, CERO
  scanlines, chips con `border-radius: 0`, titlebar SIN los 3 puntos de
  colores (barra simple, casi invisible — texto plano, sin cromo decorativo).
- **hacker** (v2): verde saturado tipo Matrix (`#00ff41`), `text-shadow`
  marcado, scanlines visibles, chips redondeados con glow en hover,
  titlebar con los 3 puntos y glow en los bordes.

**Criterio de aceptación**: captura de Playwright confirma que linux no
tiene glow, no tiene scanlines, chips rectos, y sin puntos de colores en
el titlebar — visualmente distinguible de hacker sin mirar el nombre del
tema.

**Estado (revisado por diseno-visual, 2026-07-16)**: RESUELTO en
`src/themes/themes.ts`. `linux` tiene `glowIntensity: "none"`,
`scanlinesIntensity: "none"`, `chipRadius: "sharp"`,
`showTitlebarDots: false` → se traduce en `--theme-glow: 0px`,
`--theme-scanlines-opacity: 0`, `border-radius: 0` en chips, y
`display: none` en los 3 puntos de la titlebar. `hacker` quedó con
`strong`/`visible`/`rounded`/`true` — distinto de linux en los 4 ejes,
marcado con comentario `ponytail:` indicando que son tokens placeholder
sin implementación visual nueva, para no romper el bloqueo de
`06-effects-v2.md`. Pendiente de verificación visual real con Playwright
(este agente no tiene Bash/Playwright; delegar a `onboarding-ux` o
`qa-testing` cuando se abra esa fase) para confirmar el resultado
renderizado, no solo el valor de los tokens.

## Implementación
- Cada tema es un objeto de tokens en `src/themes/themes.ts` (bg, texto,
  acento, fuente, estilo de titlebar).
- `applyTheme()` setea variables CSS custom properties sobre `documentElement`.
- El modelo `Theme` se extiende con: `glowIntensity` (`none` | `subtle` | `strong`),
  `scanlinesIntensity` (`none` | `subtle` | `visible`), `chipRadius`
  (`sharp` | `rounded`), y `showTitlebarDots` (boolean) — para que estas
  diferencias sean tokens configurables por tema, no CSS hardcodeado
  condicional al nombre del tema.

**Criterio de aceptación**: cada tema aplica correctamente sus variables
CSS al activar `theme <n>`, y el tema activo persiste durante la sesión
(no vuelve al default al ejecutar otro comando).

## Bug conocido a evitar: argumento de theme no se parsea
`theme` es UN solo comando que recibe el nombre del tema como argumento
(`theme cyberpunk`), no tres comandos independientes. El parser de
`02-comandos-core.md` ya separa `args` correctamente — el error típico es
que el handler de `theme` ignora `args[0]` y solo maneja el caso sin
argumentos (mostrar la lista). El handler debe:
1. Sin argumentos → listar temas disponibles.
2. Con argumento válido (`cyberpunk`, `linux`, `dos`, o su número) → aplicar.
3. Con argumento inválido → mensaje de error claro, nunca "comando no encontrado".

**Criterio de aceptación**: test que confirma que `theme cyberpunk` (con
argumento) aplica el tema, no solo que `theme` sin argumentos lista opciones.

## Si el usuario escribe el nombre del tema solo (sin `theme` adelante)
No registrar `cyberpunk`/`linux`/`dos` como comandos independientes — eso
mezclaría la responsabilidad de `themes` con la de `core-engine`. En su
lugar, usar el mismo mecanismo de sugerencia de `01-onboarding-ux.md`: si
el comando no reconocido coincide con un nombre de tema, sugerir
`"¿quisiste decir theme cyberpunk?"` en vez de un "comando no encontrado" plano.

## Depende de
`02-comandos-core.md` (necesita que exista el comando `theme` en el parser).
