# ITINERA v0.17.1 · Corrección del workflow de carga oficial

El error mostrado por GitHub Actions era:

```text
Error: Node.js 20 detected without native WebSocket support.
Suggested solution: install `ws` package and provide it via the transport option.
```

La corrección aplica tres cambios:

1. `package.json` añade la dependencia `ws`.
2. `tools/official-load/import-official-catalogs.mjs` importa `WebSocket` desde `ws` y lo pasa a Supabase:

```js
realtime: { transport: WebSocket }
```

3. `.github/workflows/itinera-official-refresh.yml` usa Node 22.

## Qué hacer

1. Copia los archivos modificados al repositorio.
2. Haz commit y push.
3. Vuelve a GitHub Actions.
4. Entra en `ITINERA official catalog refresh`.
5. Pulsa `Run workflow`.

No hace falta ejecutar SQL nuevo en Supabase para este arreglo.
