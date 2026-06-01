
-- ITINERA v0.21 · Universidad, RUCT/QEDU, másteres habilitantes y CIUG
-- Ejecutar en Supabase SQL Editor. No borra datos.

-- 1. Fuentes oficiales universitarias y CIUG.
insert into public.itinera_sources(id,title,url,category,usefulness,official,jurisdiction)
values
('ruct', 'RUCT: Registro de Universidades, Centros y Títulos', 'https://universidades.sede.gob.es/pagina/index/directorio/Proc_Ruct', 'universidad', 'Registro oficial para verificar universidades, centros y títulos oficiales de grado, máster y doctorado.', true, 'España'),
('qedu', 'QEDU: qué estudiar y dónde en la universidad', 'https://www.ciencia.gob.es/qedu', 'universidad', 'Aplicación oficial del Ministerio para consultar titulaciones universitarias y datos útiles de orientación.', true, 'España'),
('boe-rd-822-2021', 'BOE: Real Decreto 822/2021', 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-15781', 'normativa', 'Normativa oficial de organización de las enseñanzas universitarias y aseguramiento de su calidad.', true, 'España'),
('ciug-admision', 'CIUG: admisión al Sistema Universitario de Galicia', 'https://www.ciug.gal/admision-sug', 'universidad', 'Fuente oficial para admisión, matrícula, cupos y procedimientos del SUG.', true, 'Galicia'),
('ciug-ponderaciones-2026', 'CIUG: ponderaciones acceso 2026/2027', 'https://ciug.gal/PDF/2026/Acceso/ponderacions_2026.pdf', 'ponderaciones', 'Documento oficial de parámetros de ponderación para estudios oficiales de grado del SUG.', true, 'Galicia'),
('dog-ponderaciones-2026-2027', 'DOG: parámetros de ponderación curso 2026/2027', 'https://www.xunta.gal/dog/Publicados/2025/20251110/AnuncioG0761-311025-0001_es.html', 'ponderaciones', 'Resolución publicada en el DOG con parámetros de ponderación para el acceso al SUG 2026/2027.', true, 'Galicia'),
('boe-ley-34-2006-abogacia-procura', 'BOE: acceso a profesiones de Abogacía y Procura', 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-18870', 'masteres_habilitantes', 'Normativa estatal de acceso a las profesiones de abogacía y procura.', true, 'España'),
('boe-profesorado-secundaria', 'BOE: formación del profesorado de secundaria', 'https://www.boe.es/buscar/doc.php?id=BOE-A-2007-22450', 'masteres_habilitantes', 'Requisitos para la formación del profesorado de ESO, Bachillerato, FP y enseñanzas de idiomas.', true, 'España'),
('boe-psicologia-general-sanitaria', 'BOE: Psicología General Sanitaria', 'https://www.boe.es/buscar/act.php?id=BOE-A-2011-15623', 'masteres_habilitantes', 'Base normativa de la Psicología General Sanitaria y su vía de habilitación.', true, 'España')
on conflict (id) do update set
title = excluded.title,
url = excluded.url,
category = excluded.category,
usefulness = excluded.usefulness,
official = excluded.official,
jurisdiction = excluded.jurisdiction;

-- 2. Documentos oficiales resumidos para ItineraBot documental.
insert into public.itinera_official_documents(id, source_id, title, url, category, content, summary, metadata, checked_at)
values
('doc-ruct-verificacion', 'ruct', 'Cómo verificar la oficialidad de un título universitario', 'https://universidades.sede.gob.es/pagina/index/directorio/Proc_Ruct', 'universidad',
 'El RUCT es el Registro de Universidades, Centros y Títulos. Debe utilizarse para comprobar si un grado, máster o doctorado es oficial, la universidad responsable, el centro y los datos registrales del título. En ITINERA, cualquier decisión sobre oficialidad de un título universitario debe remitirse a RUCT.',
 'RUCT sirve para verificar oficialidad de títulos universitarios.', '{"source_kind":"official_summary","v":"0.21"}'::jsonb, now()),
('doc-qedu-orientacion', 'qedu', 'QEDU para consultar qué estudiar y dónde', 'https://www.ciencia.gob.es/qedu', 'universidad',
 'QEDU es la aplicación oficial del Ministerio para consultar titulaciones universitarias y datos útiles para elegir qué estudiar y dónde. Debe emplearse como herramienta de orientación universitaria y contrastarse con RUCT cuando sea necesario verificar oficialidad.',
 'QEDU orienta sobre titulaciones universitarias y dónde cursarlas.', '{"source_kind":"official_summary","v":"0.21"}'::jsonb, now()),
('doc-rd-822-creditos', 'boe-rd-822-2021', 'Créditos, reconocimiento y estructura universitaria', 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-15781', 'universidad',
 'El Real Decreto 822/2021 establece la organización de las enseñanzas universitarias oficiales. Regula aspectos de grado, máster y doctorado, reconocimiento y transferencia de créditos, y estructura de las enseñanzas universitarias oficiales.',
 'Normativa básica de estructura universitaria y reconocimiento de créditos.', '{"source_kind":"official_summary","v":"0.21"}'::jsonb, now()),
('doc-ciug-admision', 'ciug-admision', 'Admisión al Sistema Universitario de Galicia', 'https://www.ciug.gal/admision-sug', 'universidad',
 'La CIUG es la fuente oficial para procedimientos de acceso y admisión al Sistema Universitario de Galicia. Las notas de corte, cupos, matrícula y procedimientos deben comprobarse en la convocatoria vigente.',
 'CIUG: admisión, cupos y procedimientos del SUG.', '{"source_kind":"official_summary","v":"0.21"}'::jsonb, now()),
('doc-ciug-ponderaciones-2026', 'ciug-ponderaciones-2026', 'Ponderaciones SUG 2026/2027', 'https://ciug.gal/PDF/2026/Acceso/ponderacions_2026.pdf', 'ponderaciones',
 'Documento oficial de la CIUG con parámetros de ponderación de materias para estudios oficiales de grado del Sistema Universitario de Galicia en el acceso 2026/2027. Las ponderaciones deben consultarse por grado y universidad, sin inferirlas por analogía.',
 'Ponderaciones oficiales CIUG para acceso 2026/2027.', '{"source_kind":"official_summary","v":"0.21"}'::jsonb, now())
on conflict (id) do update set
source_id = excluded.source_id,
title = excluded.title,
url = excluded.url,
category = excluded.category,
content = excluded.content,
summary = excluded.summary,
metadata = excluded.metadata,
checked_at = excluded.checked_at;

-- 3. Cobertura universitaria y CIUG en progreso.
with coverage_rows(id, scope, expected_coverage, current_status, notes) as (
  values
  ('universidad-grados', 'Universidad · Grados', 'Grados universitarios oficiales desde RUCT/QEDU.', 'in_progress', 'v0.21 incorpora fuentes oficiales y documentos de verificación. Pendiente extracción estructurada completa de títulos.'),
  ('universidad-masteres-habilitantes', 'Universidad · Másteres habilitantes', 'Másteres oficiales habilitantes y profesiones reguladas desde RUCT/QEDU y normativa aplicable.', 'in_progress', 'v0.21 incorpora guía y fuentes normativas iniciales. Requiere completar profesiones reguladas por rama.'),
  ('galicia-ciug-ponderaciones-notas', 'Galicia · Ponderaciones y notas CIUG', 'Ponderaciones, notas de corte y admisión del SUG desde CIUG o carga manual revisada.', 'in_progress', 'v0.21 incorpora fuentes CIUG y DOG para ponderaciones 2026/2027. Pendiente extracción estructurada por grado.')
)
update public.itinera_source_coverage t
set expected_coverage = c.expected_coverage,
    current_status = c.current_status,
    notes = c.notes
from coverage_rows c
where t.id = c.id;

with coverage_rows(id, scope, expected_coverage, current_status, notes) as (
  values
  ('universidad-grados', 'Universidad · Grados', 'Grados universitarios oficiales desde RUCT/QEDU.', 'in_progress', 'v0.21 incorpora fuentes oficiales y documentos de verificación. Pendiente extracción estructurada completa de títulos.'),
  ('universidad-masteres-habilitantes', 'Universidad · Másteres habilitantes', 'Másteres oficiales habilitantes y profesiones reguladas desde RUCT/QEDU y normativa aplicable.', 'in_progress', 'v0.21 incorpora guía y fuentes normativas iniciales. Requiere completar profesiones reguladas por rama.'),
  ('galicia-ciug-ponderaciones-notas', 'Galicia · Ponderaciones y notas CIUG', 'Ponderaciones, notas de corte y admisión del SUG desde CIUG o carga manual revisada.', 'in_progress', 'v0.21 incorpora fuentes CIUG y DOG para ponderaciones 2026/2027. Pendiente extracción estructurada por grado.')
)
insert into public.itinera_source_coverage(id, scope, expected_coverage, current_status, notes)
select c.id, c.scope, c.expected_coverage, c.current_status, c.notes
from coverage_rows c
where not exists (select 1 from public.itinera_source_coverage t where t.id = c.id);

-- 4. FAQ universitaria esencial.
insert into public.itinera_faq_items(id, category, question, answer, sources, priority)
values
('faq-ruct-oficialidad', 'Universidad', '¿Cómo sé si un grado o máster universitario es oficial?', 'Debe comprobarse en el RUCT. La denominación comercial de una web universitaria no basta: hay que verificar que el título consta como oficial en el Registro de Universidades, Centros y Títulos.', '["ruct"]'::jsonb, 20),
('faq-qedu-ruct-diferencia', 'Universidad', '¿QEDU y RUCT sirven para lo mismo?', 'No exactamente. QEDU ayuda a consultar qué estudiar y dónde, con información útil para la orientación. RUCT es el registro oficial para verificar la oficialidad de títulos, centros y universidades.', '["qedu","ruct"]'::jsonb, 21),
('faq-master-habilitante', 'Universidad', '¿Qué es un máster habilitante?', 'Es un máster universitario oficial que permite acceder a determinadas profesiones reguladas. No todo máster oficial es habilitante. Debe comprobarse en RUCT, en la normativa de la profesión y en la universidad.', '["ruct","boe-rd-822-2021"]'::jsonb, 22),
('faq-ciug-ponderaciones', 'Galicia · CIUG', '¿Dónde miro qué materias ponderan para un grado en Galicia?', 'Para el Sistema Universitario de Galicia deben consultarse las ponderaciones oficiales de la CIUG para el curso correspondiente. No deben inferirse ponderaciones por parecido entre grados.', '["ciug-ponderaciones-2026","dog-ponderaciones-2026-2027","ciug-admision"]'::jsonb, 23),
('faq-notas-corte', 'Galicia · CIUG', '¿Las notas de corte garantizan entrar en un grado?', 'No. La nota de corte es una referencia de convocatorias anteriores y cambia cada curso según oferta, demanda y adjudicación de plazas. Debe comprobarse siempre en CIUG y en la convocatoria vigente.', '["ciug-admision"]'::jsonb, 24),
('faq-creditos-ects', 'Universidad', '¿Qué son los créditos ECTS?', 'Los créditos ECTS expresan la carga de trabajo de las enseñanzas universitarias. Para decisiones concretas sobre reconocimiento o transferencia de créditos hay que revisar la normativa universitaria y el Real Decreto 822/2021.', '["boe-rd-822-2021"]'::jsonb, 25)
on conflict (id) do update set
category = excluded.category,
question = excluded.question,
answer = excluded.answer,
sources = excluded.sources,
priority = excluded.priority;

select
  (select count(*) from public.itinera_studies) as studies,
  (select count(*) from public.itinera_official_documents) as official_documents,
  (select count(*) from public.itinera_source_coverage) as source_coverage,
  (select current_status from public.itinera_source_coverage where id = 'universidad-grados') as universidad_grados_status,
  (select current_status from public.itinera_source_coverage where id = 'galicia-ciug-ponderaciones-notas') as ciug_status;
