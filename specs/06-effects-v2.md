# 06-effects-v2.md

> BLOQUEADO. No empezar ninguna tarea de este documento hasta que
> 01, 02, 03, 04, 05 y 07 estén completos: módulos implementados,
> tests pasando, commits hechos.

## Objetivo
Sumar las features más "cosméticas" y de mayor riesgo de UX una vez que
el MVP ya está validado con uso real.

## Temas adicionales
4. windows xp — titlebar azul Luna, fuente tipo Tahoma, bordes 3D
5. hacker — diferencia MARCADA contra linux, no solo más glow. Debe tener
   elementos que linux directamente no tiene, no solo versiones más
   intensas de lo mismo:
   - Verde saturado tipo Matrix (`#00ff41`), glow fuerte en dos capas
     (`text-shadow: 0 0 4px, 0 0 12px` del mismo color) — un halo real,
     no un glow sutil.
   - **Flicker sutil**: animación de parpadeo aleatorio muy leve en la
     opacidad del texto cada pocos segundos (efecto CRT viejo), algo que
     linux no tiene en absoluto.
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

### Bug conocido a evitar: la música no suena en mobile
En mobile, ejecutar `music` no produce sonido (sí funciona en desktop).
Causa más probable: las políticas de autoplay de navegadores mobile
(especialmente iOS Safari) exigen que la reproducción de audio arranque
**sincrónicamente dentro del mismo gesto del usuario** (el evento de touch/
click que ejecuta el comando) — si el código que arranca el audio pasa por
cualquier paso asíncrono antes de llamar a `play()`/`AudioContext.resume()`
(un `await`, una promesa, un `setTimeout`), el navegador ya no lo reconoce
como iniciado por el usuario y lo bloquea en silencio, sin error visible.

Revisar:
1. Que `AudioContext.resume()` (o `audio.play()`) se llame de forma
   síncrona dentro del handler del evento que ejecuta el comando `music`,
   no después de ningún `await`.
2. Si se usa Web Audio API, confirmar que el `AudioContext` se crea (o se
   resume si ya existía) en ese mismo call stack síncrono.
3. Verificar en un dispositivo iOS real si es posible — el simulador/
   Playwright mobile emulation no siempre reproduce fielmente las
   políticas de autoplay reales de iOS Safari.

**Criterio de aceptación**: test/captura en viewport mobile confirma que
`music` produce audio audible (verificar que el `AudioContext` pasa a
estado `running`, ya que Playwright no puede "escuchar" audio directamente
pero sí puede verificar el estado del contexto).

## `matrix`
- Animación de lluvia de código en canvas.
- No debe bloquear el input del terminal mientras corre.
- **Debe cubrir el 100% del viewport**, no las dimensiones del panel
  anterior (ese panel con `max-width` ya no existe, ver `10-diseno-visual.md`
  — la terminal ahora es pantalla completa, y el canvas de `matrix` tiene
  que actualizarse para cubrir esa misma superficie completa, no quedarse
  con un tamaño fijo viejo).

**Criterio de aceptación**: test de que `matrix` no rompe el parser ni
el historial mientras la animación está activa. Captura de Playwright
confirma que el canvas cubre el 100% del viewport en distintos tamaños
de pantalla.

### Bug conocido a evitar: matrix no cubre el viewport completo en mobile
En mobile, tanto en vista terminal como en vista normal, el canvas de
`matrix` deja franjas sin cubrir (arriba/costados). Esto pasa en **las
dos vistas por igual** — `matrix` sigue corriendo al cambiar a vista
normal (eso es el comportamiento esperado, no hay que detenerlo), pero en
ninguna de las dos cubre el 100% del viewport en mobile.

**Ya se intentó un fix con `resize` listener y no alcanzó** — persiste en
vista terminal. Hay que profundizar el diagnóstico, no repetir el mismo
approach. Puntos a revisar, en orden:

1. **Buffer del canvas vs tamaño CSS**: un canvas tiene dos tamaños
   distintos — el de dibujo (`canvas.width`/`canvas.height`, en píxeles
   reales) y el visual (`style.width`/`style.height`, CSS). Si solo se
   setea el CSS y no el buffer real, el contenido dibujado puede quedar
   escalado o recortado aunque el elemento "ocupe" el 100% visualmente.
   Confirmar que `canvas.width`/`canvas.height` se setean explícitamente
   en JS, multiplicados por `window.devicePixelRatio` (pantallas retina/mobile).

2. **`100vh` no es confiable en mobile**: la barra de direcciones del
   navegador que aparece/desaparece hace que `100vh` (CSS) no coincida
   con el alto real visible. Usar `window.visualViewport.height` y
   `window.visualViewport.width` (API específica para esto) en vez de
   `window.innerHeight`/`innerWidth`, y escuchar el evento
   `visualViewport.resize` además de (o en vez de) `window.resize`.

3. **Recalcular en el momento correcto**: el cálculo de tamaño debe
   correr después de que el DOM esté montado y visible, no antes — si
   corre demasiado temprano (antes de que el navegador termine de
   ajustar la barra de direcciones), toma un valor incorrecto que después
   ningún `resize` corrige porque no vuelve a dispararse.

Causa más probable combinando los tres puntos: el canvas seguramente está
usando `window.innerHeight`/`innerWidth` en vez de `visualViewport`, y/o
no está multiplicando por `devicePixelRatio` al setear el buffer real.

**Criterio de aceptación**: captura de Playwright en viewport mobile (ej.
390x844) confirma que el canvas de `matrix` cubre el 100% del alto y
ancho visibles, sin franjas sin cubrir, tanto en vista terminal como en
vista normal (con `matrix` activo en ambas). Verificar también en un
segundo tamaño de viewport mobile distinto (ej. 428x926) para confirmar
que no es un valor hardcodeado que solo funciona para un tamaño puntual.

### Bug conocido a evitar: texto del input ilegible sobre matrix en windows-xp
En el tema `windows-xp`, el color del prompt/texto tipeado (azul oscuro,
pensado para el fondo claro normal de ese tema) se vuelve ilegible cuando
`matrix` está activo, porque el canvas de la animación es oscuro/negro —
azul oscuro sobre negro no tiene contraste suficiente.

La causa raíz: el color del texto del input se calculó para funcionar
sobre el fondo NORMAL del tema, pero no se considera qué pasa cuando un
efecto (como `matrix`) cambia el fondo visible detrás. La solución no es
un parche puntual para windows-xp, sino un principio general: **la línea
de input que se está escribiendo activamente (no el historial ya impreso)
lleva un fondo semi-opaco propio** (un "pill" o barra de fondo detrás del
texto, con el color de fondo normal del tema y algo de opacidad, ej. 85-90%)
— así el texto del input siempre tiene el contraste para el que fue
diseñado, sin importar qué esté corriendo detrás (matrix, lluvia de
código de hacker, o cualquier efecto futuro).

**Criterio de aceptación**: test/captura de Playwright con windows-xp
activo + matrix corriendo confirma que el texto tipeado en el input sigue
siendo legible. Este mismo fix se verifica también en los otros temas
con efectos de fondo (hacker con su lluvia de código).

## Analítica de comandos
- Trackear qué comandos usa la gente, sin cookies de terceros invasivas.

## Depende de
Todo lo anterior (01 a 05, y 07).
