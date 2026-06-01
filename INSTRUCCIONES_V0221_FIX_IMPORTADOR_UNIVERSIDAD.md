# ITINERA v0.22.1 · corrección del importador macrointegral

## Qué corrige

En v0.22 el workflow terminaba en verde, pero la parte universitaria quedaba en cero porque fallaban las descargas desde el dominio antiguo de EDUCAbase/SIIU.

Esta versión:

- usa el dominio vigente `estadisticas.ciencia.gob.es`;
- usa las tablas UNIVBASE/EDUCAbase 2024;
- prueba varias distribuciones CSV oficiales;
- actualiza el estado padre `v022-university-offers`;
- evita que queden estados antiguos en `schema_ready` cuando ya se ha intentado la carga;
- mantiene CIUG como `in_progress_structured`, porque todavía no hay extracción tabular validada de PDFs.

## Archivos modificados

```text
tools/official-load/import-v022-macrointegral.mjs
package.json
supabase/itinera_v0_22_1_macrointegral_fix.sql
README.txt
INSTRUCCIONES_V0221_FIX_IMPORTADOR_UNIVERSIDAD.md
```

## Pasos

1. Copia los archivos modificados.
2. Haz commit y push.
3. Ejecuta en Supabase:

```text
supabase/itinera_v0_22_1_macrointegral_fix.sql
```

4. Ejecuta otra vez en GitHub:

```text
Actions → ITINERA v0.22 macrointegral refresh → Run workflow
```

5. Comprueba conteos:

```sql
select
  (select count(*) from public.itinera_university_offers) as university_offers,
  (select count(*) from public.itinera_fp_galicia_offer) as fp_galicia_offer,
  (select count(*) from public.itinera_fp_specializations) as fp_specializations,
  (select count(*) from public.itinera_integral_status) as integral_status;
```

6. Revisa:

```sql
select id, block, status, count_value, source_id, notes, checked_at
from public.itinera_integral_status
order by block;
```

## Resultado esperado

Lo razonable es que `university_offers` pase de 0 a una cifra positiva si UNIVBASE permite la descarga desde GitHub Actions.

Si sigue en 0, el estado debe mostrar el error real de las URLs probadas, no solo `fetch failed`.
