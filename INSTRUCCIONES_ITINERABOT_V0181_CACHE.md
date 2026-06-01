# ITINERA v0.18.1 · corrección de caché e ItineraBot

Si después de subir v0.18 seguías viendo la misma respuesta técnica, casi seguro que GitHub Pages o el navegador estaban cargando una versión antigua de `app.js`, o que seguía activo un fallback previo.

Esta versión fuerza:

- `app-config.js?v=0.18.1`
- `app.js?v=0.18.1`

y añade un override final para que ItineraBot no pueda mostrar mensajes técnicos internos.

Después de subir:
1. Haz commit y push.
2. Espera 1-3 minutos.
3. Abre la web.
4. Pulsa Ctrl + F5.
5. Prueba: `quiero estudiar medicina`.

Si sigue igual, abre DevTools → Network y comprueba que se carga `app.js?v=0.18.1`.
