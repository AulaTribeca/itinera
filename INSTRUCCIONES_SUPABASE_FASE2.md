# ITINERA v0.15 · Fase 2: Supabase e ingesta oficial

## Qué cambia en esta fase

Esta versión añade la arquitectura real para que ITINERA deje de depender solo de `data/studies.seed.json` y pueda consultar una base de datos en Supabase.

La app seguirá funcionando aunque Supabase no esté configurado, pero el modo serio de catálogo completo requiere:

1. ejecutar el SQL de v0.15;
2. añadir variables de entorno en Netlify;
3. lanzar la ingesta oficial;
4. revisar los datos importados;
5. ampliar conectores para fuentes que no exponen datos fácilmente.

## Archivos nuevos importantes

- `supabase/itinera_v0_15_phase2_schema.sql`
- `netlify/functions/_lib/supabase.mjs`
- `netlify/functions/import-official-data.mjs`
- `netlify/functions/catalog-status.mjs`
- `netlify/functions/studies-search.mjs`
- `netlify/functions/itinerabot-rag.mjs`

## SQL que debes ejecutar

En Supabase:

1. abre el proyecto de ITINERA;
2. entra en SQL Editor;
3. copia y ejecuta todo el archivo:

```text
supabase/itinera_v0_15_phase2_schema.sql
```

Esto crea tablas específicas para ITINERA:

- `itinera_sources`
- `itinera_ingestion_runs`
- `itinera_studies`
- `itinera_study_aliases`
- `itinera_study_locations`
- `itinera_official_documents`
- `itinera_faq_items`
- `itinera_access_exams`
- `itinera_scholarships`
- `itinera_reservations`
- `itinera_convalidations`

También crea la función:

```text
itinera_search_studies(q, study_type, study_family, max_results)
```

## Variables de entorno en Netlify

En Netlify, dentro de Site configuration > Environment variables, añade:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY
OPENAI_API_KEY
ITINERA_OPENAI_MODEL
```

`OPENAI_API_KEY` es necesaria solo para activar ItineraBot con IA documental.  
`ITINERA_OPENAI_MODEL` es opcional. Si no se añade, se usa `gpt-4.1-mini`.

## Cómo lanzar la ingesta

Tras desplegar, abre esta URL en el navegador:

```text
https://TU-SITIO.netlify.app/.netlify/functions/import-official-data?mode=seed+official
```

También puedes importar solo algunas fuentes:

```text
https://TU-SITIO.netlify.app/.netlify/functions/import-official-data?mode=official&sources=todofp-gm,todofp-gs
```

Fuentes iniciales contempladas:

```text
todofp-gm
todofp-gs
todofp-familias
xunta-ciclos
qedu-index
ruct-index
```

## Cómo comprobar si funcionó

Abre:

```text
https://TU-SITIO.netlify.app/.netlify/functions/catalog-status
```

Deberías ver:

- total de estudios en `itinera_studies`;
- total de fuentes;
- total de documentos oficiales guardados;
- últimas ingestas;
- desglose por tipo y familia.

## Importante sobre “todos los estudios”

Esta fase crea el sistema para cargar todos los estudios, pero no garantiza automáticamente que todas las fuentes oficiales sean técnicamente extraíbles al 100 %. Algunas webs oficiales son dinámicas, cambian estructura, bloquean scraping o no ofrecen API pública clara.

La estrategia rigurosa es:

1. importar automáticamente lo que se pueda extraer con seguridad;
2. marcar `data_quality = imported_needs_review`;
3. revisar datos críticos;
4. añadir conectores específicos por fuente;
5. no afirmar datos no verificados;
6. seguir remitiendo a RUCT, QEDU, TodoFP, Xunta FP y CIUG cuando sea necesario.

## ItineraBot documental

`itinerabot-rag.mjs` ahora intenta recuperar contexto desde Supabase:

- estudios;
- documentos oficiales;
- fuentes oficiales.

Después genera respuesta con la Responses API de OpenAI. La instrucción del sistema impide inventar datos y obliga a reconocer límites cuando no constan en la base.

Si `OPENAI_API_KEY` no está configurada, ItineraBot responde en modo prudente, sin IA abierta.

## Recomendación de uso

No hagas pública la herramienta como “completa” hasta comprobar:

- catálogo de FP importado;
- títulos universitarios relevantes;
- buscador por aliases;
- datos de centros y localidades en Galicia;
- fuentes de ponderaciones CIUG;
- fecha y hora de actualización;
- resultados de `catalog-status`.
