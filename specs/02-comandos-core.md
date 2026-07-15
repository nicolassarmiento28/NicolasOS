# 02-comandos-core.md

## Objetivo
Motor de terminal: parseo de input, historial de sesión, y todos los
comandos base del portafolio.

## Motor (`src/core/`)
- `parser.ts` — convierte una línea de input en `{ cmd, args }`, tolera
  mayúsculas/minúsculas y espacios extra.
- `history.ts` — navegación con flecha arriba/abajo, sin duplicar entradas
  consecutivas idénticas.

### Navegación de historial con teclado — detalle
- **Flecha arriba (`ArrowUp`)**: retrocede al comando anterior en el
  historial y lo carga en el input. No pasar del primer comando (el más viejo).
- **Flecha abajo (`ArrowDown`)**: avanza al comando siguiente (más reciente).
  Si ya está en el último, limpiar el input (vuelve a estado vacío).
- **Flechas izquierda/derecha**: mueven el cursor dentro de la línea actual,
  NO navegan el historial — comportamiento nativo del input, no hay que
  interceptarlas.
- Al ejecutar un comando nuevo, el índice de navegación se resetea al final
  del array (apunta después del último comando).
- Se escucha en el evento `keydown` del input del terminal.

**Criterio de aceptación**: test que simula `ArrowUp` dos veces seguido de
`ArrowDown` una vez y confirma que el input muestra el comando
correspondiente en cada paso. Test de que ejecutar un comando nuevo resetea
el índice (una `ArrowUp` después vuelve al último comando ejecutado, no al
que estaba antes de resetear).

**Criterio de aceptación**: tests unitarios de `parser.ts` cubren alias,
espacios extra, mayúsculas y comandos vacíos. `history.ts` tiene test de
navegación en ambas direcciones y de reset.

## Registro central de comandos — fuente única de verdad
Existe UN solo registro de comandos (`src/core/registry.ts`): un mapa
`nombre → handler`. `main.ts` lo usa para despachar, y `help.ts` lo usa
para generar la lista de chips — nunca una lista hardcodeada aparte.
Agregar un comando nuevo significa agregar UNA entrada a ese registro;
si `help` no lo muestra automáticamente después de eso, es un bug de
`help.ts`, no algo a resolver copiando el nombre a una segunda lista.

**Criterio de aceptación**: un test que registra un comando ficticio en
el registro y confirma que `helpCommand()` lo incluye sin tocar
`help.ts` — prueba que no hay una lista duplicada por mantener a mano.

## Comandos v1
**Nota:** no existe comando `experience`/`experiencia`. El usuario confirmó
que no tiene experiencia laboral formal — ver `04-contenido.md`. No agregar
este comando ni inventar contenido de timeline laboral.

| comando | alias ES | comportamiento |
|---|---|---|
| help | ayuda | lista comandos, chips tappeables (ver 01-onboarding-ux.md) |
| whoami | — | identidad rápida |
| about | — | bio |
| projects | proyectos | lista numerada |
| open <n> | abrir <n> | abre el link del proyecto n en nueva pestaña |
| skills | — | grid de tecnologías |
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
