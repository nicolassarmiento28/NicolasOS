### Bug conocido a evitar: botón de cambio de vista poco visible
En el tema cyberpunk, el botón "Vista normal"/"Vista terminal" no se
distingue bien del fondo con gradiente magenta-cian de la barra de título
— probablemente un problema de contraste/opacity entre el color del botón
y el fondo detrás. El botón debe tener contraste suficiente (ratio mínimo
4.5:1 con su fondo inmediato) en los tres temas v1, no solo en los que
tienen fondo de titlebar más oscuro/plano.

**Estado: RESUELTO.** `src/main.ts` (`syncTitlebarGradientClass`) togglea
la clase `titlebar-gradient` en `<html>` cuando `--theme-titlebar`
computado contiene `"gradient"`, y `src/style.css` le da fondo sólido
`rgba(10, 0, 20, 0.75)` a `#fallback-toggle`/`#fallback-close` en ese
caso. Contraste calculado a mano (no medido con Playwright): ~9.9:1 y
~13.5:1 contra los puntos más claros del gradiente cyan/magenta con texto
`#f0f0f0` — cumple el mínimo de 4.5:1. Falta confirmación con captura de
Playwright (criterio de abajo sigue abierto formalmente).

**Nota no bloqueante:** el mecanismo (detección de string `"gradient"` en
runtime + `MutationObserver` sobre `style` de `documentElement`) funciona,
pero es más mecanismo que el patrón de tokens ya establecido en
`03-temas.md` (`glowIntensity`, `scanlinesIntensity`, `chipRadius`,
`showTitlebarDots`). Una alternativa más simple y coherente sería un
token booleano en `Theme` (ej. `titlebarNeedsSolidChrome: boolean`, sólo
`true` en cyberpunk) seteado una vez dentro de `applyTheme()`, sin
necesidad de parsear el valor del gradiente ni observar mutaciones. No se
exige el cambio — el resultado visual actual cumple el criterio — pero si
`themes` vuelve a tocar esta zona, considerar migrar a token.

**Criterio de aceptación**: captura de Playwright del botón en los tres
temas v1 confirma que es claramente legible/distinguible del fondo de la
barra de título en cada uno, no solo en linux y dos.
- El padding interno generoso (24-32px) se mantiene para que el texto no
  toque los bordes del viewport, pero eso es padding del contenido, no un
  margen que deje ver un fondo distinto alrededor de un panel.

**Criterio de aceptación**: captura de Playwright en distintos tamaños de
viewport confirma que no hay ningún área de fondo visible entre el
contenido de la terminal y el borde de la ventana del navegador — todo es
una sola superficie continua, sin sombra ni borde redondeado generando
sensación de panel separado.

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
