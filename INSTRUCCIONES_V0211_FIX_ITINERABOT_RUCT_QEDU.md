# ITINERA v0.21.1 · corrección ItineraBot RUCT/QEDU/CIUG

## Problema corregido

La pregunta “QEDU y RUCT son lo mismo” estaba entrando en la búsqueda general de estudios y podía devolver una ficha de FP no relacionada.

## Solución

`app.js` incorpora una capa prioritaria de intención universitaria. Antes de buscar estudios, ItineraBot detecta:

- QEDU
- RUCT
- oficialidad de títulos
- títulos propios
- másteres habilitantes
- profesiones reguladas
- créditos ECTS
- CIUG, ponderaciones, notas de corte y admisión

## Pasos

1. Copiar `index.html`, `app.js` y `README.txt`.
2. Commit y push en GitHub.
3. Abrir la web y hacer Ctrl + F5.
4. Probar estas preguntas:

```text
QEDU y RUCT son lo mismo
¿Cómo sé si un grado es oficial?
¿Qué es un máster habilitante?
¿Qué son los créditos ECTS?
¿Dónde veo notas de corte y plazas?
```

## SQL

No requiere SQL.
