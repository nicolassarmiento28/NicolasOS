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
- No debe bloquear el input del terminal mientras corre (funcionalmente:
  el parser y el historial siguen operando).
- El overlay cubre visualmente la terminal (es el efecto buscado), así
  que además tiene que haber una forma de salir que NO dependa de ver
  la pantalla: tecla `Escape` detiene la animación, y un hint de texto
  fijo sobre el propio canvas indica "Escape para salir" mientras corre.

**Criterio de aceptación**: test de que `matrix` no rompe el parser ni
el historial mientras la animación está activa. Test de que `Escape`
detiene la animación. Verificación visual (Playwright) de que el hint
de salida es legible sobre el canvas.

## Analítica de comandos
- Trackear qué comandos usa la gente, sin cookies de terceros invasivas.

## Depende de
Todo lo anterior (01 a 05, y 07).
