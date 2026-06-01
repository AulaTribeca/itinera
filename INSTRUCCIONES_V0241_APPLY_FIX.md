# ITINERA v0.24.1 · corrección de aplicación visual

## Qué corrige

v0.24 contenía los cambios de diseño, pero podían no verse porque `app.js` ya tenía registrado `DOMContentLoaded` antes de las extensiones finales. Eso hacía que los wrappers posteriores de `init` no se ejecutasen al cargar la página.

v0.24.1 añade una ejecución autónoma de la capa visual v0.24:

```text
window.ITINERA_V24_APPLY
```

y la lanza aunque el listener original ya estuviese registrado.

## Archivos modificados

```text
index.html
app.js
package.json
README.txt
INSTRUCCIONES_V0241_APPLY_FIX.md
```

## Pasos

1. Copia los archivos modificados.
2. Haz commit y push.
3. Espera a que GitHub Pages termine de desplegar.
4. Abre la web con Ctrl + F5.
5. Si aún no cambia, abre en navegador incógnito o añade `?v=0241` al final de la URL.

## Qué deberías ver

- Navegación simplificada.
- Inicio más limpio.
- Fuentes oficiales rediseñadas.
- Buscador de fuentes.
- Filtros de fuentes por Verificación básica, Universidad, CIUG, FP, Becas y normativa.
- Estado actual del catálogo como sección pequeña dentro de Fuentes.
