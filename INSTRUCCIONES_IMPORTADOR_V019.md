# ITINERA v0.19 · importador oficial con avisos no fatales

## Qué arregla

El workflow estaba importando datos útiles de TodoFP:

- 68 ciclos de grado medio
- 95 ciclos de grado superior

pero terminaba en rojo porque algunas fuentes oficiales no respondían desde GitHub Actions (`fetch failed`) o devolvían HTTP 404. Eso no debe bloquear la carga completa, porque son incidencias parciales de fuentes externas.

## Cambio aplicado

El importador ahora distingue entre:

- errores fatales: no se procesa ninguna fuente oficial;
- avisos no fatales: algunas fuentes fallan, pero otras cargan datos útiles.

El workflow debe salir en verde si al menos una fuente oficial se ha procesado correctamente.

## Qué hacer

1. Copia los archivos modificados.
2. Commit y push.
3. Ejecuta de nuevo GitHub Actions → ITINERA official catalog refresh → Run workflow.
4. Si sale en verde, ve a Supabase y ejecuta:

```sql
select
  (select count(*) from public.itinera_studies) as studies,
  (select count(*) from public.itinera_study_aliases) as aliases,
  (select count(*) from public.itinera_sources) as sources,
  (select count(*) from public.itinera_official_documents) as official_documents,
  (select count(*) from public.itinera_source_coverage) as source_coverage,
  (select count(*) from public.itinera_official_import_queue) as import_queue,
  (select count(*) from public.itinera_bot_logs) as bot_logs;
```

## Interpretación esperada

Después de esta corrección, el workflow puede aparecer en verde aunque QEDU, CIUG o InfoArtísticas fallen temporalmente desde GitHub Actions. Eso es correcto: se registran como avisos y se siguen procesando las fuentes que sí responden.

La cobertura completa se hará por bloques. FP ya debería ampliarse mucho más que la base inicial.
