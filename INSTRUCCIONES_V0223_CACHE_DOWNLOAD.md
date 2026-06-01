# ITINERA v0.22.3 · cache de descarga oficial

## Diagnóstico

v0.22.2 confirmó que el workflow está bien integrado, pero GitHub Actions no descarga directamente UNIVBASE ni los PDFs de CIUG mediante `fetch`. Esta versión cambia la estrategia: primero intenta descargar esos ficheros con `curl` y los guarda en `tools/official-load/cache`; después el importador Node lee esa cache local.

## Archivos modificados

```text
tools/official-load/import-v022-macrointegral.mjs
.github/workflows/itinera-v022-macrointegral-refresh.yml
package.json
supabase/itinera_v0_22_3_cache_download_fix.sql
README.txt
INSTRUCCIONES_V0223_CACHE_DOWNLOAD.md
```

## Pasos

1. Copia los archivos modificados.
2. Haz commit y push.
3. Ejecuta en Supabase:

```text
supabase/itinera_v0_22_3_cache_download_fix.sql
```

4. Ejecuta en GitHub:

```text
Actions → ITINERA v0.22 macrointegral refresh → Run workflow
```

5. En el log del workflow revisa el paso:

```text
Download difficult official files with curl cache
```

Debe mostrar `ls -lh tools/official-load/cache`. Si los ficheros pesan solo unos pocos bytes o no existen, el bloqueo es de descarga remota y habrá que usar carga manual controlada.

## Consulta de comprobación

```sql
select
  (select count(*) from public.itinera_university_offers) as university_offers,
  (select count(*) from public.itinera_ciug_cutoffs) as ciug_cutoffs,
  (select count(*) from public.itinera_ciug_ponderations) as ciug_ponderations,
  (select count(*) from public.itinera_fp_galicia_offer) as fp_galicia_offer,
  (select count(*) from public.itinera_fp_specializations) as fp_specializations,
  (select count(*) from public.itinera_integral_status) as integral_status;
```

Y:

```sql
select id, block, status, count_value, source_id, notes, checked_at
from public.itinera_integral_status
order by block;
```
