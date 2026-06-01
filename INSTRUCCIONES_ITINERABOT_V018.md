# ITINERA v0.18 · ItineraBot corregido y despliegue Edge Function

## Qué corrige esta versión

1. Corrige el endpoint de ItineraBot:
   - Antes podía apuntar a `https://...functions.supabase.co/itinerabot`.
   - Ahora apunta a `https://bvdnirkqrzrlwwxraeig.supabase.co/functions/v1/itinerabot`.

2. El frontend ya no cae en una respuesta técnica tipo “se puede implementar ItineraBot”.
   Si la Edge Function no está desplegada o no tiene OpenAI activo, responde con una orientación prudente basada en Supabase/local.

3. Se filtran fuentes técnicas como OpenAI Responses API o Vector Stores para que no aparezcan al alumnado.

4. Se añade un workflow:
   `.github/workflows/deploy-itinerabot.yml`

## Paso A · Subir estos archivos

Copia los archivos modificados, haz commit y push.

## Paso B · Probar ItineraBot sin Edge Function

Aunque aún no despliegues la función Edge, el bot debería responder mejor con fallback local/Supabase. Prueba:

- quiero estudiar medicina
- quiero estudiar psicología pero se me dan mal las matemáticas
- qué becas hay
- hay plazas por discapacidad

## Paso C · Desplegar ItineraBot real con IA documental

Para activar ItineraBot completo necesitas GitHub Secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `ITINERA_OPENAI_MODEL`

Valores:
- `SUPABASE_PROJECT_REF`: `bvdnirkqrzrlwwxraeig`
- `SUPABASE_URL`: `https://bvdnirkqrzrlwwxraeig.supabase.co`
- `ITINERA_OPENAI_MODEL`: `gpt-4.1-mini`

Después, en GitHub:
Actions → Deploy ItineraBot Edge Function → Run workflow.

## Nota importante

GitHub Pages no puede ejecutar IA directamente. ItineraBot completo solo puede funcionar mediante backend seguro, en este caso Supabase Edge Function.
