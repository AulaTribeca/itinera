ITINERA v0.5

Cambios principales:
- El buscador de estudios ya no permite introducir ciudad ni centro como filtros directos.
- Se mantiene una localidad de residencia opcional para poder priorizar ofertas cercanas cuando el backend oficial esté activo.
- El buscador permite buscar sin introducir nombre de estudio, usando solo tipo y/o familia.
- El buscador muestra la estructura preparada para oferta en Galicia por provincias y centros, y evita inventar centros cuando no hay actualización oficial conectada.
- ItineraBot tiene botón propio y diferenciado en el encabezado.
- “Simula tu itinerario” tiene botón propio y diferenciado en el encabezado.
- El apartado Fuentes oficiales pasa a la zona derecha del encabezado.
- La licencia Creative Commons CC BY-NC-SA 4.0 aparece de forma clara en el pie de página.
- La portada incorpora un bloque verde para mejorar contraste visual.
- El simulador de itinerario se rediseña con tablero gráfico de nodos, más parecido a un recorrido visual.
- Se añade exportación a PDF mediante impresión del informe generado por el navegador.
- Se añaden archivos de backend para Netlify Functions con caché oficial y actualización programada.

Backend / actualización:
- Se incluye netlify.toml.
- Se incluye package.json con @netlify/blobs.
- Se incluye netlify/functions/studies-search.mjs.
- Se incluye netlify/functions/refresh-official-data.mjs, programada diariamente.
- Se incluye data/studies.seed.json como base inicial/fallback.

Importante:
- Para actualización constante real, esta versión debe desplegarse en Netlify con Functions y Netlify Blobs.
- No requiere Supabase.
- No requiere SQL.
- Si se publica solo como archivos estáticos, funcionará con la base local y enlaces oficiales, pero no con actualización persistente automática.

Archivos modificados/nuevos:
- index.html
- styles.css
- app.js
- README.txt
- netlify.toml
- package.json
- data/studies.seed.json
- netlify/functions/studies-search.mjs
- netlify/functions/refresh-official-data.mjs
