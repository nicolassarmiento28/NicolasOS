# 07-qa-testing.md

## Objetivo
Estándar de cobertura de tests que aplica a todos los demás dominios.
No es una fase, es un gate transversal.

## Reglas
- Todo módulo en `src/commands/`, `src/core/` y `src/themes/` tiene un
  test correspondiente en `tests/` antes de poder commitearse.
- Los tests deben cubrir el criterio de aceptación descrito en el spec
  de dominio correspondiente, no solo "que no tire error".
- Ningún commit se hace con tests en rojo.
- Ningún commit se hace con `npm run build` en rojo — `npm test` puede
  pasar en verde y el build fallar igual (ej. tipos de TypeScript faltantes
  como `@types/node`). Ambos son obligatorios, no solo el primero.

## Checklist antes de aprobar una tarea de cualquier otro dominio
1. ¿El test corresponde al criterio de aceptación del spec, o es trivial?
2. ¿Corre en aislamiento (no depende de estado de otro test)?
3. ¿`npm test` pasa en verde para todo el proyecto, no solo el módulo nuevo?
4. ¿`npm run build` pasa en verde? (esto detecta errores de tipos que los
   tests unitarios no siempre cubren, como módulos nativos de Node sin
   `@types/node` instalado)

## Depende de
Nada — se aplica sobre el trabajo de todos los demás dominios.
