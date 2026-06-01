# ITINERA v0.17 · Carga oficial completa progresiva

Este cargador importa datos y documentos desde fuentes oficiales hacia Supabase.

## Requisitos

```bash
npm install
```

Variables necesarias:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

No uses la service role key en `app-config.js` ni en GitHub Pages.

## Ejecución local

```bash
node tools/official-load/import-official-catalogs.mjs
```

Solo base inicial:

```bash
node tools/official-load/import-official-catalogs.mjs --seed-only
```

## Qué importa ahora

- Base inicial ya revisada de ITINERA.
- Documentos oficiales de la cola `itinera_official_import_queue`.
- Títulos de FP extraídos de páginas oficiales de TodoFP cuando el HTML lo permite.
- Alias de búsqueda para estudios importados.

## Qué queda como revisión obligatoria

- QEDU y RUCT pueden requerir conectores específicos o exportaciones oficiales si la web no expone datos fácilmente extraíbles.
- La oferta de FP Galicia cambia por curso y debe validarse por convocatoria.
- Ponderaciones, notas de corte, plazas, becas y cupos son datos cambiantes.

