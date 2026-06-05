ITINERA · Paquete de importación para Google My Maps
Versión: 0.54-preparacion-google-maps
Data de xeración: 2026-06-05

CONTIDO
- 00_ITINERA_mapa_xeral_todos_os_estudos.csv: unha fila por marcador, agrupando estudos por centro/sede e localidade.
- 01-07: capas separadas por tipo de estudo para importalas en Google My Maps con cores diferentes.
- 08_ITINERA_rexistros_individuais_por_estudo.csv: unha fila por estudo individual. Só convén usalo se se quere unha táboa completa; para o mapa é mellor usar as capas agrupadas.

COBERTURA XERADA
- Rexistros totais de estudos: 1855
- Marcadores agrupados para Google My Maps: 654
- FP extraída dos PDF oficiais por provincia e concello: 1366
- Estudos universitarios extraídos do inventario corrixido: 489

COMO IMPORTAR EN GOOGLE MY MAPS
1. Entra en https://mymaps.google.com/ coa conta de Google que usarás para ITINERA.
2. Crea un mapa novo chamado, por exemplo, “ITINERA · Oferta de estudos en Galicia”.
3. Crea unha capa por tipo:
   - FP básica
   - FP grao medio
   - FP grao superior
   - Graos universitarios
   - Másteres
   - Doutoramentos
4. En cada capa, pulsa “Importar” e sube o CSV correspondente.
5. Cando Google pregunte que columna usar para situar os puntos, escolle:
   Enderezo_para_Google
6. Cando pregunte que columna usar como título, escolle:
   Titulo_marcador
7. Aplica cor por capa:
   - FP: verde
   - Grao: azul
   - Máster: laranxa
   - Doutoramento: vermello
8. Revisa os marcadores que Google marque como ambiguos. Se algún centro non se sitúa con precisión, corrixe o punto manualmente en My Maps.
9. Cando o mapa estea revisado, compárteo como público ou accesible mediante ligazón.
10. Copia o iframe de “Inserir no meu sitio web” e envíamo para embeberlo en ITINERA.

NOTA DE RIGOR
Google My Maps permite importar CSV, TSV, KML, KMZ, GPX, XLSX e Google Sheets, e pode situar os puntos a partir de enderezos, nomes de lugar ou latitude/lonxitude. O límite oficial por ficheiro é de 2.000 filas, polo que as capas separadas deste paquete quedan por debaixo dese límite.
