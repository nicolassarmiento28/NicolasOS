# 11-mejoras-interaccion.md

> **AUDITADO (2da ronda) — 3/4 criterios PASAN, 1 bloqueante real encontrado.**
> `qa-testing` y `seguridad` verificaron cada criterio uno por uno.
> Resultado:
> - **Autocompletado con Tab: PASA** (corregido tras la 1ra ronda —
>   `tests/core/autocomplete.test.ts` cubre match único y prefijo
>   ambiguo; seguridad confirma que no roba foco del resto de la página).
> - **Preview de `theme`: PASA**, con un hueco menor no bloqueante — no
>   hay verificación automatizada de que los 5 colores sean
>   *visualmente* distinguibles entre sí (requeriría captura/inspección
>   de píxeles vía Playwright, no existe en el repo todavía). El
>   `aria-label` específico por tema sí está testeado.
> - **`sound on/off`: PASA** — arranca desactivado, anti-solapamiento
>   real, sin persistencia indebida, sin URLs remotas.
> - **Boot extendido: NO PASA — bloqueante real, distinto al de la 1ra
>   ronda.** `bootDurationMs()` y `skip()` están bien testeados en
>   aislamiento, pero en `src/main.ts:250-251`, `skipBoot` no usa el
>   cancelador real que devuelve `runBootSequence` — llama a
>   `finishBoot()` directamente. Resultado: al saltar el boot, los
>   `setTimeout` de tipeo siguen corriendo en background sobre un `<div>`
>   ya desmontado, y `onComplete`/`finishBoot` se puede disparar una
>   segunda vez cuando esos timers residuales terminan solos. El test
>   anterior no lo detectó porque solo probaba `skip()` aislado, no el
>   wiring real de `main.ts`.
> - `npm audit` no se corrió en esta pasada — pendiente antes de cerrar
>   la fase.
>
> **No se marca "completado" hasta que el bug de boot se corrija, se
> corra `npm audit`, y vuelva a pasar por los mismos gates.**

## Objetivo
Nueva ronda de features, posterior al cierre auditado de 01-08 y
06-effects-v2. No reabre esos specs — los referencia cuando corresponde,
pero vive acá como su propio dominio con su propio criterio de cierre.

## 1. Autocompletado con Tab (implementa: core-engine)
- Al presionar `Tab` con texto parcial en el input, si hay una sola
  coincidencia entre los comandos disponibles, autocompleta el input a
  ese comando completo (ej. `pro` + Tab → `projects`).
- Si hay más de una coincidencia (ej. un prefijo ambiguo), Tab no
  autocompleta — en su lugar, lista las opciones que coinciden, mismo
  patrón que el autocompletado de bash.
- No interfiere con la navegación normal del input (no debe robarle el
  foco al teclado tab-navegable del resto de la página).

### Bug corregido y verificado (2da ronda de auditoría)
~~En `src/main.ts:205-206`, el handler llamaba `e.preventDefault()` para
cualquier Tab presionado~~ — **corregido**: `tests/core/autocomplete.test.ts`
confirma match único (`pro` → `projects`) y prefijo ambiguo (lista sin
autocompletar a ciegas). Seguridad confirmó que la función es pura
(compara contra listas internas fijas) y que no roba foco del resto de
la página.

**Criterio de aceptación**: test que confirma que `pro` + Tab completa a
`projects` cuando es la única coincidencia. Test de que un prefijo
ambiguo (si existiera más de un comando con el mismo prefijo) lista las
opciones en vez de completar a ciegas.

## 2. Preview en vivo del comando `theme` (implementa: themes + diseno-visual)
- Al escribir `theme` sin argumento, además de listar los nombres, mostrar
  una muestra visual chica (swatch) del color de acento/fondo de cada
  tema — no solo texto plano con el nombre.
- Accesibilidad: cada swatch lleva un `aria-label`/texto alternativo con
  el nombre del tema, para que no sea información puramente visual (un
  swatch de color solo no le sirve a alguien con lector de pantalla).
- La dirección visual exacta del swatch (tamaño, forma, espaciado) la
  define `diseno-visual` en `10-diseno-visual.md` antes de implementar —
  agregar ahí la sección correspondiente en vez de improvisarlo en el código.

**Criterio de aceptación**: captura de Playwright confirma que `theme`
sin argumento muestra un swatch de color distinguible por tema. Test de
accesibilidad confirma que cada swatch tiene su texto alternativo.

## 3. Sonidos de teclado, opt-in (implementa: themes, mismo patrón que `music`)
- Comando `sound on` / `sound off` — **arranca desactivado por default**,
  mismo principio que `music`: nunca autoplay, nunca activo sin acción
  explícita del usuario.
- Sonido corto y de volumen bajo por tecla presionada. Si el usuario
  escribe rápido, los sonidos no deben apilarse ni generar distorsión —
  usar un pool de audio o debounce para evitar solapamiento.
- No persiste en `localStorage` sin opt-in adicional — mismo criterio que
  ya aplicamos a `analytics.ts`, la preferencia de sonido vive solo en la
  sesión actual salvo que se decida lo contrario explícitamente.

**Criterio de aceptación**: test que confirma que el sonido nunca se
activa sin el comando explícito `sound on`. Test/verificación de que
escribir rápido no genera solapamiento audible perceptible.

## 4. Boot sequence extendido, estilo BIOS/Linux (implementa: onboarding-ux)
- Antes del ASCII banner y el hint de ayuda (que ya existen, ver
  `01-onboarding-ux.md`), agregar un log de boot corto simulando arranque
  real (ej. `Cargando módulos...  OK`, `Montando filesystem...  OK`),
  con el mismo efecto de escritura que ya define `10-diseno-visual.md`.
- **Debe ser corto y salteable** — un visitante que vuelve al sitio no
  tiene por qué esperar el mismo boot largo cada vez. Duración total
  agregada sugerida: 1.5-2.5 segundos. Cualquier tecla o click lo salta
  directo al estado final (ASCII banner + hint + chips).

**Criterio de aceptación**: test de que el boot log completo (sin saltar)
no supera ~2.5 segundos. Test de que presionar cualquier tecla o hacer
click durante el boot lo salta inmediatamente al estado final.

### Bug encontrado en auditoría (2da ronda): timer huérfano al saltar el boot
`bootDurationMs()` y `skip()` están bien testeados **en aislamiento**,
pero el wiring real en `src/main.ts:250-251` no los usa correctamente:
`skipBoot` no captura el cancelador que devuelve `runBootSequence` —
llama a `finishBoot()` directamente por su cuenta. Resultado: al saltar
el boot, los `setTimeout` de tipeo del texto siguen corriendo en
background sobre un `<div>` ya desmontado, y `onComplete`/`finishBoot` se
puede disparar una segunda vez cuando esos timers residuales terminan
solos — el test anterior no lo detectó porque solo probaba `skip()`
aislado, nunca el wiring real de `main.ts`.

**Fix**: `skipBoot` debe capturar el valor de retorno de
`runBootSequence` (el cancelador real) e invocarlo, en vez de llamar
`finishBoot()` por su cuenta. El test que falta debe ejercer el wiring
completo (`main.ts`), no solo la función `skip()` en aislamiento — mismo
tipo de gap que tuvo el bug de Tab en la 1ra ronda (test en aislamiento
que no cubre la integración real).

## Depende de
Nada bloqueante — 01 a 08 y 06-effects-v2 ya están cerrados. Este spec no
los reabre, cada feature de acá referencia el spec correspondiente
cuando corresponde (`01-onboarding-ux.md`, `03-temas.md`,
`10-diseno-visual.md`) sin modificar su estado de cierre.

## Criterio de cierre de este dominio
Los 4 criterios de aceptación de arriba en verde, auditados por
`qa-testing` y `seguridad` con el mismo rigor que el resto — no marcar
"completado" solo porque "se ve bien".
