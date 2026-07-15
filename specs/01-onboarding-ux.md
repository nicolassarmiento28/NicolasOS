# 01-onboarding-ux.md

## Objetivo
Que cualquier visitante, técnico o no, entienda qué hacer en los primeros
5 segundos, sin quedarse mirando un cursor parpadeando sin contexto.

## Boot inicial
- Al cargar, se auto-ejecuta `help` (no espera a que el usuario adivine).
- Hint fijo y visible: "escribe `help` para empezar".

**Criterio de aceptación**: al cargar la página sin ninguna interacción,
el usuario ya ve la lista de comandos disponibles.

## Chips tappeables
- El output de `help` muestra cada comando como chip clickeable/tappeable
  que lo ejecuta directamente, sin necesidad de escribirlo.
- Resuelve la fricción de escribir comandos a mano en mobile.

**Criterio de aceptación**: tocar un chip de comando produce el mismo
resultado que escribir ese comando y presionar enter.

## Fallback no técnico
- Botón discreto (esquina) "vista normal" que muestra el mismo contenido
  (about, proyectos, skills, contacto) en formato portfolio clásico, sin terminal.

**Criterio de aceptación**: un usuario que nunca toca el input igual puede
acceder a toda la información del portafolio en menos de 2 clics.

## Manejo de errores de tipeo
- Si el comando no existe, sugerir el más parecido
  ("¿quisiste decir `projects`?") en vez de solo "command not found".

**Criterio de aceptación**: test que confirma que un typo a distancia de
edición 1-2 de un comando real dispara la sugerencia correcta.

## Depende de
`02-comandos-core.md` (necesita que el motor de comandos ya funcione)
y `04-contenido.md` (necesita datos reales para la vista fallback).
