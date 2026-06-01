# ITINERA v0.25.2 · simulador reparado

## Qué corrige

v0.25.1 dejaba el simulador vacío porque la capa final llamaba a funciones internas de v0.25 que no estaban disponibles fuera de su bloque de código. Esta versión hace el simulador autosuficiente.

## Cambios

- El paso 1 vuelve a mostrar las opciones de punto de partida.
- Los pasos 1, 2 y 3 son navegables.
- El paso 2 muestra ejemplos claramente etiquetados.
- El recorrido se dibuja como camino literal con movimiento.
- El PDF permite escoger una, varias o todas las rutas.
- Se eliminan los botones rápidos del buscador.
- Se mantiene el gallego como idioma por defecto.
- No requiere SQL.

## Instalación

Copia los archivos, commit, push y abre con Ctrl + F5. Si trabajas en local, confirma que `index.html` carga `app.js?v=0.25.2`.
