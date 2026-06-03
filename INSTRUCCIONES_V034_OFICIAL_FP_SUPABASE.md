# ITINERA v0.34 · base oficial FP Galicia 2025-2026 + Supabase

## Cambios

- Añade la palabra **ITINERA** en la portada, al lado del logo, antes del recuadro verde con los pasos.
- Integra la documentación comprimida aportada como base de datos oficial de FP Galicia 2025-2026.
- Se han extraído 202 estudios oficiales de los PDFs de oferta por familia:
  - oferta ordinaria;
  - FP básica;
  - FP dual intensiva;
  - oferta modular;
  - distancia/semipresencial;
  - cursos de especialización;
  - programas formativos básicos.
- El selector del simulador incorpora esos estudios organizados por familia y por orden alfabético.
- Se incluye `data/itinera-fp-galicia-oficial-2025-2026.json` para trazabilidad.
- Se incluye SQL para actualizar Supabase.

## Archivos modificados

```text
index.html
app.js
styles.css
package.json
README.txt
INSTRUCCIONES_V034_OFICIAL_FP_SUPABASE.md
data/itinera-fp-galicia-oficial-2025-2026.json
supabase/itinera_v0_34_fp_galicia_oficial_2025_2026.sql
```

## Supabase

Sí, conviene actualizar Supabase.

La web funcionará con los datos integrados en `app.js`, pero para que la base de datos real de ITINERA quede coherente, persistente y aprovechable por ItineraBot/consultas futuras, ejecuta en Supabase SQL Editor:

```text
supabase/itinera_v0_34_fp_galicia_oficial_2025_2026.sql
```

Después puedes comprobar:

```sql
select count(*) from public.itinera_studies where raw->>'source_upload' = 'base de datos de itinera.zip';

select id, name, level, family
from public.itinera_studies
where name ilike '%Electromecánica de vehículos%';
```

## Instalación web

1. Copia los archivos modificados.
2. Haz commit y push.
3. Ejecuta el SQL en Supabase si quieres actualizar la base persistente.
4. Abre la web con Ctrl + F5.

No requiere cambios de claves ni variables de entorno.
