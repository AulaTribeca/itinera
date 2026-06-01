# ITINERA v0.22 · macrointegral

## Objetivo

Esta versión intenta abordar en una sola macrofase los bloques pendientes principales:

- universidad estructurada: RUCT, QEDU y SIIU/EDUCAbase;
- másteres habilitantes y profesiones reguladas;
- CIUG: notas de corte, ponderaciones, admisión, cupos y matrícula;
- FP Galicia: oferta por centros, localidades, régimen, modalidad y curso;
- FP cursos de especialización, Grados E;
- ItineraBot con respuestas más prudentes y mejor enrutadas;
- panel de estado macrointegral.

## Archivos modificados

```text
index.html
app.js
styles.css
package.json
README.txt
supabase/itinera_v0_22_macrointegral_schema.sql
tools/official-load/import-v022-macrointegral.mjs
.github/workflows/itinera-v022-macrointegral-refresh.yml
INSTRUCCIONES_V022_MACROINTEGRAL.md
```

## Paso 1 · Copiar archivos

Copia los archivos modificados en el repositorio de ITINERA.

## Paso 2 · Commit y push

Haz commit y push a GitHub.

## Paso 3 · Ejecutar SQL en Supabase

En Supabase SQL Editor, ejecuta:

```text
supabase/itinera_v0_22_macrointegral_schema.sql
```

Este paso es obligatorio. Crea tablas nuevas y políticas de lectura pública.

## Paso 4 · Ejecutar workflow

En GitHub:

```text
Actions → ITINERA v0.22 macrointegral refresh → Run workflow
```

El workflow ejecuta:

```text
node tools/official-load/import-official-catalogs.mjs
node tools/official-load/import-v022-macrointegral.mjs
```

## Paso 5 · Comprobar conteos

Después del workflow, ejecuta en Supabase:

```sql
select
  (select count(*) from public.itinera_studies) as studies,
  (select count(*) from public.itinera_university_offers) as university_offers,
  (select count(*) from public.itinera_ciug_cutoffs) as ciug_cutoffs,
  (select count(*) from public.itinera_ciug_ponderations) as ciug_ponderations,
  (select count(*) from public.itinera_fp_galicia_offer) as fp_galicia_offer,
  (select count(*) from public.itinera_fp_specializations) as fp_specializations,
  (select count(*) from public.itinera_integral_status) as integral_status,
  (select count(*) from public.itinera_official_documents) as official_documents,
  (select count(*) from public.itinera_source_coverage) as source_coverage;
```

También revisa:

```sql
select id, block, status, count_value, source_id, notes, checked_at
from public.itinera_integral_status
order by block;
```

## Paso 6 · Probar la web

Abre la web pública y pulsa Ctrl + F5.

Revisa:

- Inicio: panel "Estado macrointegral";
- Universidad: panel RUCT/QEDU/SIIU;
- Ponderaciones: panel CIUG;
- FP: panel FP Galicia y Grados E;
- ItineraBot.

Preguntas de prueba:

```text
QEDU contiene todos los títulos oficiales?
QEDU incluye títulos propios?
Qué son los cursos de especialización de FP?
Hay oferta de FP Galicia por centro?
Dónde miro notas de corte y ponderaciones en Galicia?
Cómo verifico si un máster es habilitante?
```

## Limitación deliberada

Esta versión no inventa datos. Si QEDU, CIUG o Xunta ofrecen una parte en PDF o buscador no estructurado, ITINERA enlaza la fuente oficial y deja el bloque como `in_progress_structured` o `pending_review`. Eso es preferible a cargar datos aproximados.
