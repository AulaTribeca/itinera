# ITINERA v0.23 · versión definitiva operativa

## Qué contiene

Esta versión cierra la fase de construcción general de ITINERA y convierte la herramienta en una versión operativa, organizada y presentable.

No marca como definitivos los datos que dependen de convocatoria. Los muestra con estado de revisión y enlace oficial. Esto es deliberado: una herramienta rigurosa no puede inventar plazas, notas, ponderaciones ni oferta por centro.

## Mejoras principales

### Organización y experiencia de uso

- Navegación principal simplificada.
- Inicio reorganizado con acciones claras: buscar, simular, preguntar a ItineraBot, FP, Universidad y CIUG.
- Panel de fiabilidad de datos visible y comprensible.
- Eliminación visual de paneles redundantes de v0.22.
- Reducción de textos largos y avisos más breves.
- Buscadores específicos en Universidad, CIUG y FP.
- Presentación más limpia, con tarjetas sobrias, estados de revisión y fuentes oficiales.

### Calidad de datos

- Creación de `itinera_university_catalog_clean`.
- Limpieza de la capa universitaria: los 110.160 registros brutos de UNIVBASE se convierten en un catálogo agregado depurado.
- Sustitución de `itinera_university_offers` por la versión depurada para que la interfaz no trabaje con una tabla sobredimensionada.
- Creación de `itinera_quality_checks`.
- CIUG se muestra como datos importados o índice de consulta, nunca como coeficientes inventados.
- FP Galicia se muestra con aviso claro si la oferta por centro sigue siendo una capa mínima.

### ItineraBot

- Respuestas reforzadas sobre fiabilidad, actualización, ponderaciones y fuentes oficiales.
- ItineraBot ya distingue entre orientación y verificación administrativa.

## Archivos modificados

```text
index.html
app.js
styles.css
package.json
README.txt
.github/workflows/itinera-v022-macrointegral-refresh.yml
tools/official-load/import-v022-macrointegral.mjs
supabase/itinera_v0_23_definitiva.sql
INSTRUCCIONES_V023_DEFINITIVA.md
```

## Pasos de instalación

### 1. Copiar archivos

Copia los archivos modificados al repositorio de ITINERA.

### 2. Commit y push

```bash
git add .
git commit -m "Release ITINERA v0.23 definitive operational version"
git push
```

### 3. Ejecutar SQL en Supabase

En Supabase SQL Editor ejecuta:

```text
supabase/itinera_v0_23_definitiva.sql
```

Este paso es obligatorio. Crea las tablas limpias, depura la capa universitaria y añade controles de calidad.

### 4. Ejecutar workflow

En GitHub Actions ejecuta:

```text
ITINERA v0.23 definitive refresh
```

Si GitHub aún muestra el nombre antiguo durante unos minutos, entra en el workflow que antes se llamaba:

```text
ITINERA v0.22 macrointegral refresh
```

y ejecútalo igualmente. El archivo es el mismo, pero el nombre se actualizará tras el push.

### 5. Comprobar Supabase

Ejecuta:

```sql
select
  (select count(*) from public.itinera_university_catalog_clean) as university_catalog_clean,
  (select count(*) from public.itinera_university_offers) as university_offers_ui,
  (select count(*) from public.itinera_ciug_cutoffs) as ciug_cutoffs,
  (select count(*) from public.itinera_ciug_ponderations) as ciug_ponderations,
  (select count(*) from public.itinera_fp_galicia_offer) as fp_galicia_offer,
  (select count(*) from public.itinera_fp_specializations) as fp_specializations,
  (select count(*) from public.itinera_quality_checks) as quality_checks;
```

Y:

```sql
select id, block, status, severity, value, notes, checked_at
from public.itinera_quality_checks
order by block;
```

### 6. Probar la web

Abre la web pública y pulsa Ctrl + F5.

Comprueba:

- Inicio: panel de acciones claras y fiabilidad.
- Universidad: catálogo depurado, no lista masiva bruta.
- CIUG: notas y ponderaciones/índices con aviso de revisión.
- FP: cursos de especialización y oferta Galicia con aviso de verificación.
- ItineraBot: preguntas sobre actualización, fiabilidad, RUCT, QEDU, CIUG y FP.

## Criterio de versión definitiva

Esta versión puede considerarse definitiva en sentido operativo: estructura, interfaz, fuentes, bot, limpieza y controles de calidad están integrados. No significa que los datos dinámicos queden cerrados para siempre. Notas, plazas, ponderaciones y oferta por centro deben actualizarse por curso y convocatoria.
