# ITINERA v0.32 · PDF, ventanas de pasos, salidas profesionales e ItineraBot

## Cambios

### PDF del itinerario
- Añade botón para descargar el itinerario en PDF.
- Permite seleccionar qué rutas incluir.
- El PDF incluye:
  - encabezado ITINERA;
  - estudio/meta;
  - bachillerato o vía recomendada;
  - materias recomendables;
  - ponderaciones o aviso de consulta oficial;
  - disponibilidad cargada;
  - salidas profesionales;
  - rutas seleccionadas;
  - nota de verificación oficial.

### Ventanas de información
- Al hacer clic en cualquier paso del itinerario se abre una ventana visible encima del punto de clic.
- La ventana es cerrable.
- Muestra información específica y fuentes oficiales.

### Salidas profesionales
- Se añaden hasta 10 salidas profesionales para cada título del catálogo base.
- Si en el futuro se añade un título sin mapa específico, se genera una lista orientativa por tipo de estudio.

### ItineraBot
- Mantiene el endpoint real cuando esté disponible.
- Añade fallback rápido y útil si el endpoint tarda demasiado o no responde.
- Evita que parezca roto o bloqueado.

## Archivos modificados

```text
app.js
styles.css
package.json
README.txt
INSTRUCCIONES_V032_PDF_MODAL_JOBS_BOT.md
```

## Instalación

Copia archivos, commit y push. Después abre con Ctrl + F5.

No requiere SQL.
