
-- ITINERA v0.15 · Fase 2
-- Supabase schema for official-source ingestion, catalog search and documentary RAG.
-- Run this in Supabase SQL Editor. It is additive and keeps previous v0.8 tables if they exist.

create extension if not exists pg_trgm;
create extension if not exists unaccent;

create table if not exists public.itinera_sources (
  id text primary key,
  title text not null,
  url text not null,
  category text not null default 'general',
  usefulness text,
  official boolean not null default true,
  jurisdiction text,
  last_checked_at timestamptz,
  last_status integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.itinera_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_id text references public.itinera_sources(id) on delete set null,
  mode text not null default 'manual',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  ok boolean,
  status text,
  inserted_count integer not null default 0,
  updated_count integer not null default 0,
  error_count integer not null default 0,
  notes text
);

create table if not exists public.itinera_studies (
  id text primary key,
  name text not null,
  normalized_name text generated always as (lower(unaccent(name))) stored,
  type text not null,
  level text not null,
  family text,
  branch text,
  jurisdiction text default 'España',
  official_title boolean not null default true,
  route text,
  regulated text,
  demand text,
  labour text,
  subjects jsonb not null default '[]'::jsonb,
  ponderation_subjects jsonb not null default '[]'::jsonb,
  route_options jsonb not null default '[]'::jsonb,
  availability_by_province jsonb not null default '{}'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  source_url text,
  source_id text references public.itinera_sources(id) on delete set null,
  raw jsonb not null default '{}'::jsonb,
  data_quality text not null default 'needs_review',
  verified_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists itinera_studies_name_trgm on public.itinera_studies using gin (normalized_name gin_trgm_ops);
create index if not exists itinera_studies_type_idx on public.itinera_studies(type);
create index if not exists itinera_studies_family_idx on public.itinera_studies(family);
create index if not exists itinera_studies_sources_idx on public.itinera_studies using gin(sources);

create table if not exists public.itinera_study_aliases (
  id bigserial primary key,
  study_id text not null references public.itinera_studies(id) on delete cascade,
  alias text not null,
  normalized_alias text generated always as (lower(unaccent(alias))) stored,
  alias_type text not null default 'keyword',
  created_at timestamptz not null default now(),
  unique(study_id, normalized_alias)
);

create index if not exists itinera_alias_trgm on public.itinera_study_aliases using gin (normalized_alias gin_trgm_ops);

create table if not exists public.itinera_study_locations (
  id bigserial primary key,
  study_id text not null references public.itinera_studies(id) on delete cascade,
  province text,
  city text,
  center text,
  center_code text,
  regime text,
  modality text,
  course_year text,
  source_url text,
  raw jsonb not null default '{}'::jsonb,
  last_seen_at timestamptz not null default now()
);

create index if not exists itinera_locations_study_idx on public.itinera_study_locations(study_id);
create index if not exists itinera_locations_province_idx on public.itinera_study_locations(province);
create index if not exists itinera_locations_city_idx on public.itinera_study_locations(city);

create table if not exists public.itinera_official_documents (
  id text primary key,
  source_id text references public.itinera_sources(id) on delete set null,
  title text not null,
  url text not null,
  category text not null default 'general',
  content text,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists itinera_documents_content_trgm on public.itinera_official_documents using gin (lower(unaccent(coalesce(content,''))) gin_trgm_ops);
create index if not exists itinera_documents_category_idx on public.itinera_official_documents(category);

create table if not exists public.itinera_faq_items (
  id text primary key,
  category text not null default 'Orientación general',
  question text not null,
  answer text not null,
  sources jsonb not null default '[]'::jsonb,
  priority integer not null default 100,
  updated_at timestamptz not null default now()
);

create table if not exists public.itinera_access_exams (
  id text primary key,
  title text not null,
  short text,
  when_needed text,
  age text,
  structure jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.itinera_scholarships (
  id text primary key,
  title text not null,
  summary text,
  period text,
  sources jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.itinera_reservations (
  id text primary key,
  title text not null,
  summary text,
  sources jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.itinera_convalidations (
  id text primary key,
  title text not null,
  summary text,
  details jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.itinera_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists itinera_sources_touch on public.itinera_sources;
create trigger itinera_sources_touch before update on public.itinera_sources
for each row execute function public.itinera_touch_updated_at();

drop trigger if exists itinera_studies_touch on public.itinera_studies;
create trigger itinera_studies_touch before update on public.itinera_studies
for each row execute function public.itinera_touch_updated_at();

drop trigger if exists itinera_documents_touch on public.itinera_official_documents;
create trigger itinera_documents_touch before update on public.itinera_official_documents
for each row execute function public.itinera_touch_updated_at();

create or replace function public.itinera_search_studies(
  q text default '',
  study_type text default 'all',
  study_family text default 'all',
  max_results integer default 40
)
returns table (
  id text,
  name text,
  type text,
  level text,
  family text,
  branch text,
  route text,
  regulated text,
  demand text,
  labour text,
  subjects jsonb,
  ponderation_subjects jsonb,
  route_options jsonb,
  availability_by_province jsonb,
  sources jsonb,
  source_url text,
  data_quality text,
  score real
)
language sql stable as $$
  with query as (
    select lower(unaccent(coalesce(q,''))) as nq
  ),
  aliases as (
    select study_id, max(similarity(normalized_alias, (select nq from query))) as alias_score
    from public.itinera_study_aliases
    where (select nq from query) <> ''
    group by study_id
  )
  select
    s.id, s.name, s.type, s.level, s.family, s.branch, s.route, s.regulated, s.demand, s.labour,
    s.subjects, s.ponderation_subjects, s.route_options, s.availability_by_province, s.sources, s.source_url, s.data_quality,
    greatest(
      case when (select nq from query) = '' then 0.55 else similarity(s.normalized_name, (select nq from query)) end,
      coalesce(a.alias_score,0),
      case when (select nq from query) <> '' and s.normalized_name like '%' || (select nq from query) || '%' then 1.0 else 0 end
    )::real as score
  from public.itinera_studies s
  left join aliases a on a.study_id = s.id
  where
    (study_type = 'all' or s.type = study_type)
    and (study_family = 'all' or s.family = study_family)
    and (
      (select nq from query) = ''
      or s.normalized_name % (select nq from query)
      or s.normalized_name like '%' || (select nq from query) || '%'
      or coalesce(a.alias_score,0) > 0.25
    )
  order by score desc, s.name asc
  limit max_results;
$$;

-- Read-only anon access for the public app.
alter table public.itinera_sources enable row level security;
alter table public.itinera_studies enable row level security;
alter table public.itinera_study_aliases enable row level security;
alter table public.itinera_study_locations enable row level security;
alter table public.itinera_official_documents enable row level security;
alter table public.itinera_faq_items enable row level security;
alter table public.itinera_access_exams enable row level security;
alter table public.itinera_scholarships enable row level security;
alter table public.itinera_reservations enable row level security;
alter table public.itinera_convalidations enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_sources' and policyname='itinera_sources_public_read') then
    create policy itinera_sources_public_read on public.itinera_sources for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_studies' and policyname='itinera_studies_public_read') then
    create policy itinera_studies_public_read on public.itinera_studies for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_study_aliases' and policyname='itinera_aliases_public_read') then
    create policy itinera_aliases_public_read on public.itinera_study_aliases for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_study_locations' and policyname='itinera_locations_public_read') then
    create policy itinera_locations_public_read on public.itinera_study_locations for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_official_documents' and policyname='itinera_documents_public_read') then
    create policy itinera_documents_public_read on public.itinera_official_documents for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_faq_items' and policyname='itinera_faq_public_read') then
    create policy itinera_faq_public_read on public.itinera_faq_items for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_access_exams' and policyname='itinera_access_public_read') then
    create policy itinera_access_public_read on public.itinera_access_exams for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_scholarships' and policyname='itinera_scholarships_public_read') then
    create policy itinera_scholarships_public_read on public.itinera_scholarships for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_reservations' and policyname='itinera_reservations_public_read') then
    create policy itinera_reservations_public_read on public.itinera_reservations for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_convalidations' and policyname='itinera_convalidations_public_read') then
    create policy itinera_convalidations_public_read on public.itinera_convalidations for select using (true);
  end if;
end $$;

insert into public.itinera_sources(id,title,url,category,usefulness,jurisdiction)
values
('todofp-catalogo','TodoFP: catálogo de Formación Profesional','https://www.todofp.es/que-estudiar.html','fp','Catálogo estatal oficial de Formación Profesional.','España'),
('todofp-familias','TodoFP: familias profesionales','https://www.todofp.es/que-estudiar/familias-profesionales.html','fp','Catálogo por familias profesionales.','España'),
('xunta-fp-oferta','Xunta de Galicia: oferta de FP','https://www.edu.xunta.gal/fp/oferta-fp','fp','Oferta oficial de FP en Galicia por curso, régimen, modalidad y centro.','Galicia'),
('xunta-fp-ciclos','Xunta de Galicia: ciclos FP','https://www.edu.xunta.gal/fp/ciclos','fp','Perfiles profesionales de ciclos con oferta sostenida con fondos públicos.','Galicia'),
('xunta-fp-centros','Xunta de Galicia: centros FP','https://www.edu.xunta.gal/fp/centros','fp','Buscador oficial de centros con oferta de FP.','Galicia'),
('qedu','QEDU: qué estudiar y dónde en la universidad','https://www.ciencia.gob.es/qedu','universidad','Buscador oficial de titulaciones universitarias, universidades y datos útiles.','España'),
('ruct','RUCT: Registro de Universidades, Centros y Títulos','https://universidades.sede.gob.es/pagina/index/directorio/Proc_Ruct','universidad','Registro oficial de universidades, centros y títulos.','España'),
('ciug-admision','CIUG: admisión SUG','https://www.ciug.gal/admision-sug','universidad','Admisión, notas de corte, matrícula y acceso al Sistema Universitario de Galicia.','Galicia')
on conflict (id) do update set
title=excluded.title,url=excluded.url,category=excluded.category,usefulness=excluded.usefulness,jurisdiction=excluded.jurisdiction,updated_at=now();
