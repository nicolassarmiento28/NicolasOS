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
  scanlines, chips con `border-radius: 0`. Los controles de ventana
  estilo Windows (`_ □ X`) SÍ están presentes, igual que en el resto de
  los temas — la austeridad de linux se expresa en ausencia de glow y
  scanlines, no en la barra de título.
- **hacker** (v2): verde saturado tipo Matrix (`#00ff41`), `text-shadow`
  marcado, scanlines visibles, chips redondeados con glow en hover,
  titlebar con los 3 puntos y glow en los bordes.

**Criterio de aceptación**: captura de Playwright confirma que linux no
tiene glow, no tiene scanlines, y chips rectos — visualmente distinguible
de hacker sin mirar el nombre del tema (los controles de ventana ya no
son parte de esta distinción, ambos los tienen).

## Tema por defecto
Al cargar la terminal por primera vez (sin tema elegido en la sesión), el
tema activo debe ser **`dos`**, no cyberpunk ni ningún otro. El usuario
puede cambiarlo con `theme <n>` como siempre, pero el estado inicial es dos.

**Criterio de aceptación**: test que carga la app desde cero (sin estado
previo) y confirma que las variables CSS aplicadas son las de `dos`, no
las de cyberpunk. Captura de Playwright del primer render confirma
visualmente el tema dos activo.

## Implementación
- Cada tema es un objeto de tokens en `src/themes/themes.ts` (bg, texto,
  acento, fuente, estilo de titlebar).
- `applyTheme()` setea variables CSS custom properties sobre `documentElement`.
- El modelo `Theme` se extiende con: `glowIntensity` (`none` | `subtle` | `strong`),
  `scanlinesIntensity` (`none` | `subtle` | `visible`), y `chipRadius`
  (`sharp` | `rounded`) — para que estas diferencias sean tokens
  configurables por tema, no CSS hardcodeado condicional al nombre del
  tema. Los controles de ventana (`_ □ X`) son universales a todos los
  temas, no necesitan un flag por tema — ver `10-diseno-visual.md`.

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

**Criterio de aceptación**: en el tema windows-xp desde el arranque (sin
cambiar de tema), todas las líneas de prompt son azules, ninguna verde.
Test adicional: cambiar de tema con historial ya impreso confirma que
TODO el texto de prompt se actualiza al color del nuevo tema.

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
