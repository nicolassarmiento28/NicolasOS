# 04-contenido.md

## Objetivo
Datos reales del portafolio, tipados y centralizados en `src/data/content.ts`.

## Estado real del contenido (sincronizado con capturas del build actual)
Confirmado presente y con datos reales, NO placeholders — visto
directamente en el sitio funcionando, no asumido:
- [x] Bio (`about` / `whoami`) — "Nicolás Sarmiento — Full Stack Developer",
      Viña del Mar, Chile, bio completa sobre React/TypeScript/Node.js/IA
- [x] Proyectos — 6 confirmados con descripción, stack y comando `open`
      funcionando: SaaSChatbot IA, Dashboard Analítico de Wrestling (WWE/AEW),
      PetShop SPA + Webpay, VG Collection, CineList, Space Runner
      (la lista original tenía 5 ítems distintos — confirmar con el usuario
      si "Movie Search" pasó a ser "CineList" o son proyectos distintos)
- [x] Skills por categoría — Frontend, Backend, IA/agentes, todos con
      tecnologías reales, no placeholders
- [x] Email / contacto — nicolas.sarmiento.jimenez@gmail.com confirmado
- [x] URLs de GitHub y LinkedIn — comandos `github`/`linkedin` funcionando

**Sin confirmar todavía — no asumir, verificar leyendo `content.ts` directamente:**
- [ ] CV — el comando `resume`/`cv` muestra "Abriendo CV..." en las
      capturas, pero eso solo confirma que el comando ejecuta algo, no que
      `resumeUrl` apunte a un archivo real en vez de seguir en `"#"`.

## Decisión: `experience`/`experiencia` descartado
El comando `experience` nunca se implementó y **se confirma descartado a
propósito**, no es un gap a resolver — decisión del usuario. Por
consistencia, el campo `experience` (timeline laboral) también se saca
del modelo de datos en `content.ts`: si no hay comando que lo muestre, no
tiene sentido mantenerlo en la interfaz de `profile`. Ver también el
mismo descarte reflejado en `02-comandos-core.md`.

**Criterio de aceptación**: `content.ts` no tiene ningún valor `TODO`
pendiente, no tiene el campo `experience` en el modelo de `profile`, y
cada proyecto cumple la interfaz `Project` (id, name, desc, stack, url)
con una URL real, no `"#"`. Antes de marcar este dominio como completado,
`content` (el subagente) debe leer `content.ts` directamente y confirmar
el estado real de `resumeUrl` — no inferirlo de capturas de pantalla.

## Depende de
Nada técnicamente, pero bloquea a `01-onboarding-ux.md` (vista fallback) y
a `02-comandos-core.md` en la práctica (los comandos `about`, `projects`,
`skills`, `contact` muestran este contenido).
