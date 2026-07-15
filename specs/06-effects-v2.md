# 06-effects-v2.md

> DESBLOQUEADO. 01, 02, 03, 04, 05, 07 y 08 están completos.
> Temas 4 y 5 y `matrix` ya implementados y aprobados (ver
> specs/03-temas.md). Queda pendiente: `music` y analítica de comandos.

## Objetivo
Sumar las features más "cosméticas" y de mayor riesgo de UX una vez que
el MVP ya está validado con uso real.

## Temas adicionales
4. windows xp — titlebar azul Luna, fuente tipo Tahoma, bordes 3D
5. hacker — verde matrix, scanlines marcadas

## `music`
- Loop ambiental de fondo, **siempre opt-in explícito**, nunca autoplay.
- Volumen bajo por default.

**Criterio de aceptación**: el audio nunca arranca sin que el usuario
ejecute `music` explícitamente, y hay forma clara de apagarlo.

## `matrix`
- Animación de lluvia de código en canvas.
- Corre DETRÁS de la terminal, nunca la tapa — el usuario debe poder
  seguir viendo el prompt, el output y escribiendo comandos con la
  animación de fondo. `#terminal` (`src/style.css`) es `position: static`
  sin z-index propio, así que un `z-index` positivo en el canvas
  (elemento `fixed`) siempre pinta por encima sin importar el valor —
  hace falta `z-index` **negativo** en el canvas para que quede detrás.
- No debe bloquear el input del terminal mientras corre (funcionalmente:
  el parser y el historial siguen operando).
- `Escape` también detiene la animación, como atajo rápido — pero no es
  la única forma de salir, ya que `matrix` (mismo comando) sigue visible
  y tipeable en todo momento al no estar tapada la terminal.

**Criterio de aceptación**: test de que `matrix` no rompe el parser ni
el historial mientras la animación está activa. Test de que `Escape`
detiene la animación. Verificación visual (Playwright) de que la
terminal (prompt, output, input) sigue siendo legible y usable con la
animación corriendo.

## Analítica de comandos
- Trackear qué comandos usa la gente, sin cookies de terceros invasivas.

## Depende de
Todo lo anterior (01 a 05, y 07).
