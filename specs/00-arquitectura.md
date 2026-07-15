# 00-arquitectura.md

## Visión
NicolasOS — portafolio de Nicolás Sarmiento simulando un sistema operativo
de terminal. El visitante interactúa vía comandos en lugar de navegar por secciones.

## Stack
- Vite + TypeScript (sin framework)
- Vitest para tests unitarios
- `@types/node` como devDependency (necesario en cuanto cualquier test o
  módulo use `node:fs`, `node:path`, etc. — sin esto el build falla en
  Vercel aunque `npm test` pase en verde)
- Deploy: Vercel (lo maneja el usuario directamente)
- Sin backend — 100% estático

## Estructura de carpetas
```
src/
  core/         motor de terminal: parser de input, historial, render de output
  commands/     un módulo por comando
  themes/       tokens de color/tipografía por tema
  data/         contenido real: proyectos, skills, experiencia, contacto
  effects/      matrix.ts, music.ts (fuera de alcance hasta 06-effects-v2.md)
tests/          un test por módulo de src/
specs/          este archivo y los demás specs numerados por dominio
.claude/agents/ subagentes de Claude Code, uno por departamento
CLAUDE.md       contexto corto que se carga en cada sesión
```

## Specs por dominio
- `01-onboarding-ux.md` — boot, descubribilidad, fallback no técnico
- `02-comandos-core.md` — parser, historial, cada comando de terminal
- `03-temas.md` — sistema de temas y tokens
- `04-contenido.md` — datos reales del portafolio
- `05-seo-fallback.md` — SEO, OG tags, contenido en el DOM
- `06-effects-v2.md` — matrix, music, temas extra (bloqueado hasta cerrar el resto)
- `07-qa-testing.md` — estándar de cobertura de tests, transversal a todo
- `08-seguridad.md` — riesgos de XSS, links externos, dependencias, transversal a todo

## Tabla dominio → agente dueño
Antes de asignar cualquier tarea, confirmar acá el dueño — evita que un
subagente reciba trabajo fuera de su `alcance` declarado.

| spec de dominio | agente dueño |
|---|---|
| 01-onboarding-ux.md | onboarding-ux |
| 02-comandos-core.md | core-engine |
| 03-temas.md | themes |
| 04-contenido.md | content |
| 05-seo-fallback.md | onboarding-ux (misma superficie de contenido que la vista fallback) |
| 06-effects-v2.md | *(sin agente creado aún — bloqueado, no es urgente)* |
| 07-qa-testing.md | qa-testing (transversal) |
| 08-seguridad.md | seguridad (transversal) |
| build/deploy | devops |

Si `orchestrator` (o cualquier agente) no encuentra dueño claro para una
tarea en esta tabla, debe preguntarle al usuario antes de asignarla a
cualquiera "por descarte" — no improvisar un dueño.

## Convenciones de código
- Cada comando de terminal es un módulo independiente y testeable, con la
  misma firma de entrada/salida.
- Alias en español obligatorio para cada comando (ej: `projects` / `proyectos`).
- No commitear una tarea sin que su test correspondiente pase.
- Commits atómicos por tarea, mensajes convencionales
  (`feat(commands): add projects command`).

## Orden de dependencias entre dominios
```
02-comandos-core ──┬──> 03-temas ─────────┐
                    ├──> 04-contenido      ├──> 01-onboarding-ux ──> 06-effects-v2
                    └──> (tests base)     ─┘
                              │
                       07-qa-testing (transversal, revisa todo)
```

## No tocar
- Config/deploy de Vercel — lo maneja el usuario.
- `src/effects/` hasta que 06-effects-v2.md esté habilitado explícitamente.
