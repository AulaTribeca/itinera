-- ITINERA v0.17 · Fase 3
-- Catálogo oficial ampliable, control de cobertura e ItineraBot documental.
-- Ejecutar después de v0.15/v0.16. No elimina datos previos.

create table if not exists public.itinera_source_coverage (
  id text primary key,
  source_id text references public.itinera_sources(id) on delete cascade,
  scope text not null,
  expected_coverage text not null,
  current_status text not null default 'pending',
  last_import_at timestamptz,
  last_verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.itinera_bot_logs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  lang text default 'gl',
  answer_preview text,
  mode text,
  sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.itinera_official_import_queue (
  id uuid primary key default gen_random_uuid(),
  source_id text references public.itinera_sources(id) on delete set null,
  url text not null,
  kind text not null default 'document',
  priority integer not null default 100,
  enabled boolean not null default true,
  last_attempt_at timestamptz,
  last_status text,
  notes text,
  created_at timestamptz not null default now(),
  unique(url, kind)
);

create or replace function public.itinera_touch_source_coverage()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists itinera_source_coverage_touch on public.itinera_source_coverage;
create trigger itinera_source_coverage_touch before update on public.itinera_source_coverage
for each row execute function public.itinera_touch_source_coverage();

alter table public.itinera_source_coverage enable row level security;
alter table public.itinera_bot_logs enable row level security;
alter table public.itinera_official_import_queue enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_source_coverage' and policyname='itinera_source_coverage_public_read') then
    create policy itinera_source_coverage_public_read on public.itinera_source_coverage for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_official_import_queue' and policyname='itinera_import_queue_public_read') then
    create policy itinera_import_queue_public_read on public.itinera_official_import_queue for select using (true);
  end if;
end $$;

insert into public.itinera_sources(id,title,url,category,usefulness,official,jurisdiction)
values
('educagob-sistema','EducaGob: sistema educativo','https://educagob.educacionfpydeportes.gob.es/ensenanzas.html','sistema','Estructura oficial del sistema educativo y enseñanzas.',true,'España'),
('educagob-tras-eso','EducaGob: opciones al terminar ESO','https://educagob.educacionfpydeportes.gob.es/ensenanzas/secundaria/informacion-general/opciones-terminar.html','itinerarios','Opciones oficiales al finalizar ESO.',true,'España'),
('educagob-tras-bach','EducaGob: opciones al terminar Bachillerato','https://educagob.educacionfpydeportes.gob.es/ensenanzas/bachillerato/informacion-general/opciones-terminar.html','itinerarios','Opciones oficiales al finalizar Bachillerato.',true,'España'),
('todofp-gb','TodoFP: ciclos de grado básico','https://www.todofp.es/que-estudiar/grados-d/grado-basico.html','fp','Catálogo oficial de ciclos de FP de grado básico.',true,'España'),
('todofp-gm','TodoFP: ciclos de grado medio','https://www.todofp.es/que-estudiar/grados-d/grado-medio.html','fp','Catálogo oficial de ciclos de FP de grado medio.',true,'España'),
('todofp-gs','TodoFP: ciclos de grado superior','https://www.todofp.es/que-estudiar/grados-d/grado-superior.html','fp','Catálogo oficial de ciclos de FP de grado superior.',true,'España'),
('todofp-especializacion','TodoFP: cursos de especialización','https://www.todofp.es/que-estudiar/grados-e.html','fp','Catálogo oficial de cursos de especialización de FP.',true,'España'),
('todofp-familias','TodoFP: familias profesionales','https://www.todofp.es/que-estudiar/familias-profesionales.html','fp','Catálogo oficial por familias profesionales.',true,'España'),
('xunta-fp-oferta','Xunta de Galicia: oferta de FP','https://www.edu.xunta.gal/fp/oferta-fp','fp-galicia','Oferta oficial de FP en Galicia por curso, modalidad, régimen y centro.',true,'Galicia'),
('xunta-fp-ciclos','Xunta de Galicia: ciclos FP','https://www.edu.xunta.gal/fp/ciclos','fp-galicia','Ciclos y perfiles profesionales con oferta en Galicia.',true,'Galicia'),
('xunta-fp-centros','Xunta de Galicia: centros FP','https://www.edu.xunta.gal/fp/centros','fp-galicia','Buscador oficial de centros con oferta de FP.',true,'Galicia'),
('xunta-abertos-centros','Portal Abertos Xunta: centros educativos de Galicia','https://abertos.xunta.gal/catalogo/ensino-formacion/-/dataset/0257/centros-educativos-galicia','centros','Dataset oficial exportable de centros educativos de Galicia.',true,'Galicia'),
('qedu','QEDU: qué estudiar y dónde en la universidad','https://www.ciencia.gob.es/qedu','universidad','Buscador oficial de titulaciones universitarias, universidades y datos orientativos.',true,'España'),
('qedu-ayuda','QEDU: ayuda y metodología','https://www.ciencia.gob.es/qedu/AyudaQEDU.html','universidad','Explicación oficial de datos universitarios incluidos en QEDU.',true,'España'),
('ruct','RUCT: Registro de Universidades, Centros y Títulos','https://universidades.sede.gob.es/pagina/index/directorio/Proc_Ruct','universidad','Registro oficial de universidades, centros y títulos.',true,'España'),
('ciug-admision','CIUG: admisión SUG','https://www.ciug.gal/admision-sug','universidad-galicia','Admisión, notas de corte, matrícula y acceso al Sistema Universitario de Galicia.',true,'Galicia'),
('ciug-ponderaciones','CIUG: ponderaciones PAU/ABAU','https://www.ciug.gal/gal/abau/materias-ponderacion','universidad-galicia','Ponderaciones oficiales de materias para admisión universitaria en Galicia.',true,'Galicia'),
('becas-ministerio','Ministerio: becas y ayudas','https://www.becaseducacion.gob.es/','becas','Portal oficial de becas y ayudas del Ministerio.',true,'España'),
('beca-neae','Ministerio: ayudas para alumnado con necesidad específica de apoyo educativo','https://www.becaseducacion.gob.es/becas-y-ayudas/ayudas-apoyo-educativo.html','becas','Convocatoria oficial NEAE.',true,'España'),
('infoartisticas','InfoArtísticas','https://www.infoartisticas.educacion.gob.es/ensenanzas.html','artisticas','Información oficial sobre enseñanzas artísticas.',true,'España'),
('registro-centros-docentes','Registro Estatal de Centros Docentes no Universitarios','https://www.educacionfpydeportes.gob.es/contenidos/centros-docentes/buscar-centro-no-universitario.html','centros','Registro oficial de centros docentes no universitarios.',true,'España')
on conflict (id) do update set
  title=excluded.title,
  url=excluded.url,
  category=excluded.category,
  usefulness=excluded.usefulness,
  official=excluded.official,
  jurisdiction=excluded.jurisdiction,
  updated_at=now();

insert into public.itinera_source_coverage(id,source_id,scope,expected_coverage,current_status,notes)
values
('coverage-fp-estatal','todofp-familias','FP estatal completa','Ciclos de grado básico, medio, superior y cursos de especialización por familia profesional.','in_progress','La extracción automática debe validarse por familia y título.'),
('coverage-fp-galicia','xunta-fp-oferta','Oferta FP Galicia','Centros, localidades, regímenes, modalidades y plazas cuando estén publicadas oficialmente.','pending_review','La oferta cambia por curso académico y requiere control de vigencia.'),
('coverage-universidad-ruct','ruct','Títulos universitarios oficiales','Grados, másteres y doctorados oficiales registrados.','pending_review','El RUCT debe usarse como verificación de oficialidad.'),
('coverage-universidad-qedu','qedu','Oferta universitaria orientativa','Títulos, universidades, centros, créditos, plazas y datos orientativos disponibles en QEDU.','pending_review','QEDU ofrece información orientativa y debe contrastarse con RUCT y universidad.'),
('coverage-ciug','ciug-admision','Acceso SUG Galicia','Notas de corte, admisión, ponderaciones, matrícula y cupos del SUG.','pending_review','Datos altamente cambiantes por convocatoria.'),
('coverage-becas','becas-ministerio','Becas y ayudas oficiales','Beca general, NEAE y ayudas oficiales del Ministerio.','pending_review','Convocatorias y plazos cambian cada curso.'),
('coverage-artisticas','infoartisticas','Enseñanzas artísticas','Oferta, centros y enseñanzas artísticas oficiales.','pending_review','Requiere conectores específicos.'),
('coverage-centros','xunta-abertos-centros','Centros educativos Galicia','Centros públicos, privados y concertados con datos exportables.','pending_review','Dataset oficial exportable CSV/XML.')
on conflict (id) do update set
  source_id=excluded.source_id,
  scope=excluded.scope,
  expected_coverage=excluded.expected_coverage,
  current_status=excluded.current_status,
  notes=excluded.notes,
  updated_at=now();

insert into public.itinera_official_import_queue(source_id,url,kind,priority,enabled,notes)
values
('educagob-sistema','https://educagob.educacionfpydeportes.gob.es/ensenanzas.html','document',10,true,'Estructura general del sistema educativo.'),
('educagob-tras-eso','https://educagob.educacionfpydeportes.gob.es/ensenanzas/secundaria/informacion-general/opciones-terminar.html','document',15,true,'Itinerarios tras ESO.'),
('educagob-tras-bach','https://educagob.educacionfpydeportes.gob.es/ensenanzas/bachillerato/informacion-general/opciones-terminar.html','document',15,true,'Itinerarios tras Bachillerato.'),
('todofp-gb','https://www.todofp.es/que-estudiar/grados-d/grado-basico.html','fp_catalog',20,true,'Catálogo FP grado básico.'),
('todofp-gm','https://www.todofp.es/que-estudiar/grados-d/grado-medio.html','fp_catalog',20,true,'Catálogo FP grado medio.'),
('todofp-gs','https://www.todofp.es/que-estudiar/grados-d/grado-superior.html','fp_catalog',20,true,'Catálogo FP grado superior.'),
('todofp-especializacion','https://www.todofp.es/que-estudiar/grados-e.html','fp_catalog',30,true,'Cursos de especialización FP.'),
('todofp-familias','https://www.todofp.es/que-estudiar/familias-profesionales.html','document',30,true,'Familias profesionales.'),
('xunta-fp-oferta','https://www.edu.xunta.gal/fp/oferta-fp','document',40,true,'Oferta FP Galicia.'),
('xunta-fp-ciclos','https://www.edu.xunta.gal/fp/ciclos','document',40,true,'Ciclos FP Galicia.'),
('xunta-fp-centros','https://www.edu.xunta.gal/fp/centros','document',40,true,'Centros FP Galicia.'),
('xunta-abertos-centros','https://abertos.xunta.gal/catalogo/ensino-formacion/-/dataset/0257/centros-educativos-galicia','document',45,true,'Centros educativos Galicia, dataset exportable.'),
('qedu','https://www.ciencia.gob.es/qedu','document',50,true,'Buscador universitario QEDU.'),
('qedu-ayuda','https://www.ciencia.gob.es/qedu/AyudaQEDU.html','document',50,true,'Ayuda y metodología QEDU.'),
('ruct','https://universidades.sede.gob.es/pagina/index/directorio/Proc_Ruct','document',50,true,'RUCT.'),
('ciug-admision','https://www.ciug.gal/admision-sug','document',60,true,'Admisión SUG.'),
('ciug-ponderaciones','https://www.ciug.gal/gal/abau/materias-ponderacion','document',60,true,'Ponderaciones CIUG.'),
('becas-ministerio','https://www.becaseducacion.gob.es/','document',70,true,'Becas Ministerio.'),
('beca-neae','https://www.becaseducacion.gob.es/becas-y-ayudas/ayudas-apoyo-educativo.html','document',70,true,'Beca NEAE.'),
('infoartisticas','https://www.infoartisticas.educacion.gob.es/ensenanzas.html','document',80,true,'Enseñanzas artísticas.'),
('registro-centros-docentes','https://www.educacionfpydeportes.gob.es/contenidos/centros-docentes/buscar-centro-no-universitario.html','document',80,true,'Centros docentes no universitarios.')
on conflict (url, kind) do update set
  source_id=excluded.source_id,
  priority=excluded.priority,
  enabled=excluded.enabled,
  notes=excluded.notes;

select
  (select count(*) from public.itinera_sources) as sources,
  (select count(*) from public.itinera_source_coverage) as coverage_items,
  (select count(*) from public.itinera_official_import_queue) as import_queue_items;
