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

**Estado (revisado 2026-07-16)**: aprobado sin cambios. `.window` (en
`src/style.css`) es el único elemento con `border-radius`/`overflow:
hidden`/`box-shadow`; `.titlebar` y `#terminal` no definen ninguno de los
tres. No había bug activo — confirmado por revisión de código, no hizo
falta tocar nada.

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

**Estado (revisado 2026-07-16)**: aprobado. El contenido de la titlebar
(puntos, texto, botón) es una única plantilla HTML compartida entre
`#window` y `#fallback-window` (`src/main.ts`), así que por construcción
está presente en los tres temas — no hay riesgo de que un estilo se quede
sin alguno de los elementos. El bug real era de contraste, no de
contenido: el tema `dos` tenía texto blanco (`--theme-text`) sobre titlebar
blanca. Se agregó el token `titlebarText` a `ThemeTokens`
(`src/themes/themes.ts`), independiente de `text`, aplicado vía
`--theme-titlebar-text` en `.titlebar-text` y en `#fallback-toggle`/
`#fallback-close`. Valores por tema: `dos` → `#000000` (contraste sobre
titlebar blanca), resto conserva el color de acento/texto original. Padding
de `#terminal` (1.75rem, 1.25rem en mobile) y de `body` (2rem/1rem,
0.75rem en mobile) evita texto pegado al borde en todos los viewports
revisados.

## ASCII banner (implementa: onboarding-ux)
- Logo ASCII de "NicolasOS" (o iniciales) se muestra antes de los chips de
  `help`, como parte del boot inicial.
- Usa el color de acento del tema activo, no un color fijo.
- Requiere `white-space: pre` (o `pre-wrap`) en el contenedor — sin esto,
  los caracteres de arte ASCII se desalinean entre líneas.
- `line-height`: preferir `1` a `1.1`. **Excepción documentada**: con la
  fuente monoespaciada actual (`Courier New`/`Consolas`) y los caracteres
  de caja del banner de `src/main.ts` (`ASCII_BANNER`), `1.1` corta las
  líneas — se verificó que `1.2` es el valor mínimo sin overlap ni corte.
  `1.2` es aceptable como techo mientras no cambien la fuente o el arte
  ASCII; si se cambia cualquiera de los dos, volver a probar si `1.1`
  alcanza. Implementado en `.ascii-banner` (`src/style.css`) con comentario
  `ponytail:` explicando el motivo — no hace falta re-litigar esto en cada
  revisión futura, ya quedó evaluado y aceptado acá.
- En mobile, si el ancho del banner no entra en el viewport, preferir
  `overflow-x: auto` (scroll horizontal contenido, sin cortar líneas) antes
  que reducir el tamaño de fuente — a tamaños chicos los caracteres de caja
  se vuelven ilegibles/se solapan. El resto del contenido de la vista
  (chips, prompt, texto de boot) sigue sin scroll horizontal.

**Criterio de aceptación**: captura de Playwright confirma que las líneas
del ASCII art no se superponen ni se cortan, en terminal y en vista normal.

**Estado (revisado 2026-07-16)**: aprobado con la excepción de
`line-height: 1.2` documentada arriba (antes decía "bug" sin más detalle;
ahora el criterio real es "sin overlap ni corte", medible, y `1.2` lo
cumple donde `1.1` no). El uso de `overflow-x: auto` en mobile en vez de
achicar la fuente es la resolución correcta según este mismo spec (prioriza
legibilidad de los caracteres de caja sobre "quepa sin scroll").

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
