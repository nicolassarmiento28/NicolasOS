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
- El padding interno generoso (24-32px) se mantiene para que el texto no
  toque los bordes del viewport, pero eso es padding del contenido, no un
  margen que deje ver un fondo distinto alrededor de un panel.

### Controles de la barra de título — estilo Windows en todos los temas
Los controles de ventana pasan de "3 puntos estilo macOS" a **estilo
Windows** (minimizar `_`, maximizar/restaurar `□`, cerrar `X`, alineados a
la derecha) en **todos los temas v1, sin excepción** — incluido `linux`.
(La austeridad de `linux` frente a `hacker` se mantiene por otras
propiedades — sin glow, sin scanlines, chips rectos, ver `03-temas.md` —
los controles de ventana ya no son parte de esa diferenciación.)

Los tres controles tienen función real, ninguno es decorativo puro:
- **`□` (maximizar/restaurar)** → reemplaza al botón separado "Vista
  normal"/"Vista terminal" que existía antes — esta es ahora la única
  forma de cambiar de vista desde la barra de título, integrada al
  control de ventana en vez de un botón aparte.
- **`_` (minimizar)** → easter egg: mensaje tipo "esto no minimiza nada,
  pero lindo intento" en el output, sin acción real.
- **`X` (cerrar)** → easter egg: mensaje tipo "no podés cerrarme tan
  fácil" en el output, sin acción real.

Los íconos usan el color de texto/acento del tema activo (no colores fijos
de Windows real) — mantienen coherencia con la paleta de cada tema. El
tema `windows-xp` es la excepción de estilo (no de presencia): ahí sí
pueden llevar el look bevelled 3D auténtico de la Luna theme, ya que ese
tema completo está pensado para imitar Windows literalmente.

**Criterio de aceptación**: captura de Playwright confirma controles estilo
Windows (`_ □ X`) alineados a la derecha en los CINCO temas (cyberpunk,
linux, dos, windows-xp, hacker) — ninguno queda sin ellos. Test de que `□`
cambia de vista correctamente, y que `_`/`X` muestran su mensaje de easter
egg sin romper nada.

### Bug conocido a evitar: puntos estilo macOS todavía presentes
Los 3 puntos de colores estilo macOS (rojo/amarillo/verde tipo semáforo)
siguen apareciendo en el build junto a los controles nuevos `_ □ X`. Se
sacan **por completo, en los cinco temas, sin excepción** — no conviven
con los controles estilo Windows, los reemplazan totalmente. Si quedó
algún componente/CSS que renderiza esos puntos, hay que eliminarlo, no
solo ocultarlo con `display: none` condicional (evitar deuda muerta en el
código).

**Criterio de aceptación**: captura de Playwright confirma que no aparece
ningún círculo de color en la barra de título de ningún tema — solo los
controles `_ □ X`.

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
- **sistema**: theme, view, clear, history
- **extra**: sudo, matrix, music, stats

Los del grupo "extra" NO llevan menos contraste de color — deben usar
exactamente los mismos colores/bordes que el resto de las categorías (en
windows-xp quedaron casi invisibles por bajar opacity/color, hay que
revertir eso). Si se quiere diferenciarlos como "easter eggs" y no
acciones primarias, hacerlo únicamente con tamaño levemente menor, nunca
con menos contraste — la legibilidad no se sacrifica por jerarquía visual.

**Criterio de aceptación**: captura de Playwright confirma que los chips
del grupo "extra" tienen el mismo contraste de color que los demás grupos,
en los cinco temas — ninguno se ve significativamente más tenue que el resto.

### Bug conocido a evitar: labels de categoría invisibles en windows-xp
Los textos INFO/CONTACTO/SISTEMA/EXTRA no se ven en windows-xp — el color
usado no tiene contraste suficiente contra el fondo claro de ese tema
(`#ece9d8`). Causa más probable: el label está usando un gris fijo pensado
para fondos oscuros (como en los demás temas), en vez de leer `--dim` del
tema `windows-xp` específicamente, que ya está definido como `#6b6b6b` —
un gris medio con contraste correcto contra ese fondo claro. No es "usar
el mismo gris que los otros temas" (cada tema tiene su propio `--dim` a
propósito), es confirmar que el componente lee la variable del tema activo
dinámicamente en vez de un valor compartido hardcodeado.

**Criterio de aceptación**: en los cinco temas, los cuatro labels de
categoría tienen contraste mínimo 4.5:1 contra el fondo — verificado con
captura de Playwright, con foco específico en windows-xp donde se sabe
que está roto ahora mismo.

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

**Causa raíz confirmada (no es desync de eventos de composición):**
`field-sizing: content` mide el `#input` al pixel exacto del ancho del
glyph. Ese ancho justo no deja margen para el hinting/antialiasing del
render real en mobile, y el borde del carácter queda recortado — aunque
el ancho ya se haya actualizado a tiempo (se confirmó vía
`getBoundingClientRect` vs `scrollWidth`/`measureText` en Playwright que
el valor computado coincide con el contenido, el corte es de render, no
de timing). Los listeners de `compositionupdate`/`compositionend` en
`main.ts` (`syncInputWidth`) siguen siendo necesarios como fallback en
`ch` para navegadores sin `field-sizing`, pero no son la causa de este
bug específico.

**Fix**: `padding-right: 0.4em` en `#input` (`src/style.css`), como
margen de seguridad sobre el ancho exacto que calcula `field-sizing:
content`. Si se ajusta este valor, mantenerlo lo bastante grande para
cubrir el peor caso de hinting en fuentes monoespaciadas reales de
dispositivo, no solo en el viewport emulado de Playwright.

**Criterio de aceptación**: captura de Playwright que escribe una sola
letra y confirma que se renderiza completa y sin distorsión — en viewport
mobile (390x844). Si se reporta que sigue viéndose cortado en un
dispositivo real después de este fix, subir `padding-right` en vez de
reintroducir lógica de composition-event, salvo que se confirme con
evidencia (no solo el síntoma) que el desync de eventos es la causa.

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
- **Botón explícito de retorno**, además del control `□`: en la vista
  normal específicamente, sumar un botón con el texto exacto **"Volver a
  la terminal"** en el cuerpo de la página, no solo el ícono `□` de la
  barra de título. El público de esta vista es justo el que no quiere
  lidiar con la metáfora de terminal — para esa persona, un ícono sin
  etiqueta es poca información. En la vista terminal el ícono `□` solo
  alcanza (ese usuario ya está cómodo con la interfaz de comandos), no
  hace falta duplicar ahí.

**Criterio de aceptación**: en la vista normal, además del control `□` en
la barra de título, existe un botón con el texto exacto "Volver a la
terminal" que vuelve a la vista terminal — visible sin necesidad de hacer
scroll hasta el final de la página (ej. cerca del ASCII banner, al principio).

**Criterio de aceptación**: cada proyecto en la vista normal muestra un
link funcional a su demo (no solo el stack tecnológico), y el ASCII banner
está presente en esta vista igual que en el boot de terminal.
