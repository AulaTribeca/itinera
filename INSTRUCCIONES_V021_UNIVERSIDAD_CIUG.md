# ITINERA v0.21 · Universidad, RUCT/QEDU, másteres habilitantes y CIUG

## Qué añade

1. Nuevo SQL:
   - `supabase/itinera_v0_21_universidad_ciug.sql`

2. Fuentes oficiales universitarias:
   - RUCT
   - QEDU
   - RD 822/2021
   - CIUG admisión
   - CIUG ponderaciones 2026/2027
   - DOG ponderaciones 2026/2027
   - normativa inicial de másteres habilitantes/profesiones reguladas

3. Documentos oficiales resumidos para ItineraBot:
   - verificación de oficialidad en RUCT
   - uso de QEDU
   - créditos/reconocimiento según RD 822/2021
   - admisión CIUG
   - ponderaciones CIUG 2026/2027

4. Interfaz:
   - panel universitario en la sección Universidad
   - guía de uso de RUCT/QEDU/CIUG
   - tarjetas de másteres habilitantes y profesiones reguladas

## Pasos

### 1. Copiar archivos y subir a GitHub

Copia los archivos modificados, haz commit y push.

### 2. Ejecutar SQL en Supabase

En Supabase SQL Editor ejecuta:

```text
supabase/itinera_v0_21_universidad_ciug.sql
```

### 3. Comprobar conteos

El SQL devuelve:

- studies
- official_documents
- source_coverage
- universidad_grados_status
- ciug_status

### 4. Probar la web

Abre ITINERA, Ctrl + F5, y revisa:

- sección Universidad
- sección Ponderaciones
- FAQ
- ItineraBot con preguntas como:
  - ¿cómo sé si un grado es oficial?
  - ¿QEDU y RUCT son lo mismo?
  - ¿qué es un máster habilitante?
  - ¿dónde miro ponderaciones para Psicología en Galicia?

## Prudencia

Esta versión no carga todavía todos los grados universitarios del RUCT/QEDU como registros individuales. Deja en progreso la capa universitaria, añade fuentes oficiales y mejora la explicación. La extracción estructurada completa de grados y másteres será la siguiente fase.
