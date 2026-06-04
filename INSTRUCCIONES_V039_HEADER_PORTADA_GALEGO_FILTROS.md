# ITINERA v0.39 · encabezado transparente, portada clara, galego y filtros dependientes

## Cambios aplicados

### Encabezado

- El encabezado tiene fondo transparente.
- Visualmente solo contiene la marca ITINERA.
- Se eliminan de la cabecera los botones de navegación, menú e idioma.

### Portada

- Se elimina el logo grande de la portada.
- Se mejora el contraste general.
- Los dos botones principales quedan sin fondo.
- Los botones tienen borde bastante más grueso, forma cuadrada y esquinas ligeramente suavizadas.
- Al hacer clic, cada botón lleva a una página interna dentro de la misma ventana:
  - `#buscar`
  - `#itinerario`

### Idioma

- La interfaz queda forzada en galego.
- Se normalizan al galego muchos textos de datos antiguos que estaban en castellano: niveles, familias, rutas, materias, requisitos y textos de ficha.

### Buscador

- Los filtros son ahora dependientes y excluyentes.
- Si se selecciona un nivel, el filtro de familias se reduce a las familias compatibles.
- Si se selecciona una familia, el filtro de niveles se reduce a los niveles compatibles.
- Si se escribe una búsqueda, ambos filtros se recalculan según las coincidencias reales.

## Supabase

No requiere SQL nuevo.

Si siguen faltando estudios, el problema ya no es de esta interfaz, sino de cobertura del catálogo cargado en Supabase o en los JSON locales. En ese caso hay que completar la base oficial de graos, másteres y doutoramentos en Supabase.

## Archivos modificados

```text
index.html
app.js
styles.css
package.json
README.txt
INSTRUCCIONES_V039_HEADER_PORTADA_GALEGO_FILTROS.md
```

## Instalación

1. Sustituye los archivos modificados.
2. Haz commit y push.
3. Abre la web con Ctrl + F5.
