
-- ITINERA v0.22 · macrointegral: universidad, CIUG, FP Galicia, cursos de especialización, becas/cupos/convalidaciones.
-- Ejecutar en Supabase SQL Editor antes de lanzar el workflow v0.22.
-- No borra datos. Crea tablas públicas de lectura y actualiza fuentes/cobertura.

create table if not exists public.itinera_university_offers (
  id text primary key,
  title text not null,
  level text not null,
  university text,
  university_type text,
  center text,
  province text,
  community text,
  branch text,
  field text,
  credits text,
  modality text,
  cut_off_note text,
  places integer,
  source_id text,
  source_url text,
  official boolean default true,
  data_status text default 'pending_review',
  notes text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.itinera_ciug_cutoffs (
  id text primary key,
  academic_year text not null,
  degree_code text,
  degree_name text not null,
  university text,
  campus text,
  general_cutoff text,
  graduates_cutoff text,
  m25_cutoff text,
  m45_cutoff text,
  athletes_cutoff text,
  disability_cutoff text,
  source_id text,
  source_url text,
  data_status text default 'pending_review',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.itinera_ciug_ponderations (
  id text primary key,
  access_year text not null,
  degree_name text not null,
  university text,
  branch text,
  subject text not null,
  coefficient numeric,
  source_id text,
  source_url text,
  data_status text default 'pending_review',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.itinera_fp_galicia_offer (
  id text primary key,
  academic_year text not null,
  family text,
  cycle_name text not null,
  cycle_level text,
  center_code text,
  center_name text,
  municipality text,
  province text,
  modality text,
  regime text,
  places integer,
  source_id text,
  source_url text,
  data_status text default 'pending_review',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.itinera_fp_specializations (
  id text primary key,
  name text not null,
  family text,
  level text default 'Curso de especialización de FP',
  access_type text,
  duration text,
  source_id text,
  source_url text,
  data_status text default 'pending_review',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.itinera_integral_status (
  id text primary key,
  block text not null,
  status text not null,
  count_value integer default 0,
  source_id text,
  notes text,
  checked_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

alter table public.itinera_university_offers enable row level security;
alter table public.itinera_ciug_cutoffs enable row level security;
alter table public.itinera_ciug_ponderations enable row level security;
alter table public.itinera_fp_galicia_offer enable row level security;
alter table public.itinera_fp_specializations enable row level security;
alter table public.itinera_integral_status enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_university_offers' and policyname='Public read university offers') then
    create policy "Public read university offers" on public.itinera_university_offers for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_ciug_cutoffs' and policyname='Public read ciug cutoffs') then
    create policy "Public read ciug cutoffs" on public.itinera_ciug_cutoffs for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_ciug_ponderations' and policyname='Public read ciug ponderations') then
    create policy "Public read ciug ponderations" on public.itinera_ciug_ponderations for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_fp_galicia_offer' and policyname='Public read fp galicia offer') then
    create policy "Public read fp galicia offer" on public.itinera_fp_galicia_offer for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_fp_specializations' and policyname='Public read fp specializations') then
    create policy "Public read fp specializations" on public.itinera_fp_specializations for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_integral_status' and policyname='Public read integral status') then
    create policy "Public read integral status" on public.itinera_integral_status for select using (true);
  end if;
end $$;

-- Fuentes oficiales adicionales y reforzadas.
insert into public.itinera_sources(id,title,url,category,usefulness,official,jurisdiction)
values
('qedu-ayuda', 'QEDU: ayuda y alcance de los datos', 'https://www.ciencia.gob.es/qedu/AyudaQEDU.html', 'universidad', 'Aclara que QEDU es orientativo, usa RUCT/SIIU y permite consultar titulaciones oficiales de grado, máster y doctorado.', true, 'España'),
('educabase-grados-univ-2023', 'EDUCAbase/SIIU: titulaciones de grado por universidad', 'https://estadisticas.universidades.gob.es/jaxiPx/files/_px/es/csv_c/Universitaria/EUCT/2023/Titulaciones/l0/Titulaciones_Grado_Rama_Univ.px', 'universidad_datos', 'CSV oficial con resultados por universidad sobre titulaciones impartidas de grado, créditos y rama de enseñanza.', true, 'España'),
('educabase-masteres-univ-2023', 'EDUCAbase/SIIU: titulaciones de máster por universidad', 'https://estadisticas.universidades.gob.es/jaxiPx/files/_px/es/csv_c/Universitaria/EUCT/2023/Titulaciones/l0/Titulaciones_Master_Rama_Univ.px', 'universidad_datos', 'CSV oficial con resultados por universidad sobre titulaciones de máster, créditos y rama de enseñanza.', true, 'España'),
('ciug-notas-corte-2025', 'CIUG: notas de corte curso 2025/2026', 'https://ciug.gal/PDF/2025/ACCESO/notas_de_corte_2025.pdf', 'ciug', 'Documento oficial de notas de corte del SUG para el curso 2025/2026.', true, 'Galicia'),
('ciug-notas-corte-ultimos', 'CIUG: notas de corte de los tres últimos cursos', 'https://ciug.gal/PDF/2025/ACCESO/notas_de_corte_3_ultimos_cursos.pdf', 'ciug', 'Documento oficial de notas de corte de los tres últimos cursos para orientar tendencias.', true, 'Galicia'),
('ciug-preinscripcion-2025', 'CIUG: convocatoria de preinscripción SUG 2025/2026', 'https://ciug.gal/PDF/2025/ACCESO/convocatoria_preinscricion_2025.pdf', 'ciug', 'Bases y plazos de admisión a enseñanzas universitarias oficiales del SUG.', true, 'Galicia'),
('ciug-matricula-sug', 'CIUG: matrícula en el SUG', 'https://ciug.gal/matricula-sug', 'ciug', 'Información oficial sobre matrícula en el Sistema Universitario de Galicia.', true, 'Galicia'),
('xunta-fp-oferta-2025-2026', 'Xunta FP: oferta FP curso 2025/2026', 'https://www.edu.xunta.gal/fp/oferta-fp', 'fp_galicia', 'Oferta ordinaria y modular de FP en Galicia para el curso vigente, con advertencia de cambios de plazas.', true, 'Galicia'),
('xunta-fp-mapas-oferta', 'Xunta FP: mapas da oferta de FP 2025/2026', 'https://www.edu.xunta.gal/fp/mapas-oferta-fp', 'fp_galicia', 'Mapas de oferta de FP por familia profesional, provincia y concello.', true, 'Galicia'),
('xunta-centros-educativos-csv', 'Xunta Datos Abertos: centros educativos de Galicia CSV', 'https://abertos.xunta.gal/catalogo/ensino-formacion/-/dataset/0257/centros-educativos-galicia/005/descarga-directa-ficheiro.csv', 'centros_galicia', 'CSV oficial de centros educativos públicos, privados y concertados con dirección y geolocalización.', true, 'Galicia'),
('xunta-fp-ciclos', 'Xunta FP: buscador de ciclos con oferta sostenida con fondos públicos', 'https://www.edu.xunta.gal/fp/ciclos', 'fp_galicia', 'Buscador oficial de ciclos formativos y cursos de especialización con oferta sostenida con fondos públicos en Galicia.', true, 'Galicia'),
('todofp-cursos-especializacion', 'TodoFP: cursos de especialización, Grados E', 'https://www.todofp.es/que-estudiar/grados-e/curso-especializacion.html', 'fp_especializacion', 'Catálogo oficial de cursos de especialización de Formación Profesional.', true, 'España'),
('todofp-grados-e-info', 'TodoFP: información general Grados E', 'https://www.todofp.es/que-estudiar/grados-e.html', 'fp_especializacion', 'Información oficial sobre duración y requisitos generales de cursos de especialización de FP.', true, 'España'),
('todofp-fp-cifras', 'TodoFP: FP en cifras', 'https://www.todofp.es/sobre-fp/informacion-general.html', 'fp', 'Referencia oficial sobre oferta formativa, ciclos y cursos de especialización de FP.', true, 'España')
on conflict (id) do update set
title=excluded.title,
url=excluded.url,
category=excluded.category,
usefulness=excluded.usefulness,
official=excluded.official,
jurisdiction=excluded.jurisdiction;

-- Documentos oficiales resumidos para ItineraBot.
insert into public.itinera_official_documents(id, source_id, title, url, category, content, summary, metadata, checked_at)
values
('doc-qedu-alcance-v022', 'qedu-ayuda', 'Alcance de QEDU y límites orientativos', 'https://www.ciencia.gob.es/qedu/AyudaQEDU.html', 'universidad',
 'QEDU es una aplicación oficial de orientación universitaria. Sus datos proceden del RUCT y del SIIU, y la información disponible debe considerarse exclusivamente informativa y orientativa. Permite consultar titulaciones oficiales de grado, máster, doble grado, doble máster y doctorado; no incluye títulos propios.',
 'QEDU orienta; RUCT verifica oficialidad. QEDU no incluye títulos propios.', '{"v":"0.22","block":"universidad"}'::jsonb, now()),
('doc-ciug-notas-ponderaciones-v022', 'ciug-admision', 'CIUG: notas, ponderaciones y admisión', 'https://www.ciug.gal/admision-sug', 'ciug',
 'La CIUG centraliza información de admisión al Sistema Universitario de Galicia. Las notas de corte son referencias de procesos anteriores y las ponderaciones deben consultarse por curso, grado y universidad. La admisión depende de convocatoria, cupos, plazas y adjudicaciones vigentes.',
 'CIUG es la fuente para admisión SUG, notas de corte, ponderaciones y matrícula.', '{"v":"0.22","block":"ciug"}'::jsonb, now()),
('doc-xunta-oferta-fp-v022', 'xunta-fp-oferta-2025-2026', 'Oferta FP Galicia 2025/2026', 'https://www.edu.xunta.gal/fp/oferta-fp', 'fp_galicia',
 'La Xunta publica la oferta ordinaria y modular de FP para el curso 2025/2026. La página advierte de que el número de plazas ofertadas por ciclo formativo podría sufrir modificaciones, por lo que ITINERA debe tratar los datos de plazas como información sujeta a convocatoria y revisión.',
 'Oferta FP Galicia sujeta a actualización por curso, centro, modalidad y plazas.', '{"v":"0.22","block":"fp_galicia"}'::jsonb, now()),
('doc-todofp-grados-e-v022', 'todofp-grados-e-info', 'Cursos de especialización de FP, Grados E', 'https://www.todofp.es/que-estudiar/grados-e.html', 'fp_especializacion',
 'Los cursos de especialización de FP, Grados E, tienen duración orientativa entre 300 y 720 horas según TodoFP y requieren uno de los títulos de grado medio o superior indicados para cada curso concreto.',
 'Grados E: cursos de especialización de FP con requisitos de acceso específicos.', '{"v":"0.22","block":"fp_especializacion"}'::jsonb, now())
on conflict (id) do update set
source_id=excluded.source_id,
title=excluded.title,
url=excluded.url,
category=excluded.category,
content=excluded.content,
summary=excluded.summary,
metadata=excluded.metadata,
checked_at=excluded.checked_at;

-- Cobertura: todo el bloque integral queda en progreso estructurado, nunca como completo sin carga.
with coverage_rows(id, scope, expected_coverage, current_status, notes) as (
  values
  ('universidad-grados', 'Universidad · Grados', 'Grados universitarios oficiales desde RUCT/QEDU/SIIU, con título, universidad, centro, créditos, rama, modalidad y notas cuando estén disponibles.', 'in_progress_structured', 'v0.22 crea tablas y workflow de importación. QEDU/RUCT deben seguir siendo verificación oficial título a título.'),
  ('universidad-masteres-habilitantes', 'Universidad · Másteres habilitantes', 'Másteres oficiales, másteres habilitantes y profesiones reguladas con normativa BOE y verificación RUCT.', 'in_progress_structured', 'v0.22 refuerza normativa y guía; los títulos concretos se cargan solo si proceden de fuente oficial estructurada.'),
  ('galicia-ciug-ponderaciones-notas', 'Galicia · Ponderaciones y notas CIUG', 'Ponderaciones, notas de corte, admisión, cupos y matrícula SUG por curso y convocatoria.', 'in_progress_structured', 'v0.22 crea tablas específicas para CIUG y documentos oficiales. PDF y vigencia deben revisarse por curso.'),
  ('galicia-oferta-centros-fp', 'Galicia · Oferta por centros FP', 'Oferta de FP por centro, localidad, modalidad, régimen y curso desde Xunta FP y datos abiertos.', 'in_progress_structured', 'v0.22 crea tabla específica y workflow de carga de centros/oferta. Plazas sujetas a modificación.'),
  ('fp-cursos-especializacion', 'FP · Cursos de especialización', 'Cursos de especialización de FP, Grados E, por familia, requisitos, duración y fuente TodoFP.', 'in_progress_structured', 'v0.22 añade importador y tabla específica de Grados E.')
)
update public.itinera_source_coverage t
set expected_coverage=c.expected_coverage,
    current_status=c.current_status,
    notes=c.notes
from coverage_rows c
where t.id=c.id;

with coverage_rows(id, scope, expected_coverage, current_status, notes) as (
  values
  ('universidad-grados', 'Universidad · Grados', 'Grados universitarios oficiales desde RUCT/QEDU/SIIU, con título, universidad, centro, créditos, rama, modalidad y notas cuando estén disponibles.', 'in_progress_structured', 'v0.22 crea tablas y workflow de importación. QEDU/RUCT deben seguir siendo verificación oficial título a título.'),
  ('universidad-masteres-habilitantes', 'Universidad · Másteres habilitantes', 'Másteres oficiales, másteres habilitantes y profesiones reguladas con normativa BOE y verificación RUCT.', 'in_progress_structured', 'v0.22 refuerza normativa y guía; los títulos concretos se cargan solo si proceden de fuente oficial estructurada.'),
  ('galicia-ciug-ponderaciones-notas', 'Galicia · Ponderaciones y notas CIUG', 'Ponderaciones, notas de corte, admisión, cupos y matrícula SUG por curso y convocatoria.', 'in_progress_structured', 'v0.22 crea tablas específicas para CIUG y documentos oficiales. PDF y vigencia deben revisarse por curso.'),
  ('galicia-oferta-centros-fp', 'Galicia · Oferta por centros FP', 'Oferta de FP por centro, localidad, modalidad, régimen y curso desde Xunta FP y datos abiertos.', 'in_progress_structured', 'v0.22 crea tabla específica y workflow de carga de centros/oferta. Plazas sujetas a modificación.'),
  ('fp-cursos-especializacion', 'FP · Cursos de especialización', 'Cursos de especialización de FP, Grados E, por familia, requisitos, duración y fuente TodoFP.', 'in_progress_structured', 'v0.22 añade importador y tabla específica de Grados E.')
)
insert into public.itinera_source_coverage(id, scope, expected_coverage, current_status, notes)
select c.id, c.scope, c.expected_coverage, c.current_status, c.notes
from coverage_rows c
where not exists (select 1 from public.itinera_source_coverage t where t.id=c.id);

-- FAQ reforzada.
insert into public.itinera_faq_items(id, category, question, answer, sources, priority)
values
('faq-qedu-alcance-v022', 'Universidad', '¿QEDU contiene todos los títulos universitarios oficiales?', 'QEDU permite consultar titulaciones oficiales de grado, doble grado, máster, doble máster y doctorado ofertadas por universidades españolas, públicas y privadas. Su uso es orientativo; para verificar la oficialidad administrativa de un título concreto debe comprobarse RUCT.', '["qedu-ayuda","qedu","ruct"]'::jsonb, 30),
('faq-qedu-titulos-propios-v022', 'Universidad', '¿QEDU incluye títulos propios?', 'No. La ayuda oficial de QEDU indica que los títulos disponibles son estudios oficiales verificados por el Consejo de Universidades y programaciones conjuntas de estos; no se incluyen títulos propios.', '["qedu-ayuda","ruct"]'::jsonb, 31),
('faq-ciug-notas-v022', 'Galicia · CIUG', '¿Una nota de corte me garantiza plaza?', 'No. La nota de corte se fija al final del proceso de matrícula según plazas y notas de admisión de quienes se preinscriben. Cambia cada curso y debe usarse como referencia, no como garantía.', '["qedu-ayuda","ciug-admision","ciug-notas-corte-2025"]'::jsonb, 32),
('faq-fp-galicia-plazas-v022', 'FP Galicia', '¿Las plazas de FP Galicia son definitivas?', 'La Xunta publica la oferta por curso, pero advierte de que el número de plazas ofertadas por ciclo formativo puede sufrir modificaciones. Debe comprobarse siempre la página oficial de oferta FP y la convocatoria vigente.', '["xunta-fp-oferta-2025-2026","xunta-fp-mapas-oferta"]'::jsonb, 33),
('faq-grados-e-v022', 'FP', '¿Qué son los cursos de especialización de FP?', 'Son formaciones de Grado E vinculadas a la FP. Para acceder es necesario tener alguno de los títulos de grado medio o superior exigidos para el curso concreto. La duración y requisitos deben consultarse en TodoFP.', '["todofp-cursos-especializacion","todofp-grados-e-info"]'::jsonb, 34)
on conflict (id) do update set
category=excluded.category,
question=excluded.question,
answer=excluded.answer,
sources=excluded.sources,
priority=excluded.priority;

-- Estado inicial.
insert into public.itinera_integral_status(id, block, status, count_value, source_id, notes, checked_at, metadata)
values
('v022-university-offers', 'Universidad estructurada', 'schema_ready', 0, 'qedu-ayuda', 'Tablas creadas. Ejecutar workflow v0.22 para cargar datos estructurados disponibles.', now(), '{"v":"0.22"}'::jsonb),
('v022-ciug', 'CIUG notas y ponderaciones', 'schema_ready', 0, 'ciug-admision', 'Tablas creadas. Los PDFs se enlazan y la extracción se valida por curso.', now(), '{"v":"0.22"}'::jsonb),
('v022-fp-galicia', 'Oferta FP Galicia', 'schema_ready', 0, 'xunta-fp-oferta-2025-2026', 'Tablas creadas. Ejecutar workflow v0.22 para cargar centros/oferta cuando el origen sea estructurado.', now(), '{"v":"0.22"}'::jsonb),
('v022-grados-e', 'FP cursos de especialización', 'schema_ready', 0, 'todofp-cursos-especializacion', 'Tabla creada. Ejecutar workflow v0.22 para extraer enlaces/títulos desde TodoFP.', now(), '{"v":"0.22"}'::jsonb)
on conflict (id) do update set
block=excluded.block,
status=excluded.status,
count_value=excluded.count_value,
source_id=excluded.source_id,
notes=excluded.notes,
checked_at=excluded.checked_at,
metadata=excluded.metadata;

select
  (select count(*) from public.itinera_studies) as studies,
  (select count(*) from public.itinera_university_offers) as university_offers,
  (select count(*) from public.itinera_ciug_cutoffs) as ciug_cutoffs,
  (select count(*) from public.itinera_ciug_ponderations) as ciug_ponderations,
  (select count(*) from public.itinera_fp_galicia_offer) as fp_galicia_offer,
  (select count(*) from public.itinera_fp_specializations) as fp_specializations,
  (select count(*) from public.itinera_official_documents) as official_documents,
  (select count(*) from public.itinera_source_coverage) as source_coverage;
