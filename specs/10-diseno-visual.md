# 10-diseno-visual.md

## Objetivo
Dirección de arte transversal a `03-temas.md` y `01-onboarding-ux.md`. Este
spec no define QUÉ funcionalidad existe (eso ya está en esos dos), define
CÓMO se ve y se siente — para que ambos dominios implementen consistente
en vez de resolver la estética cada uno por su lado.

## Cromo de ventana (implementa: onboarding-ux)
Pantalla completa, sin panel flotante ni fondo de página visible alrededor
— la terminal ES la página, no una ventana sobre un fondo. Se revierte acá
la versión anterior (panel centrado con `max-width`, sombra y bordes
redondeados) porque en la práctica se sentía como dos capas separadas
("elevación" — el panel se leía como una ventana flotando sobre otro fondo).

- El contenedor de la terminal ocupa **100% del viewport** (ancho y alto),
  mismo color de fondo en todos lados — no hay ningún borde visible entre
  "el panel" y "la página", porque son la misma superficie.
- **Sin `box-shadow`, sin `border-radius`** en el contenedor principal —
  eso es justamente lo que generaba el efecto de elevación no deseado.
- La barra de título (3 puntos, texto `nicolas@os: ~`, botón "Vista
  normal") sigue existiendo, pero como una franja que ocupa el 100% del
  ancho arriba, no como parte de un panel flotante — se integra a la
  página, no "flota" sobre ella.
- El padding interno generoso (24-32px) se mantiene para que el texto no
  toque los bordes del viewport, pero eso es padding del contenido, no un
  margen que deje ver un fondo distinto alrededor de un panel.
- **`body` no lleva padding en ningún breakpoint**, ni siquiera en mobile.
  Cualquier "aire" extra en mobile va en `#terminal`/`#fallback-content`
  (contenido), nunca en `body` — si `body` tiene padding y `.window` es
  `width: 100%`, se ve el fondo de `body` alrededor de `.window`, que es
  exactamente el efecto de panel flotante que este spec revierte.

**Criterio de aceptación**: captura de Playwright en distintos tamaños de
viewport (incluido mobile, ≤600px) confirma que no hay ningún área de
fondo visible entre el contenido de la terminal y el borde de la ventana
del navegador — todo es una sola superficie continua, sin sombra ni borde
redondeado generando sensación de panel separado.

### Bug conocido a evitar: doble contenedor (ventana "flotando" sobre otra)
El titlebar y el body de la terminal deben ser hijos directos de UN SOLO
contenedor padre, con `overflow: hidden` y el `border-radius` definido
únicamente en ese padre. Ni el titlebar ni el body llevan su propio
`border-radius` o `box-shadow` independiente — si cada uno tiene el suyo,
visualmente se ve como dos ventanas superpuestas en vez de una sola pieza.
(Con el cambio a pantalla completa de arriba, este riesgo baja mucho, pero
si en algún momento se reintroduce algún tipo de panel, esta regla sigue
aplicando.)

**Criterio de aceptación**: captura de Playwright confirma un único borde
redondeado continuo entre titlebar y body, sin gap ni doble sombra visible,
en los tres temas v1 (cyberpunk, linux, dos).

### Bug conocido a evitar: titlebar incompleto según estilo
El texto del path (`nicolas@os: ~`) y el botón "Vista normal"/"Vista
terminal" tienen que estar presentes en la barra de título para los TRES
`titlebarStyle` de v1 (`mac` en cyberpunk, `flat` en linux y dos) — no solo
para uno. Si la implementación arma una plantilla de titlebar distinta por
estilo, replicar el mismo contenido (puntos, texto, botón) en cada una,
solo cambia la forma/paleta, no qué elementos existen.

**Criterio de aceptación**: test o captura de Playwright confirma que el
botón de cambio de vista y el texto del path son visibles en los tres
temas v1, no solo en cyberpunk.

**Criterio de aceptación**: en ningún viewport (mobile incluido) el texto
del terminal toca el borde de la pantalla sin padding.

### Bug conocido a evitar: `body` con padding residual en mobile reintroduce el panel flotante — RESUELTO
Revisión 2026-07-16: al implementar pantalla completa se sacó el padding
de `body` en la regla base, pero quedó `padding: 0.75rem` en
`@media (max-width: 600px)` sobre `body` (no sobre `.window`/`#terminal`).
Como `.window` es `width: 100%` sin margen negativo, ese padding de mobile
dejaba ver el fondo de `body` alrededor de `.window` — exactamente el bug
que este spec revierte, pero solo visible en viewports chicos.

Corregido por onboarding-ux: `body` ya no declara `padding` en ningún
breakpoint (verificado en `src/style.css`, regla base línea 28 y
`@media (max-width: 600px)` línea 410-413). El aire extra en mobile queda
en `#terminal` (`padding: 1.25rem`), que es contenido, no panel.

**Criterio de aceptación**: en `@media (max-width: 600px)`, `body` no
declara `padding` (ni ningún otro valor que deje ver `--theme-bg` de
`body` distinto del de `.window` alrededor del contenedor). — Cumplido.

## ASCII banner (implementa: onboarding-ux)
- Logo ASCII de "NicolasOS" (o iniciales) se muestra antes de los chips de
  `help`, como parte del boot inicial.
- Usa el color de acento del tema activo, no un color fijo.
- Requiere `white-space: pre` (o `pre-wrap`) y `line-height: 1` a `1.1` en
  el contenedor — sin esto, los caracteres de arte ASCII se superponen o
  se desalinean entre líneas (bug visto en la vista normal, donde el logo
  se ve roto/ilegible).

**Criterio de aceptación**: captura de Playwright confirma que las líneas
del ASCII art no se superponen ni se cortan, en terminal y en vista normal.

### Bug conocido a evitar: banner pegado al texto siguiente
Falta espaciado vertical entre el ASCII art y la línea de texto que viene
después (ej. "NicolasOS — escribe help..."). Agregar `margin-bottom` al
contenedor del ASCII art (o `margin-top` a la línea siguiente) — al menos
una línea en blanco de separación visual, no los dos bloques pegados.

**Criterio de aceptación**: captura de Playwright confirma un espacio
vertical visible entre el ASCII art y el texto que lo sigue.

## Boot con efecto de escritura (implementa: onboarding-ux)
- Los mensajes de boot se tipean carácter por carácter (20-30ms por
  carácter), no aparecen de golpe.
- El ASCII banner puede aparecer de golpe (tipearlo letra por letra se ve
  raro en arte ASCII) pero el texto que lo sigue sí se tipea.

**Criterio de aceptación**: test que confirma que el texto de boot no está
100% presente en el DOM en el primer frame — se va agregando progresivamente.

## Jerarquía de chips de comandos (implementa: onboarding-ux)
Agrupar los chips de `help` por categoría, con un label sutil arriba de
cada grupo (mismo estilo tipográfico, más chico y en `--dim`):
- **info**: about, whoami, skills, projects
- **contacto**: contact, github, linkedin, resume
- **sistema**: theme, clear, history
- **extra**: sudo, matrix, music, stats

Los del grupo "extra" llevan menos peso visual: borde más tenue o tamaño
levemente menor que el resto — son easter eggs, no acciones primarias.

## Cursor y prompt (implementa: themes, vía tokens; onboarding-ux, vía render)
- Cursor de bloque parpadeante, color del acento del tema activo.
- El prompt (`nicolas@os:~$`) lleva un `text-shadow` sutil del mismo color
  de acento (efecto phosphor), configurable por tema.

### Bug conocido a evitar: caret desacoplado del texto
El cursor parpadeante (el "caret", el punto de inserción de texto) debe
fluir junto con lo que el usuario va tipeando — es un elemento `inline-block`
dentro del mismo contenedor que el prompt y el input, inmediatamente
después del último carácter escrito. NO debe tener `position: absolute`
con coordenadas fijas — eso lo deja pegado a un punto fijo (ej. el borde
izquierdo) en vez de moverse con el texto.

**Criterio de aceptación**: test o captura de Playwright que escribe texto
en el input y confirma que el cursor aparece inmediatamente después del
último carácter, no en una posición fija.

### Bug conocido a evitar: primer carácter tipeado se ve cortado/deformado
Al escribir la primera letra en el input, aparece visualmente cortada o
deformada (no es el cursor, es el carácter en sí). Causa más probable: el
contenedor que muestra el texto tipeado tiene `width` fijo o `overflow: hidden`
calculado para el estado vacío, y no se recalcula a tiempo con el primer
carácter. Usar `width: auto` / `fit-content` en ese contenedor, y confirmar
que no hay ninguna transformación CSS (`scale`, `rotate`) aplicada
condicionalmente que solo afecte al primer render.

**Criterio de aceptación**: captura de Playwright que escribe una sola
letra y confirma que se renderiza completa y sin distorsión, igual que el
resto del texto tipeado después.

## Efectos CRT (implementa: themes, como parte de los tokens de cada tema)
- Overlay de scanlines: líneas horizontales muy sutiles, opacity ~0.02-0.03.
- Viñeta: oscurecimiento leve en los bordes del panel.
- Ambos son opcionales por tema — un tema como "windows xp" (v2) no debería
  llevar efecto CRT, es parte de la identidad de los temas tipo terminal
  (cyberpunk, linux, dos, hacker), no de todos.

## Micro-interacciones en chips (implementa: onboarding-ux)
- Hover: `translateY(-1px)` + glow levemente más intenso.
- Active/click: `scale(0.97)`.
- Transiciones cortas (150-200ms), nunca animaciones lentas que se sientan pesadas.

## Coordinación
`diseno-visual` NO edita `src/`. Su único artefacto es este archivo. Cuando
`themes` u `onboarding-ux` terminan una tarea que toca algo definido acá,
`diseno-visual` revisa (usando Playwright MCP) que el resultado sea fiel a
esta dirección antes de que pase por `qa-testing`/`seguridad` — es un gate
de fidelidad visual, no de funcionalidad ni de seguridad.

## Vista normal / fallback (implementa: onboarding-ux)
Ahora mismo es un volcado de texto plano sin jerarquía — hay que tratarla
con la misma identidad visual que el modo terminal, no como una página aparte.

- **Tipografía y color**: misma fuente monoespaciada y paleta del tema
  activo (no un verde/magenta fijo sin relación al tema elegido en la
  sesión de terminal).
- **ASCII banner**: el mismo logo ASCII que aparece en el boot de la
  terminal se repite arriba de esta vista, como ancla de identidad.
- **Proyectos como tarjetas, no como lista de texto**: cada proyecto lleva
  nombre, descripción, chips de stack (mismo estilo que los chips de
  comandos), Y un link visible a la demo (`Ver proyecto →`, usa el campo
  `url` de `Project` en `content.ts`) — ahora mismo el stack se muestra
  pero el link a la demo falta por completo.
- **Espaciado y jerarquía**: separación clara entre secciones (about,
  proyectos, skills, contacto), no todo corrido en el mismo bloque de texto.
- **Consistencia con el cromo de ventana**: misma superficie a pantalla
  completa que el modo terminal (ver "Cromo de ventana" arriba) — sin
  panel flotante ni fondo visible alrededor, la barra de título superior
  se mantiene igual en ambas vistas.

**Criterio de aceptación**: cada proyecto en la vista normal muestra un
link funcional a su demo (no solo el stack tecnológico), y el ASCII banner
está presente en esta vista igual que en el boot de terminal.

## Revisión 2026-07-16 (onboarding-ux: revert a pantalla completa) — APROBADO
Revisado `src/style.css` contra "Cromo de ventana" y "Vista normal /
fallback". Resultado:

- `.window`: limpio, sin `max-width`/`box-shadow`/`border-radius` — OK.
- `body` (regla base): sin padding ni flex de centrado — OK.
- Padding de `#terminal`/`#fallback-content` (1.75rem) intacto — OK,
  es contenido, no panel, según lo definido arriba.
- `body { padding: 0.75rem }` residual en `@media (max-width: 600px)`
  fue eliminado por onboarding-ux — ver "Bug conocido a evitar: `body`
  con padding residual en mobile" arriba, marcado RESUELTO.

Veredicto final: **aprobado**. El cambio a pantalla completa es fiel al
spec en todos los breakpoints, sin fondo residual visible alrededor de
`.window` en mobile ni en desktop.
