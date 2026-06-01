# ITINERA v0.20 · Depuración FP, cobertura visible y fichas

## Qué añade

1. Mejora del importador oficial:
   - reconoce mejor familias profesionales de FP por título y palabras clave;
   - corrige la URL de TodoFP para FP de Grado Básico;
   - conserva avisos no fatales si una fuente externa falla.

2. Nuevo SQL:
   - `supabase/itinera_v0_20_fp_cleanup.sql`

3. Mejora de la app:
   - panel visible de cobertura oficial en portada;
   - fichas más claras con estado del dato;
   - mejor agrupación en “Todos los estudios”;
   - aviso diferenciado para datos importados pendientes de revisión.

## Pasos

### 1. Copiar archivos

Copia los archivos modificados al repositorio, haz commit y push.

### 2. Ejecutar SQL en Supabase

En Supabase → SQL Editor → New query, ejecuta:

```text
supabase/itinera_v0_20_fp_cleanup.sql
```

Este SQL no borra datos. Corrige familias profesionales pendientes y actualiza el estado de cobertura.

### 3. Ejecutar de nuevo el workflow

En GitHub:

```text
Actions → ITINERA official catalog refresh → Run workflow
```

Así se intentará cargar también FP de Grado Básico con la URL corregida.

### 4. Comprobar conteos

En Supabase ejecuta:

```sql
select
  (select count(*) from public.itinera_studies) as studies,
  (select count(*) from public.itinera_study_aliases) as aliases,
  (select count(*) from public.itinera_sources) as sources,
  (select count(*) from public.itinera_official_documents) as official_documents,
  (select count(*) from public.itinera_source_coverage) as source_coverage,
  (select count(*) from public.itinera_official_import_queue) as import_queue,
  (select count(*) from public.itinera_studies where family ilike '%pendiente%') as studies_pending_family;
```

## Qué sigue después

La siguiente fase debe centrarse en Universidad:

- grados oficiales;
- másteres oficiales;
- másteres habilitantes;
- notas de corte y ponderaciones CIUG;
- campus y universidades.
