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
