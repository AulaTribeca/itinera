# ITINERA v0.37 · experiencia guiada y no abrumadora

## Objetivo

Esta versión reorganiza la página de inicio para que ITINERA funcione como una experiencia de orientación, no como una enciclopedia visible de golpe.

La lógica pasa a ser:

```text
1. Sitúate
2. Comprende solo lo necesario
3. Consulta lo concreto
4. Simula una ruta
```

## Cambios principales

### Portada

- Se sustituye el recuadro verde anterior por una ruta visual de orientación.
- Se evita lanzar toda la información al usuario al entrar.
- El mensaje inicial deja claro que no hace falta conocer estudios ni conceptos de antemano.

### Nueva experiencia guiada

Se añade una sección central con:

```text
En que momento estás?
```

El alumnado puede escoger entre perfiles como:

```text
Non sei que quero estudar
Estou en ESO
Estou en Bacharelato
Quero facer FP
Estou en FP e quero continuar
Quero ir á universidade
Xa estou na universidade
Son persoa adulta
Necesito becas ou axudas
Teño NEAE ou circunstancias específicas
```

Cada perfil muestra solo:

```text
Que significa estar aquí?
Que opcións tes?
Que debes comprobar?
Seguinte paso lóxico
```

Todo aparece en desplegables, para no saturar.

### Acciones guiadas

Cada perfil ofrece accesos directos a:

```text
LUMEN-V
Simulador
ItineraBot
Buscador de estudios
Becas
Glosario / conceptos básicos
```

### Consulta concreta

Se añade una tarjeta lateral con conceptos básicos:

```text
Grao
Máster
Doutoramento
FP grao medio
FP grao superior
Ciclo modular
Ponderación
Nota de corte
```

Al pulsar, lleva a ItineraBot con una pregunta ya preparada.

## Supabase

No requiere SQL nuevo.  
Mantiene la base de datos y los SQL de v0.36/v0.36.2.

## Archivos modificados

```text
index.html
app.js
styles.css
package.json
README.txt
INSTRUCCIONES_V037_EXPERIENCIA_GUIADA.md
```

## Instalación

1. Sustituye los archivos modificados.
2. Haz commit y push.
3. Abre con Ctrl + F5.
