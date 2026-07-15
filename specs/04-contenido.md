# 04-contenido.md

## Objetivo
Datos reales del portafolio, tipados y centralizados en `src/data/content.ts`.

## Pendiente de confirmar con el usuario
- [ ] Bio (about / whoami)
- [ ] Proyectos: descripción, stack, link — SaaS AI Platform, WWE Dashboard,
      PetShop, VG Collection, Movie Search
- [ ] Skills por categoría
- [ ] Experiencia laboral (timeline)
- [ ] Email / contacto
- [ ] URLs de GitHub y LinkedIn
- [ ] CV (archivo o link)

**Criterio de aceptación**: `content.ts` no tiene ningún valor `TODO` pendiente,
y cada proyecto cumple la interfaz `Project` (id, name, desc, stack, url).

## Depende de
Nada técnicamente, pero bloquea a `01-onboarding-ux.md` (vista fallback) y
a `02-comandos-core.md` en la práctica (los comandos `about`, `projects`,
`skills`, `experience`, `contact` muestran este contenido).
