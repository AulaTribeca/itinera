# ITINERA v0.56 · proxecto completo reinstalable

Esta versión integra o mapa de Google My Maps achegado para a oferta de estudos en Galicia e substitúe os mapas estáticos anteriores.

## Que inclúe

- Portada con fondo dinámico e estética Tribeca.
- Acceso a `Buscador de estudos` e `Deseñar itinerario` na mesma pestana.
- Buscador de estudos con Google My Maps embebido.
- Botón para abrir o mapa directamente en Google Maps.
- Interface en galego.
- Encabezado eliminado nas páxinas internas.
- Catálogo local v0.53 conservado en `data/` como base documental e de respaldo.
- Recursos, iconas, datos e configuración necesarios para reinstalar o proxecto completo.

## Instalación en GitHub Pages

1. Descomprime este ZIP.
2. Sube todo o contido da carpeta do proxecto ao repositorio de GitHub.
3. Mantén a estrutura de ficheiros tal como está, co `index.html` na raíz.
4. En GitHub, entra en `Settings > Pages`.
5. Se usas despregamento desde rama, selecciona a rama correspondente e a raíz `/`.
6. Garda e espera a nova execución de Pages.

## Se GitHub Pages falla por artefactos duplicados

Se aparece o erro `Multiple artifacts named "github-pages" were unexpectedly found`, non é un erro do código de ITINERA. É un fallo do despregamento de GitHub Pages. A solución habitual é:

1. Abrir a execución fallida en Actions.
2. Pulsar `Re-run jobs`.
3. Escoller `Re-run all jobs`.

Se persiste, crea unha execución nova facendo un commit mínimo e evita reexecutar só o job de deploy.

## Supabase

Esta versión non require executar SQL nin modificar Supabase para funcionar coa integración do mapa de Google My Maps.
