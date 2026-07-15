# 03-temas.md

## Objetivo
Sistema de temas visuales activables con el comando `theme <n>`.

## Temas v1
1. cyberpunk — negro + magenta/cian neón
2. linux — TTY verde clásico
3. dos — negro/blanco, cursor de bloque
4. windows-xp — gris/azul clásico, tipografía Tahoma
5. hacker — negro/verde, tipografía Courier New

Temas 4 y 5 se adelantaron e implementaron en `src/themes/themes.ts` junto
con los primeros 3 (commit `6724076`), validados por `qa-testing` y
`seguridad` — se promueven formalmente a v1 acá en vez de revertirlos.
`06-effects-v2.md` sigue bloqueado para el resto de su alcance (music,
analítica de comandos).

## Implementación
- Cada tema es un objeto de tokens en `src/themes/themes.ts` (bg, texto,
  acento, fuente, estilo de titlebar).
- `applyTheme()` setea variables CSS custom properties sobre `documentElement`.

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
