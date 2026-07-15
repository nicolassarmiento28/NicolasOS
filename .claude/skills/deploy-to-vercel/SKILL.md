---
name: deploy-to-vercel
description: Usar cuando el usuario dice "deploy", "vercel", "prepará el deploy", "está listo para producción" o similar. Corre el checklist de pre-deploy (build, tests, npm audit, revisión de seguridad) y deja el proyecto listo para que el usuario ejecute el deploy real él mismo. NO ejecuta "vercel deploy" ni ningún comando que dispare un deployment — eso lo maneja el usuario directamente, según specs/00-arquitectura.md.
---

# Deploy to Vercel — checklist de preparación

Esta skill prepara y valida, nunca despliega. El deploy real lo hace el
usuario desde su máquina o el dashboard de Vercel.

## Checklist, en este orden

1. **Build limpio**
   ```
   npm run build
   ```
   Si falla, reportar el error y no seguir con el resto del checklist.

2. **Tests en verde**
   ```
   npm test
   ```
   Todo el proyecto, no solo el módulo tocado últimamente.

3. **Auditoría de dependencias**
   ```
   npm audit
   ```
   Bloquear solo si hay vulnerabilidades altas o críticas (ver `specs/08-seguridad.md`).

4. **Revisión de seguridad puntual**
   Delegar a (o aplicar el checklist de) el subagente `seguridad`:
   XSS en input renderizado, `target="_blank"` sin `rel="noopener noreferrer"`,
   ninguna credencial en código de cliente.

5. **Config de Vercel presente**
   Confirmar que existe `vercel.json` (si el proyecto lo necesita) y que
   `package.json` tiene el script `build` apuntando a la salida correcta
   para que Vercel la detecte automáticamente.

6. **Reporte final al usuario**
   Un resumen corto: qué pasó en cada paso, y si algo requiere que el
   usuario configure algo manualmente en el dashboard de Vercel (variables
   de entorno, dominio custom, etc. — esto NO se puede verificar desde acá).

## Si todo pasa

Decir explícitamente: "el proyecto está listo para deploy — corré `vercel`
o `vercel --prod` vos mismo, o pusheá a la rama conectada si tenés deploy
automático configurado". No ofrecerse a correr ese comando.

## Si algo falla

Detenerse en el primer paso que falla, reportarlo con el error exacto, y
no seguir con los pasos siguientes hasta que se corrija.
