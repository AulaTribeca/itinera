# ITINERA v0.30 · logo, encabezado, simulador y traducciones

## Cambios principales

### Logo
- Se usa solo la imagen del logo, sin letras inferiores.
- Se actualiza en cabecera, portada, símbolo base y favicon.
- El logo completo con texto queda fuera de la interfaz.

### Título de la herramienta
La herramienta pasa a presentarse como:

```text
ITINERA | Orientación académica e deseño de itinerarios personalizados
```

En castellano:

```text
ITINERA | Orientación académica y diseño de itinerarios personalizados
```

El subtítulo aparece también junto al logo en el encabezado.

### Encabezado
- Se elimina la información visible de versión.
- Se ordena la cabecera.
- ItineraBot y Simulador tienen colores diferenciados entre sí y frente al resto, tomados de la paleta del logo.

### Simulador
- Interfaz más sencilla, visual y premium.
- Rutas con pasos clicables.
- Paneles claros para:
  - Bacharelato recomendado.
  - Materias recomendables.
  - Ponderacións.
  - Onde está dispoñible.
  - Itinerarios posibles.
- Si no existe ponderación exacta, se avisa de consultar CIUG o fuente oficial correspondiente.

### Traducciones
- Se traduce la interfaz general al idioma seleccionado.
- Se traducen los nombres de estudios cargados en el catálogo base.
- El idioma por defecto sigue siendo el galego.

## Archivos modificados

```text
index.html
app.js
styles.css
package.json
README.txt
INSTRUCCIONES_V030_LOGO_SIM_TRADUCCIONES.md
assets/itinera-logo-mark.png
assets/itinera-symbol.png
assets/favicon-itinera.png
assets/favicon.ico
```

## Instalación

Copia los archivos modificados, haz commit y push. Después abre la web con Ctrl + F5.

No requiere SQL.
