# ITINERA v0.31 · portada simplificada con LUMEN-V

## Cambios

- Se elimina de la portada el bloque grande:
  - Buscador guiado
  - Buscar estudos
  - campo de búsqueda
  - tipo
  - familia
  - localidad

- La zona verde de la portada queda organizada como una sucesión lógica:
  1. LUMEN-V, conocer vocación.
  2. Explorar estudios.
  3. Simular ruta.
  4. Resolver dudas con ItineraBot.
  5. Verificar fuentes oficiales.

- El buscador no desaparece por completo, pero queda como acción ligera dentro del paso “Explorar estudios”, para no cargar la portada.

- Se fuerza el favicon nuevo con:
  - `assets/favicon-itinera.png?v=0.31`
  - `assets/favicon.ico?v=0.31`

## Archivos modificados

```text
index.html
app.js
styles.css
package.json
README.txt
INSTRUCCIONES_V031_PORTADA_LUMEN.md
```

## Nota sobre LUMEN-V

El enlace se define en el código como:

```text
https://aulatribeca.github.io/lumen-v/
```

Puede cambiarse en el futuro mediante `window.ITINERA_LUMEN_URL` si decides publicar LUMEN-V en otra ruta.

## Instalación

Copia los archivos modificados, haz commit y push. Después abre con Ctrl + F5.

No requiere SQL.
