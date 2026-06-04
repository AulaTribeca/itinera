# ITINERA v0.38 · galego integral, filtros dependentes e catálogo universitario ampliado

## Cambios aplicados

- A portada deixa de mostrar o logo grande.
- Os dous botóns principais da portada pasan a ter só bordo, sen fondo, con esquinas cadradas suavizadas.
- A portada non emprega textos do tipo “abrir”; as accións actívanse directamente ao facer clic.
- A información textual visible normalízase a galego, incluíndo moitos textos procedentes de bases antigas que estaban en castelán.
- Os filtros do buscador pasan a ser dependentes:
  - se escolles `Grao universitario`, só quedan familias ou ramas con graos;
  - se escolles unha familia, só quedan niveis dispoñibles para esa familia;
  - ao escribir unha busca, os filtros tamén se axustan ás coincidencias reais.
- O buscador carga tamén estudos desde Supabase cando está dispoñible.
- Engádese carga dinámica desde:
  - `itinera_studies`;
  - `itinera_university_catalog_clean`.

## Sobre o catálogo universitario completo

Para que aparezan todos os graos, másteres e doutoramentos das tres universidades galegas, Supabase debe conter esas filas oficiais. Esta versión xa intenta cargalas dinamicamente desde Supabase, pero non pode inventar títulos que non estean nin nos JSON locais nin nas táboas de Supabase.

Debes revisar o diagnóstico:

```text
supabase/itinera_v0_38_diagnostico_catalogo_universitario.sql
```

Se o diagnóstico mostra que faltan graos, másteres ou doutoramentos dunha universidade, hai que completar a importación oficial en Supabase.

## Arquivos modificados

```text
index.html
app.js
styles.css
package.json
README.txt
INSTRUCCIONES_V038_GALEGO_FILTROS_UNIVERSIDADE.md
supabase/itinera_v0_38_diagnostico_catalogo_universitario.sql
```

## Instalación

1. Substitúe os arquivos modificados.
2. Fai commit e push.
3. Abre a web con Ctrl + F5.
4. Executa o SQL de diagnóstico en Supabase para confirmar a cobertura universitaria real.
