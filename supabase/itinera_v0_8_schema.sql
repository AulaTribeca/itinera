-- ITINERA v0.8 fase 1
-- Ejecutar en Supabase SQL Editor.
-- Crea la estructura mínima para estudios, alias, rutas, centros, becas, cupos, FAQ y trazabilidad de fuentes oficiales.

create extension if not exists pg_trgm;
create extension if not exists unaccent;

create table if not exists official_sources (
  id text primary key,
  title text not null,
  url text not null,
  category text not null,
  use_case text,
  institution text,
  last_checked_at timestamptz,
  status_code integer,
  is_official boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists studies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  official_name text not null,
  study_type text not null check (study_type in ('fpgb','fpgm','fpgs','grado','master','artistica','deportiva','idiomas','militar','adultos','otro')),
  level text,
  family text,
  community text default 'Galicia',
  description text,
  default_route text,
  route_options jsonb default '[]'::jsonb,
  recommended_subjects text[] default '{}',
  ponderation_subjects jsonb default '[]'::jsonb,
  regulated_note text,
  demand_note text,
  labour_note text,
  source_ids text[] default '{}',
  is_active boolean default true,
  last_verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists study_aliases (
  id uuid primary key default gen_random_uuid(),
  study_id uuid references studies(id) on delete cascade,
  alias text not null,
  language text default 'es',
  created_at timestamptz default now()
);

create table if not exists study_locations (
  id uuid primary key default gen_random_uuid(),
  study_id uuid references studies(id) on delete cascade,
  province text,
  city text,
  center_name text,
  center_code text,
  modality text,
  regime text,
  notes text,
  source_id text references official_sources(id),
  academic_year text,
  last_verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists scholarships (
  id text primary key,
  title text not null,
  summary text,
  academic_year text,
  application_period text,
  requirements_url text,
  source_ids text[] default '{}',
  last_verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists reserved_places (
  id text primary key,
  title text not null,
  summary text,
  percentage_note text,
  applicable_to text,
  source_ids text[] default '{}',
  last_verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  source_ids text[] default '{}',
  language text default 'es',
  priority integer default 100,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists updates_log (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  status text not null,
  checked_at timestamptz default now(),
  details jsonb default '{}'::jsonb
);

create index if not exists studies_name_trgm_idx on studies using gin (official_name gin_trgm_ops);
create index if not exists studies_family_idx on studies (family);
create index if not exists studies_type_idx on studies (study_type);
create index if not exists study_aliases_alias_trgm_idx on study_aliases using gin (alias gin_trgm_ops);
create index if not exists study_locations_study_idx on study_locations (study_id);
create index if not exists study_locations_geo_idx on study_locations (province, city);
create index if not exists faq_items_question_trgm_idx on faq_items using gin (question gin_trgm_ops);

-- Fuentes oficiales iniciales.
insert into official_sources (id,title,url,category,use_case,institution)
values
('todofp','TodoFP','https://www.todofp.es/inicio.html','fp','Portal estatal oficial de Formación Profesional.','Ministerio de Educación, Formación Profesional y Deportes'),
('xunta-fp-oferta','Xunta de Galicia: oferta de FP','https://www.edu.xunta.gal/fp/oferta-fp','fp','Oferta oficial de FP en Galicia.','Xunta de Galicia'),
('xunta-fp-ciclos','Xunta de Galicia: ciclos FP','https://www.edu.xunta.gal/fp/ciclos','fp','Ciclos y perfiles profesionales.','Xunta de Galicia'),
('xunta-fp-centros','Xunta de Galicia: centros FP','https://www.edu.xunta.gal/fp/centros','fp','Centros con oferta de FP.','Xunta de Galicia'),
('ciug-admision','CIUG: admisión SUG','https://www.ciug.gal/admision-sug','universidad','Admisión, notas de corte, matrícula y acceso en Galicia.','CIUG'),
('ciug-ponderaciones-2026','CIUG: ponderaciones 2026','https://ciug.gal/PDF/2026/Acceso/ponderacions_2026.pdf','universidad','Ponderaciones oficiales por grado.','CIUG'),
('qedu','QEDU','https://www.ciencia.gob.es/Universidades/QEDU.html','universidad','Qué estudiar y dónde en la universidad.','Ministerio de Ciencia, Innovación y Universidades'),
('ruct','RUCT','https://universidades.sede.gob.es/pagina/index/directorio/Proc_Ruct','universidad','Registro oficial de universidades, centros y títulos.','Ministerio de Ciencia, Innovación y Universidades'),
('becas-portada','Portal oficial de Becas Educación','https://www.becaseducacion.gob.es/portada.html','becas','Portal oficial de becas y ayudas.','Ministerio de Educación, Formación Profesional y Deportes'),
('beca-neae','Ayudas NEAE 2026/2027','https://www.educacionfpydeportes.gob.es/servicios-al-ciudadano/catalogo/general/05/050140/ficha/050140-2026.html','becas','Ayudas para alumnado con necesidad específica de apoyo educativo.','Ministerio de Educación, Formación Profesional y Deportes'),
('rd-412-2014','BOE: Real Decreto 412/2014','https://www.boe.es/buscar/act.php?id=BOE-A-2014-6008','normativa','Admisión a enseñanzas universitarias y plazas reservadas.','BOE'),
('rd-822-2021','BOE: Real Decreto 822/2021','https://www.boe.es/buscar/act.php?id=BOE-A-2021-15781','normativa','Ordenación de enseñanzas universitarias oficiales.','BOE')
on conflict (id) do update set title=excluded.title,url=excluded.url,category=excluded.category,use_case=excluded.use_case,institution=excluded.institution,updated_at=now();

-- Datos semilla mínimos para probar Supabase. El catálogo completo debe cargarse por lotes desde fuentes oficiales.
insert into studies (slug, official_name, study_type, level, family, default_route, recommended_subjects, regulated_note, demand_note, labour_note, source_ids, route_options)
values
('cm-instalaciones-electricas-automaticas','Técnico en Instalaciones Eléctricas y Automáticas','fpgm','Ciclo formativo de grado medio','Electricidad y Electrónica','ESO con título → Ciclo formativo de grado medio de Instalaciones Eléctricas y Automáticas',array['Tecnología y digitalización','Matemáticas aplicadas','Física básica'],'No requiere máster habilitante.','Perfil técnico vinculado a instalaciones, mantenimiento y automatismos.','Instalaciones eléctricas, mantenimiento, automatismos.',array['todofp','xunta-fp-oferta','xunta-fp-centros'],'[{"title":"Ruta directa","steps":["ESO","FP grado medio","Instalaciones Eléctricas y Automáticas","FCT","Titulación técnica"]}]'::jsonb),
('cm-soldadura-caldeiraria','Técnico en Soldadura y Calderería','fpgm','Ciclo formativo de grado medio','Fabricación Mecánica','ESO con título → Ciclo formativo de grado medio de Soldadura y Calderería',array['Tecnología','Matemáticas aplicadas','Dibujo técnico básico'],'No requiere máster habilitante.','Perfil técnico vinculado a industria, mantenimiento, fabricación metálica y naval.','Soldadura, calderería, montaje metálico.',array['todofp','xunta-fp-oferta','xunta-fp-centros'],'[{"title":"Ruta directa","steps":["ESO","FP grado medio","Soldadura y Calderería","FCT","Empleo técnico"]}]'::jsonb),
('grado-arquitectura','Grado en Fundamentos de la Arquitectura / Arquitectura','grado','Grado universitario + máster habilitante','Ingeniería y Arquitectura','ESO → Bachillerato de Ciencias y Tecnología → PAU/ABAU → Grado → Máster Universitario en Arquitectura',array['Matemáticas II','Física','Dibujo Técnico II'],'La profesión de arquitecto/a requiere máster habilitante.','Estudio exigente y de larga duración.','Arquitectura, urbanismo, rehabilitación, edificación.',array['qedu','ruct','ciug-ponderaciones-2026'],'[{"title":"Ruta ordinaria","steps":["ESO","Bachillerato de Ciencias y Tecnología","Matemáticas II · Física · Dibujo Técnico II","PAU/ABAU","Grado","Máster habilitante"]}]'::jsonb)
on conflict (slug) do update set official_name=excluded.official_name, study_type=excluded.study_type, level=excluded.level, family=excluded.family, default_route=excluded.default_route, recommended_subjects=excluded.recommended_subjects, regulated_note=excluded.regulated_note, demand_note=excluded.demand_note, labour_note=excluded.labour_note, source_ids=excluded.source_ids, route_options=excluded.route_options, updated_at=now();

insert into study_aliases (study_id, alias)
select s.id, alias from studies s, unnest(array['electricidad','electricista','instalaciones eléctricas','instalaciones electricas']) alias where s.slug='cm-instalaciones-electricas-automaticas'
on conflict do nothing;

insert into study_aliases (study_id, alias)
select s.id, alias from studies s, unnest(array['soldadura','soldadira','soldadur','calderería','caldeiraría']) alias where s.slug='cm-soldadura-caldeiraria'
on conflict do nothing;

insert into study_aliases (study_id, alias)
select s.id, alias from studies s, unnest(array['arquitectura','arquitecto','arquitecta','fundamentos arquitectura']) alias where s.slug='grado-arquitectura'
on conflict do nothing;
