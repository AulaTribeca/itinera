# ITINERA v0.22.4 · legacy TLS cache fix

## Diagnóstico

El log del workflow muestra que la descarga no falla por el código de ITINERA, sino por la negociación TLS de los portales oficiales:

```text
OpenSSL/3.0.13: error:0A000152:SSL routines::unsafe legacy renegotiation disabled
SSL certificate problem: unable to get local issuer certificate
```

Por eso v0.22.4 modifica el workflow, no la interfaz.

## Qué cambia

- Añade un archivo OpenSSL temporal con `UnsafeLegacyRenegotiation`.
- Baja el nivel de seguridad de cifrado para esas descargas oficiales con `CipherString = DEFAULT:@SECLEVEL=0`.
- Usa `curl -k`, `--tlsv1.2` y `--ciphers "DEFAULT:@SECLEVEL=0"`.
- Mantiene cache local en `tools/official-load/cache`.
- Define `NODE_TLS_REJECT_UNAUTHORIZED=0` para que Node pueda leer si necesita fallback.
- El importador sigue leyendo primero desde cache.

## Archivos modificados

```text
.github/workflows/itinera-v022-macrointegral-refresh.yml
tools/official-load/import-v022-macrointegral.mjs
package.json
supabase/itinera_v0_22_4_legacy_tls_cache_fix.sql
README.txt
INSTRUCCIONES_V0224_LEGACY_TLS_CACHE.md
```

## Pasos

1. Copia los archivos modificados.
2. Haz commit y push.
3. Ejecuta en Supabase:

```text
supabase/itinera_v0_22_4_legacy_tls_cache_fix.sql
```

4. Ejecuta:

```text
Actions → ITINERA v0.22 macrointegral refresh → Run workflow
```

5. En el log, revisa el paso:

```text
Download difficult official files with legacy TLS curl cache
```

Debe mostrar archivos en `tools/official-load/cache` con tamaño real, no 0 bytes.

## Comprobación SQL posterior

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

## Si vuelve a fallar

Si incluso con v0.22.4 los archivos siguen en 0 bytes, el bloqueo ya no es de ITINERA ni de Supabase: será una incompatibilidad/limitación del servidor oficial con el entorno GitHub Actions. La alternativa correcta será una v0.22.5 de carga manual controlada: descargar los ficheros oficiales desde el navegador y subirlos al repositorio como cache revisada.
