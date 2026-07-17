   - **Fondo con lluvia de código ambiental**: una capa de fondo, detrás
     del panel de terminal, con columnas de caracteres cayendo. Probado en
     el build real con opacity 5-8% y resultó casi invisible — subir a
     **15-20% de opacity**, y además agregar un `text-shadow`/glow leve a
     los caracteres de la lluvia para que se lean mejor contra el negro.
     Sigue siendo sutil (no compite con el texto de la terminal en primer
     plano), pero tiene que notarse a simple vista sin tener que buscarlo.
     Corre todo el tiempo mientras el tema hacker está activo, no es el
     comando `matrix` (ese sigue siendo el easter egg a pantalla completa).
     **Debe cubrir el 100% del viewport** — igual que el fix de `matrix`
     de arriba, este efecto quedó pensado para el panel viejo con
     `max-width` y hay que actualizarlo a la superficie completa de
     `10-diseno-visual.md`.

     **Estado: RESUELTO (sin cambio de código necesario).** Confirmado por
     lectura de `src/themes/ambientRain.ts`: ya usaba
     `canvas.width/height = window.innerWidth/innerHeight` con
     `position: fixed; inset: 0`, no dimensiones del panel viejo con
     `max-width`. Cubre el 100% del viewport. Falta captura de Playwright
     para cerrar formalmente el criterio de aceptación de abajo.

     **Bug real encontrado post-build (2026-07-16) y su fix — aplica
     también a `matrix` de abajo:** el canvas SÍ estaba bien dimensionado,
     pero `.window` en `src/style.css` tenía `background: var(--theme-bg)`
     opaco, en flujo normal (sin z-index negativo) — como pinta después de
     `body` en la cadena de stacking, tapaba por completo el canvas fixed
     con z-index -1/-2 de ambos efectos, en cualquier tamaño de pantalla.
     No se notaba antes porque el panel viejo con `max-width` dejaba
     huecos de `body` visible donde sí se veía el canvas. Fix de
     `onboarding-ux`: se sacó el `background` de `.window`; el fondo lo
     sigue aportando `body` (mismo token `--theme-bg`), que pinta por
     debajo del canvas fixed sin taparlo. Revisado por `diseno-visual`:
     coherente con este criterio y con `10-diseno-visual.md` (mismo color
     de fondo en todos lados se mantiene porque `body` y `.window` usan el
     mismo `--theme-bg`). Sigue faltando captura de Playwright para cierre
     formal.
   - Cursor con animación de "respiración" (pulso de glow), no solo blink
     on/off como en los demás temas.
   - Chips con anillo de glow visible en hover (`box-shadow` con blur alto).
   - Scanlines visibles (no sutiles como en cyberpunk).

**Criterio de aceptación**: alguien que ve linux y hacker uno al lado del
otro, sin leer el nombre del tema, los identifica como temas distintos en
menos de 2 segundos — no solo "el mismo pero más verde".

Ver distinción base contra `linux` en `03-temas.md`.

## `music`
- Loop ambiental de fondo, **siempre opt-in explícito**, nunca autoplay.
- Volumen bajo por default.

**Criterio de aceptación**: el audio nunca arranca sin que el usuario
ejecute `music` explícitamente, y hay forma clara de apagarlo.

## `matrix`
- Animación de lluvia de código en canvas.
- No debe bloquear el input del terminal mientras corre.
- **Debe cubrir el 100% del viewport**, no las dimensiones del panel
  anterior (ese panel con `max-width` ya no existe, ver `10-diseno-visual.md`
  — la terminal ahora es pantalla completa, y el canvas de `matrix` tiene
  que actualizarse para cubrir esa misma superficie completa, no quedarse
  con un tamaño fijo viejo).

**Estado: RESUELTO (sin cambio de código necesario).** Confirmado por
lectura de `src/effects/matrix.ts`: ya usaba
`canvas.width/height = window.innerWidth/innerHeight` con
`position: fixed; inset: 0`. Cubre el 100% del viewport. Falta captura
de Playwright para cerrar formalmente el criterio de aceptación de abajo.

**Bug real encontrado post-build (2026-07-16):** ver nota completa en la
sección de lluvia ambiental de arriba — el canvas de `matrix` estaba bien
dimensionado, el problema era `.window` con fondo opaco tapándolo. Ya
resuelto sacando `background` de `.window` en `src/style.css`.

**Criterio de aceptación**: test de que `matrix` no rompe el parser ni
el historial mientras la animación está activa. Captura de Playwright
confirma que el canvas cubre el 100% del viewport en distintos tamaños
de pantalla.
