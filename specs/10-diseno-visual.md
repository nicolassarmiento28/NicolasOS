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
  **Aclaración**: "mismo lenguaje visual" significa usar variables de tema
  (`--theme-*`), no color fijo/hardcodeado. El borde puede usar
  `--theme-text` en vez de `--theme-accent` — ambos son tokens del tema y
  cumplen el criterio. Reservar `--theme-accent` para el borde es preferible
  si en algún momento se agrega, pero no es obligatorio: lo obligatorio es
  no hardcodear un color fuera del sistema de tokens.

**Criterio de aceptación**: en ningún viewport (mobile incluido) el texto
del terminal toca el borde de la pantalla sin padding.

## ASCII banner (implementa: onboarding-ux)
- Logo ASCII de "NicolasOS" (o iniciales) se muestra antes de los chips de
  `help`, como parte del boot inicial.
- Usa el color de acento del tema activo, no un color fijo.

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
- **extra**: sudo, matrix, music, stats, y cualquier comando del registry
  que no esté explícitamente listado en las otras tres categorías (ej.
  `help`, `open`, o comandos futuros no categorizados).

Los del grupo "extra" llevan menos peso visual: borde más tenue o tamaño
levemente menor que el resto — son easter eggs, no acciones primarias.

**Aclaración**: debe renderizarse UN SOLO bloque con label "extra", no
múltiples bloques con el mismo label (uno para comandos categorizados como
extra y otro como fallback de comandos no categorizados). Si el fallback de
comandos no listados usa una ruta de código distinta a la categorización
manual, unificar en un único grupo antes de renderizar — la separación en
dos bloques con el mismo título es un incumplimiento de este punto.

## Cursor y prompt (implementa: themes, vía tokens; onboarding-ux, vía render)
- Cursor de bloque parpadeante, color del acento del tema activo.
- El prompt (`nicolas@os:~$`) lleva un `text-shadow` sutil del mismo color
  de acento (efecto phosphor), configurable por tema.
- **Aclaración**: el cursor de bloque puede tener posición fija al final de
  la línea de input (no necesita reposicionarse dinámicamente siguiendo el
  ancho del texto tipeado mientras el usuario escribe). Seguir al caret en
  tiempo real es una mejora deseable a futuro, no un requisito de v1.

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
