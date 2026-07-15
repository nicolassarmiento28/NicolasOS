# 04-contenido.md

## Objetivo
Datos reales del portafolio, tipados y centralizados en `src/data/content.ts`.

## Datos confirmados por el usuario
- [x] Bio (about / whoami) — provista, incluye rol, stack principal y foco en
      herramientas de IA/agentes/spec-driven development.
- [x] Proyectos: descripción, stack, link — 6 proyectos reales (SaasChatbot IA,
      Dashboard Analítico de Wrestling, PetShop SPA + Webpay, VG Collection,
      CineList, Space Runner), tomados de `portfolio/src/data/projects.json`.
- [x] Skills por categoría — frontend, backend, y una categoría de IA/agentes
      (LLMs, AI Agents, Spec-Driven Development, Claude Code), tomados de
      `portfolio/src/data/skills.json` + confirmación del usuario.
- [x] Email / contacto y URLs de GitHub y LinkedIn — provistos.
- [ ] CV (archivo o link) — no provisto todavía, no bloquea el resto.

## Experiencia laboral: NO existe, decisión explícita del usuario
El usuario confirmó que no tiene experiencia laboral formal. **No inventar,
inferir ni completar esta sección con datos genéricos o placeholder.**
El comando `experience` (ver `02-comandos-core.md`) debe eliminarse del
registro de comandos — no debe existir un comando que muestre una timeline
vacía o simulada. Si en el futuro el usuario consigue experiencia laboral
real, se reabre este punto y se vuelve a agregar el comando.

**Criterio de aceptación**: `content.ts` no tiene ningún valor `TODO`
pendiente salvo el CV, cada proyecto cumple la interfaz `Project` (id, name,
desc, stack, url), y no existe ningún campo ni comando de "experiencia
laboral" en el contenido ni en el registro de comandos.

## Depende de
Nada técnicamente, pero bloquea a `01-onboarding-ux.md` (vista fallback) y
a `02-comandos-core.md` en la práctica (los comandos `about`, `projects`,
`skills`, `contact` muestran este contenido; `experience` fue eliminado,
ver sección anterior).
