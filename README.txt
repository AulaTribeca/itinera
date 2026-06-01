ITINERA v0.8 fase 1

Cambios principales:
- Rediseño de portada con mejor contraste en el bloque verde.
- Nueva animación de portada con paisaje académico, nodos y camino más cuidado.
- Idiomas disponibles: gallego por defecto, castellano, inglés, francés, polaco y alemán.
- Selector de idioma compacto.
- Selector de tipografía: predeterminada, Comic Sans y modo de lectura compatible con dislexia sin incluir archivos de fuentes externas.
- Simulador reorganizado en tres pasos: punto de partida, meta y ajuste de ruta.
- El simulador avanza automáticamente del paso 1 al 2 y del 2 al 3.
- Desambiguación cuando una palabra puede corresponder a varios estudios.
- Electricidad ya no deriva a soldadura; muestra opciones de Electricidad y Electrónica.
- Tarjetas de ruta clicables y sin solapamientos.
- Visualización de bifurcaciones cuando existen varias rutas.
- El simulador muestra materias, ponderaciones cuando aplican, disponibilidad o fuente oficial donde comprobarla.
- PDFs premium mediante impresión: cabecera con logo de ITINERA y pie con Tribeca Academia, dirección, licencia y fecha.
- Nuevas secciones: becas oficiales, cupos/reservas de plazas y FAQ extensa.
- ItineraBot ampliado para notas de corte, becas, cupos, matemáticas/psicología, FP y estudios concretos.
- Netlify Functions actualizadas con soporte opcional para Supabase.

Archivos nuevos/importantes:
- supabase/itinera_v0_8_schema.sql

Supabase:
- Para activar la base de datos, ejecutar supabase/itinera_v0_8_schema.sql en Supabase SQL Editor.
- Después, en Netlify, añadir variables de entorno:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
- Sin esas variables, la app funciona con data/studies.seed.json y Netlify Blobs.

No se debe usar el navegador para subir carpetas a GitHub. Usar GitHub Desktop, commit y push.


ITINERA v0.9
- Corrección visual del bloque verde de portada para mejorar contraste y legibilidad.
- Sustitución del menú principal de Itinerarios, Bachillerato, Ponderaciones, FP, Universidad, Becas y Cupos por un desplegable único llamado “Enlaces oficiales”.
- Reducción de escala visual general para que la herramienta no se vea tan ampliada.
- Mejora del mapa visual de portada con más movimiento, profundidad y acabado premium.
- Simulador reforzado: más metas visibles, desambiguación antes de avanzar, bifurcaciones por ruta y tarjetas clicables sin solaparse.
- El simulador ya no debería llevar “electricidad” a soldadura: ofrece opciones de Electricidad y Electrónica y familias afines.
- Añadidos más estudios y alias a la base local, especialmente de Electricidad y Electrónica, Energía, Educación, ADE y Biología.
- Se amplía la sección Universidad con información sobre ECTS, títulos oficiales, títulos propios, RUCT, QEDU, CIUG y másteres habilitantes.
- ItineraBot mejora respuestas sobre discapacidad/enfermedad y reservas de plazas, notas de corte, ECTS, becas, títulos oficiales, másteres habilitantes y materias difíciles.
- FAQ ampliada con más preguntas sobre sistema universitario, créditos, títulos oficiales, notas de corte, becas, cupos, FP y acceso.
- Los PDFs mantienen cabecera con logo de ITINERA y pie de Tribeca Academia.

No requiere cambios adicionales de Supabase en esta fase. El esquema de Supabase de v0.8 sigue siendo válido.


ITINERA v0.10
- Corrección del simulador para evitar rutas imposibles, por ejemplo, ESO → ciclo superior como salto directo.
- Las rutas distinguen entre acceso directo, indicado con flecha, y puntos críticos/pruebas de acceso, indicados con nodo parpadeante clicable.
- Añadidas rutas alternativas válidas: ESO → Bachillerato → ciclo superior; ESO → grado medio → ciclo superior; y vía con prueba de acceso a grado superior cuando proceda.
- Añadida información específica sobre pruebas de acceso a ciclos formativos de grado medio y grado superior en Galicia.
- Añadido apartado nuevo “Pruebas de acceso” dentro de “Enlaces oficiales”.
- Añadidas fuentes oficiales de Xunta FP sobre pruebas de acceso, convocatorias, información general y exámenes de años anteriores.
- ItineraBot incorpora una función backend opcional `itinerabot-rag.mjs` preparada para funcionar con OpenAI Responses API.
- La función de IA documental exige `OPENAI_API_KEY`; si no está configurada, la app mantiene el modo local prudente.
- No requiere SQL nuevo. El esquema de Supabase de v0.8 sigue siendo válido.
- Para activar el modo IA documental, añadir en Netlify las variables:
  OPENAI_API_KEY
  ITINERA_OPENAI_MODEL, opcional


ITINERA v0.11
- Rediseño del simulador para que la ruta sea más serena, menos alarmista y visualmente más clara.
- Las conexiones entre pasos ahora son clicables: flecha para acceso directo, conector destacado para prueba/requisito y conector crítico para PAU/ABAU, ponderaciones o admisión.
- Al hacer clic en tarjetas o conectores del simulador se abre una ventana modal con la información, sin desplazar al usuario hacia abajo.
- La portada dinámica se reorienta visualmente hacia el símbolo de ITINERA, en lugar de una escena genérica.
- El desplegable de “Enlaces oficiales” se repliega automáticamente al seleccionar una opción.
- Se añade la sección “Todos los estudios” con buscador, filtro por tipo y filtro por familia.
- Las fichas completas de estudio se abren en pantalla modal y contienen ruta, materias/base, ponderaciones cuando proceda, información importante, demanda/empleo, dónde comprobar oferta, PDF, simulador y fuentes oficiales.
- Se corrige la sección Universidad para que no muestre fichas de técnico superior dentro del bloque de másteres habilitantes.
- Se añade FAQ: diferencia entre doble titulación y titulación combinada.
- Se refuerza la explicación de que el listado completo requiere ingesta oficial en Supabase; la base local muestra las fichas incorporadas y enlaza siempre a fuentes oficiales.
- Los PDF se reformulan con una estructura más premium: cabecera con ITINERA, cuerpo organizado y pie con Tribeca Academia.

No requiere SQL nuevo. El esquema de Supabase de v0.8 sigue siendo válido para la fase de ingesta completa.


ITINERA v0.12
- La portada dinámica se rediseña tomando el símbolo de ITINERA como elemento central: no aparecen palabras ESO/UNI/FP/META y se añaden caminos animados con puntos de luz.
- El apartado Pruebas de acceso se convierte en una presentación visual con tarjetas, flujo resumido y botones para abrir detalles en ventana.
- Mejora de contraste del botón “Pruebas de acceso” dentro del desplegable.
- El menú desplegable “Enlaces oficiales” se reordena por grupos lógicos.
- El apartado Todos los estudios se organiza por tipo y familia, muestra estudios disponibles de primeras y añade botón “Buscar coincidencias”.
- Se añade Grado en Criminología con aliases como criminologia/criminología/criminalística/seguridad.
- Se añade sección “Convalidaciones y créditos”.
- Se incorpora información sobre convalidación de módulos de FP, reconocimiento de créditos universitarios, reconocimiento desde FP superior a grado, cambios de grado y doble titulación/titulación combinada.
- Se amplía la FAQ con preguntas sobre convalidaciones, reconocimiento de créditos y Criminología.
- La FAQ se organiza por grupos temáticos.
- No requiere SQL nuevo. La ingesta completa de todos los títulos oficiales sigue correspondiendo a la fase Supabase.

Fuentes oficiales incorporadas o reforzadas:
- Ministerio de Educación: convalidaciones de estudios nacionales y FP.
- BOE / Real Decreto 822/2021: reconocimiento y transferencia de créditos.
- QEDU y RUCT para verificación de grados como Criminología.


ITINERA v0.13
- Se cambia por completo la presentación dinámica de portada: desaparece el planteamiento de logo/camino anterior y se sustituye por palabras e iconos dinámicos relacionados con orientación académica, estudios, becas, ABAU, másteres, créditos e itinerarios.
- Se corrige el menú desplegable “Enlaces oficiales”: los enlaces vuelven a funcionar tras agruparse y el menú se repliega al seleccionar una opción.
- El buscador del paso 2 del simulador muestra sugerencias desde la tercera letra y se actualiza a medida que se escribe.
- Las sugerencias del simulador permiten seleccionar directamente el estudio meta.
- Se eliminan los círculos visuales bajo las flechas de acceso directo en el simulador.
- Las rutas largas del simulador ya no quedan cortadas: ahora permiten salto de línea y flujo completo.
- Se refuerza el movimiento visual del simulador sin dificultar la lectura.
- La FAQ se ajusta para evitar cortes y permitir navegación vertical normal.
- No requiere SQL nuevo. La ingesta completa de todos los estudios oficiales sigue pendiente de fase Supabase.


ITINERA v0.14
- La presentación dinámica de portada se cambia a una brújula central, sin logo de ITINERA ni otros dibujos centrales.
- Se mantienen palabras e iconos dinámicos relacionados con orientación académica y estudios.
- Se corrige el error de ponderaciones que podía mostrar: “Materias que poden ponderar máis: (), (), ()”.
- El simulador recibe una capa visual más premium: tarjetas con más profundidad, fondo refinado, rutas más amplias y conectores más limpios.
- Se refuerza la navegación del desplegable “Enlaces oficiales” con un sistema robusto por delegación de eventos.
- Las sugerencias del simulador mantienen aviso de consulta oficial si un estudio no está todavía incorporado a la base local.
- No requiere SQL nuevo.

Nota importante:
El buscador no ofrece literalmente todos los estudios existentes porque la base local actual es parcial. Para cubrir todos los títulos oficiales hace falta completar la fase de ingesta en Supabase desde fuentes oficiales: TodoFP/Xunta FP para ciclos, QEDU/RUCT para universidad, CIUG para acceso en Galicia y otras fuentes oficiales según enseñanzas.


ITINERA v0.15 · Fase 2
- Se añade arquitectura Supabase real para catálogo oficial.
- Se añade SQL específico: `supabase/itinera_v0_15_phase2_schema.sql`.
- Se añade función de ingesta oficial: `/.netlify/functions/import-official-data`.
- Se añade función de estado del catálogo: `/.netlify/functions/catalog-status`.
- Se actualiza `studies-search.mjs` para consultar Supabase y usar seed solo como fallback.
- Se actualiza `itinerabot-rag.mjs` para recuperar contexto desde Supabase cuando esté disponible.
- Se añade cliente común `netlify/functions/_lib/supabase.mjs`.
- Se añade guía: `INSTRUCCIONES_SUPABASE_FASE2.md`.
- Esta fase requiere ejecutar SQL en Supabase y añadir variables de entorno en Netlify.
- La ingesta completa de fuentes oficiales debe validarse progresivamente. ITINERA no debe anunciar “todos los estudios” hasta que `catalog-status` confirme cobertura suficiente y se revisen los datos críticos.


ITINERA v0.16 · GitHub Pages + Supabase directo
- Se añade `app-config.js` para configurar la conexión pública a Supabase desde GitHub Pages.
- `index.html` carga `app-config.js` antes de `app.js`.
- `app.js` intenta cargar datos desde Supabase usando `SUPABASE_URL` y `SUPABASE_ANON_KEY`.
- Si Supabase no responde o no está configurado, la herramienta sigue funcionando con `data/studies.seed.json`.
- El buscador principal y la sección “Todos los estudios” intentan consultar Supabase primero.
- Se añade `supabase/itinera_v0_16_seed_data.sql` para cargar la base inicial local en Supabase.
- No se debe subir nunca `SUPABASE_SERVICE_ROLE_KEY` ni `OPENAI_API_KEY` a GitHub.
- En GitHub Pages solo puede usarse la clave pública `anon`.


ITINERA v0.16.2
- app-config.js queda preparado para GitHub Pages con la URL base de Supabase y la publishable key.
- Se usa la URL base del proyecto, no la URL REST con /rest/v1/.
- No contiene service_role ni OPENAI_API_KEY.

ITINERA v0.17 · Fase 3
- Mejora visual de la brújula central de portada: letras N, S, E y O visibles, brújula más equilibrada y sin logo central.
- Añade SQL de fase 3: `supabase/itinera_v0_17_phase3_official_load.sql`.
- Añade control de cobertura oficial: `itinera_source_coverage`.
- Añade cola de importación oficial: `itinera_official_import_queue`.
- Añade logs de ItineraBot: `itinera_bot_logs`.
- Añade cargador oficial progresivo: `tools/official-load/import-official-catalogs.mjs`.
- Añade workflow de GitHub Actions: `.github/workflows/itinera-official-refresh.yml`.
- Añade Supabase Edge Function: `supabase/functions/itinerabot/index.ts`.
- `app-config.js` incluye el endpoint público de ItineraBot en Supabase Functions.
- `app.js` intenta consultar ItineraBot documental y, si no está desplegado o configurado, cae al modo prudente local.
- Esta fase no permite anunciar todavía cobertura completa sin revisión, pero deja preparada la infraestructura real de carga y actualización progresiva.


ITINERA v0.17.1
- Corrige el fallo de GitHub Actions: Node.js 20 detected without native WebSocket support.
- Añade dependencia `ws` y la pasa explícitamente a Supabase JS como transporte Realtime.
- Actualiza el workflow a Node 22 para evitar el problema y reducir advertencias de entorno.
- No requiere SQL nuevo.


ITINERA v0.18 · ItineraBot
- Se corrige el endpoint público de Supabase Edge Function para ItineraBot.
- Se mejora el fallback del bot para que no muestre mensajes técnicos internos.
- Se filtran fuentes técnicas de OpenAI en la interfaz del alumnado.
- Se añade workflow `deploy-itinerabot.yml` para desplegar la Edge Function desde GitHub Actions.
- La IA completa requiere desplegar la función en Supabase y configurar `OPENAI_API_KEY`.


ITINERA v0.18.1
- Añade cache busting en index.html para que GitHub Pages cargue app.js?v=0.18.1 y app-config.js?v=0.18.1.
- Refuerza ItineraBot para que nunca muestre respuestas técnicas internas sobre OpenAI/implementación.
- Elimina fuentes técnicas de OpenAI de la base local visible.
- Corrige de forma dura el fallback local de ItineraBot aunque la Edge Function no esté desplegada.


ITINERA v0.19
- El workflow de carga oficial ya no falla por incidencias parciales de fuentes externas.
- Si TodoFP u otra fuente oficial carga datos útiles, el workflow termina en verde aunque QEDU/CIUG/InfoArtísticas fallen temporalmente.
- Los fallos se registran como avisos en el reporte y en `itinera_official_import_queue`.
- No requiere SQL nuevo.


ITINERA v0.20
- Mejora la depuración de FP importada desde TodoFP.
- Añade reglas de inferencia de familias profesionales por título.
- Corrige la URL oficial de TodoFP para FP de Grado Básico.
- Añade SQL de limpieza: `supabase/itinera_v0_20_fp_cleanup.sql`.
- Añade panel visible de cobertura oficial en portada.
- Mejora las fichas de estudio con estado del dato: importado, pendiente, verificado, etc.
- No debe afirmarse aún que ITINERA contiene todos los estudios oficiales. La cobertura universitaria sigue pendiente.


ITINERA v0.21
- Añade SQL universitario: `supabase/itinera_v0_21_universidad_ciug.sql`.
- Añade fuentes oficiales universitarias: RUCT, QEDU, CIUG, DOG y BOE/RD 822/2021.
- Añade documentos oficiales resumidos para ItineraBot.
- Cambia la cobertura de Universidad y CIUG a `in_progress`.
- Añade panel universitario visual en la sección Universidad.
- Añade guía de másteres habilitantes y profesiones reguladas.
- Todavía no carga todos los grados universitarios como registros individuales: esa extracción estructurada queda para la siguiente fase.


ITINERA v0.21.1
- Corrige el enrutamiento de ItineraBot.
- Las preguntas sobre QEDU, RUCT, oficialidad, títulos propios, créditos ECTS, másteres habilitantes y CIUG se responden antes de buscar estudios.
- Evita que una pregunta conceptual universitaria devuelva una ficha aleatoria de FP.
- No requiere SQL.


ITINERA v0.22 · macrointegral
- Crea tablas nuevas para universidad, CIUG, FP Galicia, cursos de especialización y estado integral.
- Añade `supabase/itinera_v0_22_macrointegral_schema.sql`.
- Añade importador `tools/official-load/import-v022-macrointegral.mjs`.
- Añade workflow `.github/workflows/itinera-v022-macrointegral-refresh.yml`.
- Añade paneles visuales en Inicio, Universidad, Ponderaciones y FP.
- Añade respuestas de ItineraBot para cursos de especialización, FP Galicia, QEDU/RUCT y alcance universitario.
- La versión no inventa datos. Lo que no pueda extraerse con seguridad queda como `in_progress_structured` o `pending_review`.
- Requiere ejecutar SQL en Supabase antes del workflow.


ITINERA v0.22.1
- Corrige importador macrointegral universitario.
- Cambia URLs universitarias a UNIVBASE/EDUCAbase 2024 en `estadisticas.ciencia.gob.es`.
- Añade fallback de varias distribuciones CSV.
- Actualiza estados padre de universidad, FP Galicia y CIUG.
- Añade SQL `supabase/itinera_v0_22_1_macrointegral_fix.sql`.


ITINERA v0.22.2
- Corrige las rutas reales de descarga UNIVBASE/EDUCAbase: csv_bd, csv_bdsc, xlsx y px.
- Añade lectura XLSX con dependencia `xlsx`.
- Añade extractor textual CIUG desde PDF con dependencia `pdf-parse`.
- Marca CIUG como `pdf_text_imported_needs_review` si consigue filas, nunca como definitivo.
- Añade SQL `supabase/itinera_v0_22_2_univbase_ciug_fix.sql`.


ITINERA v0.22.3
- Añade cache local `tools/official-load/cache` para ficheros difíciles.
- El workflow descarga UNIVBASE/CIUG con curl antes de ejecutar el importador.
- El importador lee primero la cache y solo después intenta fetch directo.
- Añade SQL `supabase/itinera_v0_22_3_cache_download_fix.sql`.


ITINERA v0.22.4
- Corrige el workflow ante errores TLS de portales oficiales.
- Añade compatibilidad OpenSSL con UnsafeLegacyRenegotiation.
- Usa curl -k, TLS 1.2 y CipherString DEFAULT:@SECLEVEL=0.
- Mantiene lectura desde cache en el importador macrointegral.
- Añade SQL `supabase/itinera_v0_22_4_legacy_tls_cache_fix.sql`.


ITINERA v0.23 · versión definitiva operativa
- Navegación simplificada y presentación lógica.
- Inicio rediseñado con acciones claras y panel de fiabilidad.
- Universidad depurada mediante `itinera_university_catalog_clean`.
- Se evita mostrar la tabla bruta de 110.160 registros como catálogo final.
- CIUG se presenta con notas, ponderaciones o índice de consulta sin inventar coeficientes.
- FP Galicia muestra aviso si la oferta por centro sigue siendo mínima.
- Añadidos controles de calidad en `itinera_quality_checks`.
- SQL obligatorio: `supabase/itinera_v0_23_definitiva.sql`.


ITINERA v0.24 · Fuentes oficiales y UX premium
- Rediseña el apartado Fuentes oficiales.
- Añade buscador interno de fuentes y filtros lógicos.
- Mueve el estado actual del catálogo a una sección pequeña dentro de Fuentes oficiales.
- Reduce redundancias visuales en Inicio.
- Añade traducciones completas de las nuevas secciones en galego, español, inglés, francés, polaco y alemán.
- Mejora estética general con tarjetas más limpias, microinteracciones y movimiento sutil.
- No requiere SQL nuevo.
