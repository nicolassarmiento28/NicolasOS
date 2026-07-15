# 03-temas.md

## Objetivo
Sistema de temas visuales activables con el comando `theme <n>`.

## Temas v1 (recortado a 3 para bajar carga de QA)
1. cyberpunk — negro + magenta/cian neón
2. linux — TTY verde clásico
3. dos — negro/blanco, cursor de bloque

Temas 4 (windows xp) y 5 (hacker) quedan en `06-effects-v2.md`.

## Implementación
- Cada tema es un objeto de tokens en `src/themes/themes.ts` (bg, texto,
  acento, fuente, estilo de titlebar).
- `applyTheme()` setea variables CSS custom properties sobre `documentElement`.

**Criterio de aceptación**: test que confirma que `theme <n>` aplica
correctamente las variables CSS de ese tema, y que el tema activo persiste
durante la sesión (no vuelve al default al ejecutar otro comando).

## Depende de
`02-comandos-core.md` (necesita que exista el comando `theme` en el parser).
