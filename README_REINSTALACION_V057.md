# ITINERA v0.57 · proxecto limpo reinstalable

Esta versión foi reconstruída desde unha base limpa, sen restos de estilos nin scripts das versións anteriores.

## Inclúe

- Portada con `assets/portada-itinera.png` como fondo real, sen velo, sen filtros e sen gradientes sobre a imaxe.
- Fondo dinámico sutil mediante movemento da imaxe, non mediante capas semitransparentes.
- Logo único: ITINERA + Orientación académica.
- Dous botóns transparentes con bordo groso.
- Buscador de estudos con Google My Maps embebido.
- Deseñador de itinerario orientativo en galego.
- Sen encabezados de navegación.
- Sen Supabase nin SQL.
- Estrutura estática apta para GitHub Pages.

## Reinstalación limpa

1. Baleira o repositorio ou elimina os ficheiros antigos antes de subir esta versión.
2. Sube todo o contido da carpeta `itinera-v57` á raíz do repositorio.
3. Conserva o ficheiro `.nojekyll`.
4. Se usas GitHub Actions, deixa só o workflow incluído en `.github/workflows/pages.yml` para evitar artefactos duplicados.
5. Se usas `Deploy from a branch`, podes eliminar a carpeta `.github` e publicar desde a rama configurada.

## Mapa

O mapa incorporado é o Google My Maps achegado:
`https://www.google.com/maps/d/embed?mid=1qWFM93eXZ6AdlOX6VB2OM03QP5tcI8o&ehbc=2E312F`

Para modificar puntos, capas ou marcadores hai que facelo no propio Google My Maps. A web cargará automaticamente a versión actual dese mapa.
