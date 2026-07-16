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
     del panel de terminal, con columnas de caracteres cayendo a opacity
     muy baja (5-8%) y velocidad lenta — corre todo el tiempo mientras el
     tema hacker está activo, no es el comando `matrix` (ese sigue siendo
     el easter egg a pantalla completa). Es ambiental y permanente, y por
     sí solo ya hace que el tema se sienta estructuralmente distinto, no
     solo "linux con más brillo".
   - Cursor con animación de "respiración" (pulso de glow), no solo blink
     on/off como en los demás temas.
   - Chips con anillo de glow visible en hover (`box-shadow` con blur alto).
   - Scanlines visibles (no sutiles como en cyberpunk).

**Criterio de aceptación**: alguien que ve linux y hacker uno al lado del
otro, sin leer el nombre del tema, los identifica como temas distintos en
menos de 2 segundos — no solo "el mismo pero más verde".

Ver distinción base contra `linux` en `03-temas.md`.

### Revisión de diseño-visual (2026-07-16)

Estado de implementación revisado contra `src/themes/themes.ts`,
`src/themes/ambientRain.ts` y `src/style.css`. **Veredicto: aprobado**,
los 6 elementos pedidos están cubiertos:

1. Glow doble capa — tokens `GLOW_PX`/`GLOW_PX_2`, tier `"intense"`
   exclusivo de hacker (`--theme-glow-2`).
2. Flicker — `data-theme-flicker="1"`, animación `theme-flicker`,
   gateada por data-attribute (no por nombre de tema), desactivada en
   `prefers-reduced-motion: reduce`.
3. Lluvia ambiental — módulo separado (`ambientRain.ts`) del comando
   `matrix`, canvas propio `z-index: -2`, opacity 0.07 (dentro del rango
   5-8% pedido), redibuja 1 de cada 4 frames, se auto-desactiva con
   `prefers-reduced-motion: reduce`.
4. Cursor "breathe" — `data-cursor-style="breathe"`, animación
   `cursor-breathe`, distinto del blink de los demás temas.
5. Chips con anillo de glow en hover — `--theme-chip-hover-glow` (20px
   en `intense` vs 6-10px en el resto).
6. Scanlines marcadas — tier `"intense"` (opacity 0.07) por encima de
   `"visible"` de cyberpunk (0.035).

Mecanismo coherente con el patrón ya establecido para
linux/cyberpunk/dos: todo pasa por `ThemeTokens` y se aplica vía
`applyTheme()` con CSS custom properties y data-attributes — no hay
`if (theme === "hacker")` hardcodeado en CSS ni en JS de UI.

**Nota de proceso (no de diseño)**: el comentario en
`src/themes/themes.ts` (líneas ~147-149) indica que el tema hacker ya
está en producción "pese al bloqueo formal del spec", por decisión
verbal del usuario. Este documento sigue marcado BLOQUEADO como
gate formal de `orchestrator`; diseño-visual no tiene autoridad para
levantar ese bloqueo, solo evaluó fidelidad visual del resultado. Si el
bloqueo se levantó, debe reflejarse explícitamente acá (fecha + quién
lo autorizó) para que el spec no quede contradictorio.

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
