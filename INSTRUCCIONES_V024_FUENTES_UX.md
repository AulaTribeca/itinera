# ITINERA v0.24 · Fuentes oficiales, organización y estética premium

## Objetivo

Esta versión optimiza la presentación general de ITINERA y reorganiza especialmente el apartado de **Fuentes oficiales**.

La herramienta queda más limpia, sencilla, dinámica e intuitiva, sin perder rigor: el estado del catálogo ya no aparece como un bloque grande redundante en Inicio, sino como una sección breve y orientativa dentro de Fuentes oficiales.

## Cambios principales

### Fuentes oficiales

- Rediseño completo del apartado de fuentes.
- Buscador interno de fuentes por organismo, tema, categoría o utilidad.
- Filtros lógicos:
  - Todas
  - Verificación básica
  - Universidad
  - CIUG
  - FP
  - Becas y cupos
  - Normativa
- Tarjetas más claras y compactas.
- Cada fuente muestra:
  - tipo de fuente,
  - utilidad,
  - ámbito,
  - botón directo de apertura.
- El **estado actual del catálogo** pasa a ser una sección pequeña y orientativa dentro de Fuentes oficiales.

### Organización general

- Inicio más limpio.
- Navegación simplificada.
- Eliminación visual de paneles redundantes de estado.
- Menos texto explicativo en pantalla principal.
- Avisos de rigor conservados, pero más breves y mejor ubicados.

### Traducciones

Se añaden traducciones completas para las nuevas secciones en:

```text
Galego
Español
English
Français
Polski
Deutsch
```

### Estética y movimiento

- Estilo más premium y ligero.
- Tarjetas con profundidad suave.
- Transiciones discretas.
- Microinteracciones en botones y tarjetas.
- Animación de entrada respetando `prefers-reduced-motion`.

## Archivos modificados

```text
index.html
app.js
styles.css
package.json
README.txt
INSTRUCCIONES_V024_FUENTES_UX.md
```

## Pasos

1. Copia los archivos modificados en el repositorio.
2. Haz commit y push.
3. Abre la web y pulsa Ctrl + F5.

No requiere SQL nuevo.

## Comprobación visual

Revisa:

```text
Inicio
Fuentes oficiales
Cambio de idioma
Navegación principal
Buscador de fuentes
Filtros de fuentes
Vista móvil
```

## Nota de rigor

Esta versión mejora la interfaz, no altera los datos oficiales. El estado del catálogo sigue siendo orientativo y los datos dinámicos, notas, ponderaciones, plazas y oferta por centro, deben comprobarse en la fuente oficial vigente.
