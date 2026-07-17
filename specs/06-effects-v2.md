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

**Criterio de aceptación**: test de que `matrix` no rompe el parser ni
el historial mientras la animación está activa.

## Analítica de comandos
- Trackear qué comandos usa la gente, sin cookies de terceros invasivas.

## Depende de
Todo lo anterior (01 a 05, y 07).
