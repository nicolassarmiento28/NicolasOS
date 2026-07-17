# 08-seguridad.md

## Objetivo
NicolasOS es un sitio estático sin backend, pero el input del usuario se
escribe libremente en el terminal y se renderiza en pantalla — ahí está
la superficie de riesgo real, no en credenciales de servidor.

## Riesgos específicos de este proyecto

### XSS vía input del terminal
- Cualquier texto que el usuario escribe (`echo`, comandos no reconocidos,
  argumentos de `open <n>`) eventualmente se muestra en pantalla.
- Si ese render usa `innerHTML` con el input crudo, es una inyección directa.

**Criterio de aceptación**: todo el input del usuario que se renderiza pasa
por escape de HTML antes de insertarse en el DOM. Test que confirma que
escribir `<img src=x onerror=alert(1)>` como comando no ejecuta nada,
solo se muestra como texto.

### Links externos (`github`, `linkedin`, `open <n>`, chips de proyectos)
- Todo `target="_blank"` debe llevar `rel="noopener noreferrer"` para evitar
  que la pestaña abierta pueda manipular la ventana de origen (tabnabbing).

**Criterio de aceptación**: test o lint que falla si aparece `target="_blank"`
sin `rel="noopener noreferrer"` en el mismo elemento.

### Datos en `localStorage` (si se implementa en el futuro)
- No guardar ahí nada sensible. Si en algún momento se agrega colección de
  datos del visitante, debe ser opt-in explícito y sin PII innecesaria.

### Dependencias
- Correr `npm audit` como parte del checklist antes de cerrar cada fase
  (no bloqueante para vulnerabilidades bajas, sí para altas/críticas).

### Content Security Policy
- Definir una CSP básica (vía meta tag o headers de Vercel) que restrinja
  `script-src` al propio origen, ya que no hay necesidad de scripts externos
  más allá de fuentes/CDN explícitamente usados.

### Si en el futuro se agrega cualquier API externa
- Ninguna API key va nunca en código de cliente ni en el repo. Si algún
  comando futuro necesita datos de un servicio externo, pasa por una función
  serverless propia (Vercel) que oculta la credencial del lado del servidor
  — mismo patrón que un proxy, nunca fetch directo desde el navegador con
  la key expuesta.

## Depende de
Nada — es transversal, igual que `07-qa-testing.md`, pero revisa seguridad
en vez de cobertura de tests.

## Checklist final de tests — antes de dar el proyecto por cerrado

Cada uno de estos debe existir como test automatizado (Vitest o Playwright
según corresponda), no solo como revisión manual — es lo que separa
"creemos que está bien" de "está probado que está bien".

### 1. XSS vía input del usuario
- Test: escribir `<img src=x onerror=alert(1)>` como comando y confirmar
  que se muestra como texto literal, sin ejecutar nada.
- Test: mismo caso con `echo`, y con argumentos de `open <n>` inválidos.
- Cubre: cualquier comando que refleje input crudo (no solo `echo`).

### 2. Links externos — `rel="noopener noreferrer"`
- Test: recorrer el DOM (o el código fuente vía grep en CI) y confirmar
  que TODO `target="_blank"` tiene `rel="noopener noreferrer"` en el
  mismo elemento — sin excepciones, incluidos los links que agregó
  `onboarding-ux` en la vista normal (proyectos, contacto).

### 3. `open <n>` no es un open redirect
- Test: confirmar que `open <n>` solo puede abrir URLs presentes en
  `content.ts` (`Project.url`), nunca una URL arbitraria construida a
  partir de input del usuario. Si `<n>` no corresponde a un proyecto
  real, debe fallar con mensaje, no intentar abrir nada.

### 4. Dependencias
- Test/script: `npm audit --audit-level=high` como parte del pipeline de
  cierre — falla si hay vulnerabilidades altas o críticas sin resolver.

### 5. Content Security Policy — confirmar que se implementó
Este requisito estaba en el spec desde el principio pero nunca se
confirmó su implementación real. Antes de cerrar:
- Verificar que existe una CSP (meta tag en `index.html` o header
  configurado en `vercel.json`) que restrinja `script-src` al propio
  origen.
- Test: confirmar que el header/meta tag está presente en el HTML
  servido, no solo documentado en el spec.

### 6. Persistencia de tema en `localStorage` (si se implementó)
Si en algún punto del desarrollo se agregó persistencia del tema
elegido (`localStorage`) — revisar si `themes` lo implementó como parte
del "tema por defecto: dos" de `03-temas.md`:
- Test: confirmar que el único dato guardado es el nombre del tema (string
  de una lista cerrada de valores válidos), nada de PII.
- Test: si se lee un valor de `localStorage` que no corresponde a ningún
  tema válido (manipulado manualmente en devtools, por ejemplo), la app
  no rompe — cae al tema por defecto en vez de aplicar un valor inválido.

### 7. Clickjacking
- Verificar/agregar `X-Frame-Options: DENY` o `Content-Security-Policy: frame-ancestors 'none'`
  vía headers de `vercel.json` — que el sitio no pueda embeberse en un
  `<iframe>` de otro dominio.

### Fuera de alcance (no hace falta testear)
- HTTPS/HSTS: lo maneja Vercel automáticamente, no depende del código del
  proyecto.
- Autenticación/autorización: no aplica, no hay backend ni datos de usuario.
- Rate limiting: no aplica, sitio 100% estático.

**Criterio de cierre**: los 7 puntos de arriba tienen test automatizado
pasando en verde. Recién ahí `seguridad` puede dar el visto bueno final
para considerar el proyecto cerrado en este frente.
