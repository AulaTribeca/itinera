# ITINERA v0.16 · GitHub Pages + Supabase directo

## Objetivo

Esta versión adapta ITINERA para funcionar publicada en GitHub Pages y leer datos desde Supabase con la clave pública `anon`.

## Archivos importantes

- `app-config.js`
- `app.js`
- `index.html`
- `supabase/itinera_v0_16_seed_data.sql`

## Paso 1. Cargar datos iniciales en Supabase

En Supabase, abre SQL Editor y ejecuta:

```text
supabase/itinera_v0_16_seed_data.sql
```

Al final debe devolver conteos de:

- studies
- aliases
- sources
- faq

## Paso 2. Configurar app-config.js

Abre `app-config.js` y rellena:

```js
window.ITINERA_CONFIG = {
  SUPABASE_URL: "https://TU-PROYECTO.supabase.co",
  SUPABASE_ANON_KEY: "TU_ANON_KEY_PUBLICA"
};
```

Nunca pongas aquí:

```text
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
```

## Paso 3. Subir a GitHub

Copia los archivos modificados en el repositorio, haz commit y push.

GitHub Pages publicará la web estática y `app.js` leerá Supabase directamente.

## Paso 4. Comprobar

Abre la web pública y prueba:

- criminología
- biología
- electricidad
- soldadura
- psicología

Si Supabase está conectado, el indicador superior debería mostrar algo parecido a:

```text
Supabase: X estudos
```

## Limitación

La base cargada con `itinera_v0_16_seed_data.sql` sigue siendo la base inicial. Para cubrir todos los estudios oficiales habrá que ir importando más datos en Supabase, pero GitHub Pages ya quedará preparado para leerlos automáticamente.
