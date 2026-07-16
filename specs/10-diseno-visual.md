# 10-diseno-visual.md

## Objetivo
Dirección de arte transversal a `03-temas.md` y `01-onboarding-ux.md`. Este
spec no define QUÉ funcionalidad existe (eso ya está en esos dos), define
CÓMO se ve y se siente — para que ambos dominios implementen consistente
en vez de resolver la estética cada uno por su lado.

## Cromo de ventana (implementa: onboarding-ux)
- Panel contenedor con `max-width` (900-1000px), centrado en el viewport,
  no el contenido tocando el borde de la pantalla.
- Barra de título falsa arriba: 3 puntos de colores (rojo/amarillo/verde,
  estilo macOS) a la izquierda, texto `nicolas@os: ~` centrado.
- Bordes redondeados sutiles (8-10px) y sombra difusa hacia abajo.
- Padding interno generoso (24-32px) — nunca texto pegado al borde del panel.
- El botón "Vista normal" vive DENTRO de esta barra de título, con el mismo
  lenguaje visual del tema activo (no un botón blanco genérico).

### Bug conocido a evitar: doble contenedor (ventana "flotando" sobre otra)
El titlebar y el body de la terminal deben ser hijos directos de UN SOLO
contenedor padre, con `overflow: hidden` y el `border-radius` definido
únicamente en ese padre. Ni el titlebar ni el body llevan su propio
`border-radius` o `box-shadow` independiente — si cada uno tiene el suyo,
visualmente se ve como dos ventanas superpuestas en vez de una sola pieza.

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

## ASCII banner (implementa: onboarding-ux)
- Logo ASCII de "NicolasOS" (o iniciales) se muestra antes de los chips de
  `help`, como parte del boot inicial.
- Usa el color de acento del tema activo, no un color fijo.
- Requiere `white-space: pre` (o `pre-wrap`) y `line-height: 1` a `1.1` en
  el contenedor — sin esto, los caracteres de arte ASCII se superponen o
  se desalinean entre líneas (bug visto en la vista normal, donde el logo
  se ve roto/ilegible).
  - **Ajuste documentado (revisado por diseno-visual)**: con la fuente y
    los caracteres de caja usados en el banner actual, `line-height: 1.1`
    corta las líneas — `1.2` es el valor mínimo real sin overlap, probado
    con Playwright (ver `src/style.css`, `.ascii-banner`). Se acepta como
    excepción documentada al rango sugerido; si se cambia la fuente o el
    arte ASCII, re-verificar si `1.1` vuelve a ser viable.

**Criterio de aceptación**: captura de Playwright confirma que las líneas
del ASCII art no se superponen ni se cortan, en terminal y en vista normal.

### Bug conocido a evitar: banner pegado al texto siguiente — RESUELTO
Faltaba espaciado vertical entre el ASCII art y la línea de texto que viene
después (ej. "NicolasOS — escribe help..."). Corregido con
`margin: 0 0 1.2em` en `.ascii-banner` (`src/style.css`), que separa el
banner del texto siguiente con más de una línea en blanco de margen.

**Criterio de aceptación**: captura de Playwright confirma un espacio
vertical visible entre el ASCII art y el texto que lo sigue.

**Estado**: revisado por `diseno-visual` por lectura de código
(`src/style.css`) — aprobado, fiel al criterio.

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

### Bug conocido a evitar: caret desacoplado del texto — RESUELTO
El cursor parpadeante (el "caret", el punto de inserción de texto) debe
fluir junto con lo que el usuario va tipeando — es un elemento `inline-block`
dentro del mismo contenedor que el prompt y el input, inmediatamente
después del último carácter escrito. NO debe tener `position: absolute`
con coordenadas fijas — eso lo deja pegado a un punto fijo (ej. el borde
izquierdo) en vez de moverse con el texto.

Corregido en `src/style.css` (`#input` pasa de `flex: 1` a `width: 1ch;
flex: none`) y `src/main.ts` (`syncInputWidth()`, llamada en `input` y tras
`keydown` de Enter/ArrowUp/ArrowDown), que ajusta el ancho del input al
largo del texto tipeado (`Nch`) para que `#cursor`, que le sigue en el
flujo normal, quede siempre inmediatamente después del último carácter en
vez de pegado al borde derecho del contenedor. No usa `position: absolute`.

**Criterio de aceptación**: test o captura de Playwright que escribe texto
en el input y confirma que el cursor aparece inmediatamente después del
último carácter, no en una posición fija.

**Estado**: revisado por `diseno-visual` por lectura de código
(`src/style.css`, `src/main.ts`) — aprobado, fiel al criterio. Nota no
bloqueante: el resize de `width` ocurre en saltos de `1ch` por tecla, sin
transición CSS; con fuente monoespaciada el salto es imperceptible y el
spec no exige suavizado de ancho, así que no se pide ajuste.

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
- **Consistencia con el cromo de ventana**: si el modo terminal tiene panel
  con bordes redondeados y barra de título, esta vista vive dentro del
  mismo tipo de contenedor, no a pantalla completa sin marco.

**Criterio de aceptación**: cada proyecto en la vista normal muestra un
link funcional a su demo (no solo el stack tecnológico), y el ASCII banner
está presente en esta vista igual que en el boot de terminal.
