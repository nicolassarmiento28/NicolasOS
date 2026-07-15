# CLAUDE.md

## Proyecto
NicolasOS — portafolio de Nicolás Sarmiento simulando un sistema operativo
de terminal. El visitante interactúa vía comandos en vez de navegar secciones.

Antes de implementar cualquier feature, leer `specs/00-arquitectura.md`
y el spec numerado del dominio correspondiente a la tarea.

## Stack
- Vite + TypeScript (sin framework)
- Vitest para tests
- Deploy: Vercel (lo maneja el usuario directamente, no tocar esa config)

## Specs por dominio (specs/)
- `00-arquitectura.md` — visión, stack, estructura, convenciones
- `01-onboarding-ux.md` — boot, descubribilidad, fallback no técnico
- `02-comandos-core.md` — parser, historial, comandos base
- `03-temas.md` — sistema de temas (cyberpunk, linux, dos en v1)
- `04-contenido.md` — datos reales del portafolio
- `05-seo-fallback.md` — SEO, OG tags, contenido en el DOM
- `06-effects-v2.md` — matrix, music, temas extra (BLOQUEADO hasta cerrar el resto)
- `07-qa-testing.md` — estándar de cobertura de tests, transversal
- `08-seguridad.md` — riesgos de XSS, links externos, dependencias, transversal

## Subagentes disponibles (.claude/agents/)
- `orchestrator` — punto de entrada para avanzar sin especificar tarea puntual; decide orden y hace cumplir los gates
- `core-engine` — motor de terminal y comandos base
- `content` — datos reales del portafolio
- `themes` — sistema de temas
- `onboarding-ux` — boot, chips tappeables, fallback no técnico
- `qa-testing` — valida cobertura de tests antes de aprobar un commit
- `seguridad` — revisa XSS, links externos, npm audit, antes de cerrar cualquier fase
- `devops` — build, scripts, config para Vercel (sin ejecutar el deploy)

## Skills (.claude/skills/)
- `command-pattern` — firma obligatoria, alias, manejo de errores y test
  pareado para cualquier módulo en src/commands/. Se consulta sola cuando
  se crea o toca un comando, no hace falta invocarla a mano.
- `deploy-to-vercel` — checklist de pre-deploy (build, tests, audit,
  seguridad). NO ejecuta el deploy real, solo prepara y valida.

## Herramientas externas — uso obligatorio, no opcional
Committeadas en `.mcp.json` (sin secretos en texto plano). Se usan SIEMPRE
en su etapa, no solo cuando se acuerden:

- **Playwright MCP** — `onboarding-ux`, `qa-testing` y `seguridad` lo usan
  siempre para verificar en navegador real: chips tappeables, temas,
  mobile, links externos. 
- **Context7 MCP** — se consulta antes de asumir una API de Vite/Vitest/TS
  por memoria. 
- **Vercel MCP** (solo lectura) — `devops` lo usa para ver logs de build.`
- **Skills** 
`deploy-to-vercel`** — se corre siempre antes de decir que algo
  está listo para producción (no ejecuta el deploy real).
`ponytail`** — Usa siempre Ponytail para ahorro de tokens en cada tarea del proyecto.

Primera vez que se abre el proyecto: Claude Code pide aprobar los
servers de `.mcp.json` — aceptar, o correr `/mcp`. Verificar todo con
`claude mcp list`.

## Comandos de desarrollo
- `npm run dev` — servidor local
- `npm test` — corre tests con Vitest
- `npm run build` — build de producción

## Flujo de trabajo
Si el usuario no especifica tarea puntual, usar `orchestrator` como
punto de entrada — decide qué sigue y delega él mismo. Si el usuario
sí especifica dominio o tarea, se puede ir directo al subagente:
1. Tomar una tarea del spec de dominio correspondiente.
2. Delegar al subagente que tiene ese dominio en su alcance.
3. `qa-testing` valida cobertura de tests, y `seguridad` revisa riesgos
   (XSS, links externos, dependencias) antes de aprobar.
4. Si pasa → commit convencional (`feat(commands): add projects command`) → push.
5. Si falla → se corrige antes de seguir.
6. No abrir `06-effects-v2.md` hasta que 01, 02, 03, 04, 05, 07 y 08 estén cerrados.
7. Desarrollo fase por fase: al cerrar todas las tareas de un dominio,
   orchestrator se detiene y espera confirmación explícita antes de
   arrancar el siguiente. No encadena dominios solo.

## No tocar
- Config/deploy de Vercel — lo maneja el usuario.
- `src/effects/` hasta que `06-effects-v2.md` esté habilitado explícitamente.
