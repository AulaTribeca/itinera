# ITINERA v0.36 · estructura por etapa vital y académica + tercera base documental

## Objetivo de esta versión

ITINERA deja de crecer como una acumulación de bloques y pasa a organizarse como una guía progresiva:

```text
Estoy aquí → quiero llegar aquí → estas son mis rutas → estos son los requisitos → estas son las becas → estas son las fuentes oficiales.
```

## Cambios de interfaz

### Nueva entrada principal

Se añade una sección central:

```text
En que momento estás?
```

Con tarjetas desplegables para:

```text
1. Estoy en ESO
2. Estoy en Bacharelato
3. Quiero hacer FP
4. Estoy en FP y quiero continuar
5. Quiero ir a la universidad
6. Ya estoy en la universidad
7. Soy una persona adulta y quiero volver a estudiar
8. Necesito orientación vocacional
9. Necesito becas o ayudas
10. Tengo NEAE, discapacidad o circunstancias específicas
```

Cada etapa se organiza siempre igual:

```text
Dónde estás
Opciones
Decisiones clave
Requisitos a comprobar
Siguiente paso
```

### Nuevas secciones

Se añaden:

```text
Perfís de orientación
Mapas de continuidade
Becas e axudas
Glosario académico con buscador
```

La guía académica anterior queda sustituida visualmente por esta estructura más lógica y progresiva.

## Nueva base documental procesada

Archivo procesado:

```text
3 base de datos itinera.zip
```

Se han extraído:

```text
188 ciclos de FP desde catálogos por familias profesionales.
150 másteres.
56 programas de doctorado.
25 documentos fuente.
```

Se añade el archivo trazable:

```text
data/itinera-base3-v036.json
```

## Supabase

Sí, hay que actualizar Supabase.

Si el SQL v0.35 todavía no llegó a ejecutarse correctamente, ejecuta primero:

```text
supabase/itinera_v0_35_1_documentacion_academica_base2_SQL_CORREGIDO.sql
```

Después ejecuta:

```text
supabase/itinera_v0_36_estructura_orientacion_base3.sql
```

El SQL v0.36 crea y rellena:

```text
itinera_life_stages
itinera_glossary
itinera_scholarships
itinera_route_maps
itinera_fp_catalog_details
itinera_postgraduate_catalog
```

Además inserta o actualiza estudios en:

```text
itinera_studies
```

## Comprobaciones posteriores

```sql
select count(*) from public.itinera_life_stages;
```

```sql
select count(*) from public.itinera_glossary;
```

```sql
select count(*) from public.itinera_fp_catalog_details;
```

```sql
select count(*) from public.itinera_postgraduate_catalog;
```

```sql
select count(*)
from public.itinera_studies
where raw->>'source_upload' = '3 base de datos itinera.zip';
```

## Archivos modificados

```text
index.html
app.js
styles.css
package.json
README.txt
INSTRUCCIONES_V036_ESTRUCTURA_ORIENTACION_BASE3.md
data/itinera-base3-v036.json
supabase/itinera_v0_36_estructura_orientacion_base3.sql
supabase/itinera_v0_35_1_documentacion_academica_base2_SQL_CORREGIDO.sql
```

## Instalación

1. Sustituye los archivos modificados.
2. Haz commit y push.
3. Ejecuta el SQL necesario en Supabase.
4. Abre la web con Ctrl + F5.
