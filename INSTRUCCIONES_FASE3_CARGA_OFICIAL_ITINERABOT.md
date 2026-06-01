# ITINERA v0.17 · Fase 3: carga oficial completa progresiva e ItineraBot

## Qué incluye esta fase

1. Mejora visual de la brújula de la portada.
2. SQL para registrar cobertura oficial, cola de importación y logs de ItineraBot.
3. Cargador oficial por Node/GitHub Actions.
4. Supabase Edge Function para ItineraBot documental.
5. Conexión del frontend de GitHub Pages con la Edge Function.

## 1. Ejecutar SQL de fase 3

En Supabase SQL Editor, ejecuta:

```text
supabase/itinera_v0_17_phase3_official_load.sql
```

Al terminar debe devolver conteos de fuentes, bloques de cobertura y elementos en cola.

## 2. Configurar GitHub Secrets para la carga oficial

En GitHub, dentro del repositorio de ITINERA:

```text
Settings → Secrets and variables → Actions → New repository secret
```

Añade:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

La `SUPABASE_SERVICE_ROLE_KEY` solo se usa en GitHub Actions o backend. Nunca debe ir en `app-config.js`.

## 3. Lanzar la carga oficial

En GitHub:

```text
Actions → ITINERA official catalog refresh → Run workflow
```

También queda programado los lunes a las 05:00 UTC.

El flujo ejecuta:

```bash
node tools/official-load/import-official-catalogs.mjs
```

## 4. Qué importa esta versión

- Base inicial revisada de ITINERA.
- Documentos oficiales de la cola `itinera_official_import_queue`.
- Títulos de FP desde TodoFP cuando el HTML oficial permite extraerlos.
- Alias de búsqueda para mejorar errores ortográficos y términos aproximados.

## 5. Qué requiere revisión progresiva

La carga completa no debe declararse verificada automáticamente. Hay fuentes que cambian de estructura o no ofrecen API pública clara.

Debe revisarse especialmente:

- QEDU/RUCT para títulos universitarios.
- CIUG para ponderaciones, notas de corte y cupos.
- Xunta FP para oferta por centro, localidad, régimen y curso.
- Becas y NEAE por convocatoria.
- Enseñanzas artísticas y deportivas.

## 6. ItineraBot documental

La función está en:

```text
supabase/functions/itinerabot/index.ts
```

### Secrets necesarios en Supabase

En Supabase:

```text
Project Settings → Edge Functions → Secrets
```

Añade:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
ITINERA_OPENAI_MODEL
```

`ITINERA_OPENAI_MODEL` puede ser:

```text
gpt-4.1-mini
```

### Desplegar función

Desde terminal con Supabase CLI:

```bash
supabase functions deploy itinerabot --project-ref bvdnirkqrzrlwwxraeig
```

Después, la app llamará a:

```text
https://bvdnirkqrzrlwwxraeig.functions.supabase.co/itinerabot
```

## 7. Verificación

En la app:

- Busca estudios: `criminología`, `electricidad`, `biología`, `soldadura`.
- Abre ItineraBot y pregunta:
  - `Quiero estudiar Psicología pero se me dan mal las matemáticas`
  - `¿Puedo ir de ESO a un ciclo superior?`
  - `¿Qué prueba necesito para grado superior?`
  - `¿Dónde veo si un grado es oficial?`

ItineraBot debe citar fuentes oficiales o reconocer que no tiene dato suficiente.

## 8. Frase pública todavía prudente

Hasta revisar cobertura, la frase correcta es:

```text
ITINERA está conectada a una base oficial en ampliación, con fuentes verificables y actualización progresiva.
```

No usar aún:

```text
Contiene todos los estudios oficiales existentes y se actualiza automáticamente.
```
