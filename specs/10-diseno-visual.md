### Bug conocido a evitar: labels de categoría invisibles en windows-xp — RESUELTO
Los textos INFO/CONTACTO/SISTEMA/EXTRA no se veían en windows-xp — el color
usado no tenía contraste suficiente contra el fondo claro de ese tema
(`#ece9d8`). Causa: el label usaba un gris fijo pensado para fondos oscuros
(como en los demás temas), en vez de leer `--dim` del tema activo
dinámicamente.

**Corrección aplicada (themes, revisada por diseno-visual):** se agregó
`dim: string` a `ThemeTokens`, cableado en `applyTheme()` como `--dim`.
`cyberpunk`/`linux`/`dos`/`hacker` usan `rgba(255, 255, 255, 0.5)`
(≈5.32:1 contra sus fondos oscuros). `windows-xp` usa **`#5a5a5a`**
(≈5.67:1 contra `#ece9d8`) en vez del `#6b6b6b` sugerido originalmente en
este spec.

**Nota sobre la desviación del hex sugerido:** el `#6b6b6b` de la versión
anterior de este documento era un ejemplo aproximado, no un valor exacto
obligatorio — el criterio real siempre fue el contraste mínimo, no un hex
específico. Se verificó con la fórmula de luminancia relativa WCAG:
`#6b6b6b` contra `#ece9d8` da ≈4.376:1, por debajo del umbral 4.5:1
(hubiera dejado el bug parcialmente sin resolver). `#5a5a5a` da ≈5.67:1,
cumple con margen. Cálculo de themes verificado y correcto — `#5a5a5a`
queda como el valor de referencia para `windows-xp` de acá en adelante.

**Criterio de aceptación**: en los cinco temas, los cuatro labels de
categoría tienen contraste mínimo 4.5:1 contra el fondo — verificado con
captura de Playwright, con foco específico en windows-xp donde estaba roto.
Pendiente: confirmar visualmente con Playwright (qa-testing u
onboarding-ux) que el `--dim` se está leyendo dinámicamente en runtime,
no solo que el token existe en `themes.ts`.
