# ITINERA v0.33 · selector de estudios, FP ampliada, PDF y simulador centrado en la ruta

## Cambios

### PDF
- El botón de descarga del itinerario ya no depende de jsPDF/CDN externo.
- Se incorpora un generador PDF propio en JavaScript.
- Descarga un PDF real con:
  - título;
  - estudio seleccionado;
  - rutas marcadas;
  - materias;
  - ponderaciones;
  - disponibilidad;
  - salidas profesionales;
  - fuentes.

### Catálogo
- Se amplía el catálogo base con muchos estudios de FP.
- Se incluye Electromecánica de Vehículos Automóviles.
- Se añaden ciclos de automoción, informática, sanidad, administración, comercio, hostelería, imagen personal, imagen y sonido, edificación, agraria, alimentaria, textil y artes gráficas.

### Selector de estudios
- El simulador deja de depender de escribir manualmente la meta.
- Se añade un desplegable organizado por familias profesionales y áreas.
- Dentro de cada familia, los estudios aparecen por orden alfabético.
- Incluye filtro para encontrar rápido un estudio dentro del desplegable.

### Simulador
- La simulación gráfica de la ruta es el elemento principal.
- La información complementaria aparece debajo, en apartados desplegables:
  - materias;
  - ponderaciones;
  - disponibilidad;
  - salidas profesionales;
  - fuentes.
- Los pasos siguen siendo clicables y abren una ventana visible.

### ItineraBot
- Se refuerza la conexión al endpoint de Supabase.
- Se mantiene respuesta de respaldo si el backend tarda o falla.

## Archivos modificados

```text
index.html
app.js
styles.css
package.json
README.txt
INSTRUCCIONES_V033_SELECTOR_FP_PDF_SIMULADOR.md
```

## Instalación

Copia archivos, commit y push. Después abre con Ctrl + F5.

No requiere SQL.
