# 05-seo-fallback.md

## Objetivo
Que el sitio sea rastreable por buscadores y se comparta bien en redes,
a pesar de que la interacción principal es vía terminal/JS.

## Requisitos
- Contenido real (bio, proyectos, skills) presente en el DOM (oculto
  visualmente vía terminal si hace falta), no solo generado en runtime por JS.
- Meta tags Open Graph (título, descripción, imagen) para previews en
  LinkedIn/WhatsApp/Twitter.

**Criterio de aceptación**: al inspeccionar el "view source" / DOM inicial,
el contenido de proyectos/skills/bio está presente, no solo en un bundle JS
que recién se ejecuta en el cliente.

## Depende de
`04-contenido.md` (necesita los datos reales) y la vista fallback de
`01-onboarding-ux.md` (es la misma superficie de contenido).
