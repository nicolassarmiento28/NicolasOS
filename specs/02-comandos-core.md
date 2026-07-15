# 02-comandos-core.md

## Objetivo
Motor de terminal: parseo de input, historial de sesión, y todos los
comandos base del portafolio.

## Motor (`src/core/`)
- `parser.ts` — convierte una línea de input en `{ cmd, args }`, tolera
  mayúsculas/minúsculas y espacios extra.
- `history.ts` — navegación con flecha arriba/abajo, sin duplicar entradas
  consecutivas idénticas.

**Criterio de aceptación**: tests unitarios de `parser.ts` cubren alias,
espacios extra, mayúsculas y comandos vacíos. `history.ts` tiene test de
navegación en ambas direcciones y de reset.

## Comandos v1
| comando | alias ES | comportamiento |
|---|---|---|
| help | ayuda | lista comandos, chips tappeables (ver 01-onboarding-ux.md) |
| whoami | — | identidad rápida |
| about | — | bio |
| projects | proyectos | lista numerada |
| open <n> | abrir <n> | abre el link del proyecto n en nueva pestaña |
| skills | — | grid de tecnologías |
| experience | experiencia | timeline laboral |
| resume / cv | cv | abre/descarga CV |
| contact | contacto | email y forma de contacto |
| github / linkedin | — | abren perfil en nueva pestaña |
| theme | tema | lista temas disponibles (ver 03-temas.md) |
| theme <n> | tema <n> | cambia el tema activo |
| clear | limpiar | limpia pantalla |
| history | historial | comandos usados en la sesión |
| sudo | — | easter egg |

**Criterio de aceptación**: cada comando tiene su propio archivo en
`src/commands/` y su propio test en `tests/commands/`. Ningún comando
depende del estado interno de otro.

## Depende de
Nada — es la base de todo lo demás.
