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

## Checklist antes de aprobar una tarea de cualquier otro dominio
1. ¿El test corresponde al criterio de aceptación del spec, o es trivial?
2. ¿Corre en aislamiento (no depende de estado de otro test)?
3. ¿`npm test` pasa en verde para todo el proyecto, no solo el módulo nuevo?

## Depende de
Nada — se aplica sobre el trabajo de todos los demás dominios.
