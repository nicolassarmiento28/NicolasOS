---
name: command-pattern
description: Usar SIEMPRE que se crea, modifica o revisa un módulo de comando en src/commands/ de NicolasOS — ya sea un comando nuevo (ej. "agregá el comando skills", "necesito un comando theme") o al tocar uno existente. También usar al escribir el test correspondiente en tests/commands/. Garantiza que todo comando tenga la misma firma de entrada/salida, alias en español, manejo de errores consistente, y su test pareado — tal como lo define specs/02-comandos-core.md. Consultar esta skill ANTES de escribir el archivo, no después.
---

# Patrón de comando — NicolasOS

Cada comando de terminal (`help`, `projects`, `theme`, etc.) es un módulo
independiente y testeable. Esta skill define la forma exacta que debe tener,
para que `core-engine` no la reinvente ligeramente cada vez.

## Firma obligatoria

Todo archivo en `src/commands/` exporta una función con esta forma:

```typescript
export interface CommandResult {
  output: string;   // texto/HTML a mostrar en el terminal, ya escapado si viene de input de usuario
  clearScreen?: boolean; // true solo para el comando `clear`
}

export function <nombreComando>(args: string[]): CommandResult {
  // lógica del comando
}
```

- El nombre del archivo es el nombre del comando en inglés: `projects.ts`, `theme.ts`.
- `args` son los argumentos ya separados por el parser (`open 2` → `args = ["2"]`).
- Nunca acceder al DOM directamente desde acá — el motor (`src/core/`) es quien
  toma `CommandResult` y decide cómo renderizarlo.

## Alias en español — obligatorio

Cada comando se registra con su alias en `src/core/registry.ts`, nunca
hardcodeado dentro del propio módulo del comando:

```typescript
{ en: "projects", es: "proyectos", handler: projectsCommand }
```

## Registro central — una sola fuente de verdad

`src/core/registry.ts` es EL único lugar donde vive el mapa
`nombre → handler`. `main.ts` lo importa para despachar comandos, y
`help.ts` lo importa para generar la lista de chips. Nunca crear una
segunda lista de nombres de comandos en otro archivo (ver
specs/02-comandos-core.md) — si `help` no refleja un comando nuevo, el
bug está en `help.ts` leyendo de otro lado, no en olvidarse de copiar
el nombre a mano.

## Manejo de errores dentro de un comando

- Si el comando recibe argumentos inválidos (ej. `open abc` en vez de un número),
  devolver un `CommandResult` con un mensaje claro, nunca lanzar una excepción
  sin capturar — eso rompería la sesión del terminal completo.
- Ejemplo: `{ output: "uso: open <número de proyecto>" }`

## Seguridad — ver también specs/08-seguridad.md

- Si el comando refleja input crudo del usuario en el `output` (ej. `echo`),
  ese texto tiene que pasar por una función de escape de HTML antes de
  insertarse — nunca interpolar directo en un template que después se use
  con `innerHTML`.

## Test pareado — obligatorio

Por cada `src/commands/<nombre>.ts` existe `tests/commands/<nombre>.test.ts`
que cubre, como mínimo:
1. El caso feliz (argumentos válidos).
2. El caso de argumentos inválidos o faltantes, si aplica.
3. Si el comando muestra contenido de `src/data/content.ts`, un test de que
   ese contenido aparece en el `output`.

```typescript
import { describe, it, expect } from "vitest";
import { projectsCommand } from "../../src/commands/projects";

describe("projectsCommand", () => {
  it("lista los proyectos numerados", () => {
    const result = projectsCommand([]);
    expect(result.output).toContain("1.");
  });
});
```

## Checklist antes de dar por terminado un comando
- [ ] Firma `(args: string[]) => CommandResult` respetada
- [ ] Alias en español registrado
- [ ] Errores manejados sin excepciones sin capturar
- [ ] Input de usuario reflejado (si aplica) pasa por escape HTML
- [ ] Test pareado en `tests/commands/` cubre caso feliz + caso inválido
- [ ] `npm test` pasa en verde
