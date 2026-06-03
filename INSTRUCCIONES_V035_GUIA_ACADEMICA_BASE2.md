# ITINERA v0.35 · guía académica integral + segunda base documental

## Cambios visuales

- Se reduce el tamaño de la palabra ITINERA en la portada.
- Se ajusta el bloque de marca para que no interfiera con el recuadro verde de pasos.

## Nueva guía académica

Se añade una guía académica integral en la portada con apartados desplegables:

- Bacharelato: para qué sirve, cómo acceder, qué permite y cómo escoger modalidad.
- Formación Profesional: FP básica, grao medio, grao superior y cursos de especialización.
- Ciclo modular / réxime de persoas adultas: qué es, cómo funciona y para quién tiene sentido.
- Universidade: graos, másteres, másteres habilitantes, doutoramento y tese doutoral.
- Becas: becas generales, requisitos económicos, requisitos académicos, NEAE y recomendaciones prácticas.
- Glosario académico esencial: ABAU, ECTS, RUCT, QEDU, nota de corte, ponderación, módulo, FCT, modalidad, campus, etc.

## Segunda base de datos procesada

Archivo de origen:

```text
2 base datos itinera.zip
```

Se han procesado:

```text
73 itinerarios modulares de FP para régimen de personas adultas
56 grados de la Universidade de Vigo
85 documentos fuente
```

Se añade:

```text
data/itinera-documentacion-v035.json
```

## Supabase

Sí, hay que actualizar Supabase si quieres que esta nueva base documental quede incorporada de forma persistente y pueda usarse en búsquedas, ItineraBot y ampliaciones futuras.

Ejecuta en Supabase SQL Editor:

```text
supabase/itinera_v0_35_documentacion_academica_base2.sql
```

Este SQL:

- crea `itinera_adult_modular_itineraries` si no existe;
- crea `itinera_academic_guide` si no existe;
- inserta la guía académica;
- inserta los itinerarios modulares;
- inserta los grados de la Universidade de Vigo en `itinera_studies`;
- usa la columna correcta `usefulness` en `itinera_sources`.

## Comprobaciones posteriores

```sql
select count(*) from public.itinera_adult_modular_itineraries;
```

```sql
select count(*) from public.itinera_academic_guide;
```

```sql
select count(*)
from public.itinera_studies
where raw->>'source_upload' = '2 base datos itinera.zip';
```

## Archivos modificados

```text
index.html
app.js
styles.css
package.json
README.txt
INSTRUCCIONES_V035_GUIA_ACADEMICA_BASE2.md
data/itinera-documentacion-v035.json
supabase/itinera_v0_35_documentacion_academica_base2.sql
```

## Instalación

1. Sustituye los archivos modificados.
2. Haz commit y push.
3. Ejecuta el SQL en Supabase.
4. Abre la web con Ctrl + F5.

