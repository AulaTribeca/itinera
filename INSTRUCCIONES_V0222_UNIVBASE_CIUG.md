# ITINERA v0.22.2 · UNIVBASE y CIUG

## Motivo

v0.22.1 confirmó que el workflow funciona, pero la descarga universitaria seguía fallando porque las URLs exportables reales de UNIVBASE no son las rutas antiguas `/csv_c/...px`, sino rutas de exportación como:

```text
/csv_bd/...csv_bd
/csv_bdsc/...csv_bdsc
/xlsx/...xlsx
/px/...px
```

Además, CIUG seguía solo enlazada. Esta versión añade un primer extractor textual desde PDF para notas de corte y ponderaciones, marcando siempre los datos como `pdf_text_imported_needs_review`.

## Archivos modificados

```text
tools/official-load/import-v022-macrointegral.mjs
package.json
supabase/itinera_v0_22_2_univbase_ciug_fix.sql
README.txt
INSTRUCCIONES_V0222_UNIVBASE_CIUG.md
```

## Pasos

1. Copia los archivos modificados.
2. Haz commit y push.
3. Ejecuta en Supabase:

```text
supabase/itinera_v0_22_2_univbase_ciug_fix.sql
```

4. Ejecuta otra vez:

```text
Actions → ITINERA v0.22 macrointegral refresh → Run workflow
```

5. Comprueba:

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

## Criterio de rigor

- Universidad importada desde UNIVBASE/EDUCAbase queda como `imported_aggregate`: es dato oficial agregado, pero no sustituye QEDU/RUCT título a título.
- CIUG importada desde PDF queda como `pdf_text_imported_needs_review`: debe revisarse visualmente antes de usar notas o ponderaciones como datos definitivos.
- Si una fuente vuelve a fallar, el estado mostrará la URL exacta que falló.
