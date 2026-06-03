# ITINERA v0.29 · logo nuevo, portada limpia y simulador avanzado

## Cambios principales

### Logo
- Se sustituye el logo por la nueva versión aportada.
- Se genera versión con fondo transparente.
- Se actualizan:
  - `assets/itinera-logo-full.png`
  - `assets/itinera-logo-mark.png`
  - `assets/itinera-symbol.png`
  - `assets/favicon-itinera.png`
  - `assets/favicon.ico`

### Portada
- Se elimina la información de versión.
- Se añade el logo nuevo a la portada.
- Se elimina el bloque de texto “Ferramentas propias”.
- El panel derecho contiene solo tres accesos:
  - ItineraBot
  - Simular itinerario
  - Buscador de estudos
- Se reduce el peso visual general de la portada.

### Encabezado
- Se ordenan las secciones.
- Los accesos superiores quedan como texto con línea dinámica.
- Se elimina la píldora visible de versión.

### Pie de página
- Se reduce la escala visual del pie.
- Se mantiene: “Ecosistema educativo Tribeca”.

### Simulador
- Simulador completamente en gallego.
- Muestra Bacharelato recomendado.
- Muestra materias recomendables.
- Muestra ponderaciones si existen o avisa de consultar CIUG/fuente oficial.
- Muestra dónde está disponible el estudio seleccionado según los datos cargados.
- Las rutas se muestran con recorrido visual y dinámico.
- Cada paso del itinerario es clicable y abre información específica.
- Mantiene fuentes oficiales para verificar cada bloque.

## Archivos modificados

```text
index.html
app.js
styles.css
package.json
README.txt
INSTRUCCIONES_V029_LOGO_PORTADA_SIMULADOR.md
assets/itinera-logo-full.png
assets/itinera-logo-mark.png
assets/itinera-symbol.png
assets/favicon-itinera.png
assets/favicon.ico
```

## Instalación

Copia los archivos modificados, haz commit y push. Después abre la web con Ctrl + F5.

No requiere SQL.
