
-- ITINERA v0.23.1 · versión definitiva operativa, SQL corregido
-- Limpieza de universidad, capa de calidad y preparación de UI simplificada.
-- Ejecutar en Supabase SQL Editor y después relanzar workflow: ITINERA v0.22 macrointegral refresh.

create table if not exists public.itinera_university_catalog_clean (
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
  data_status text default 'aggregate_official_clean',
  notes text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.itinera_quality_checks (
  id text primary key,
  block text not null,
  status text not null,
  severity text default 'info',
  value integer default 0,
  notes text,
  checked_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

alter table public.itinera_university_catalog_clean enable row level security;
alter table public.itinera_quality_checks enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_university_catalog_clean' and policyname='Public read university catalog clean') then
    create policy "Public read university catalog clean" on public.itinera_university_catalog_clean for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='itinera_quality_checks' and policyname='Public read quality checks') then
    create policy "Public read quality checks" on public.itinera_quality_checks for select using (true);
  end if;
end $$;

-- Construcción inicial del catálogo limpio a partir de la tabla bruta ya cargada.
-- No se inventan titulaciones: se agrupan registros oficiales agregados por nivel, universidad, rama, créditos y tipo de centro.
-- v0.23.1 corrige el GROUP BY usando una CTE normalizada, para evitar referencias a columnas sin agrupar.

drop table if exists tmp_itinera_university_clean;

create temp table tmp_itinera_university_clean as
with normalized as (
  select
    coalesce(nullif(trim(level),''),'Universidad') as level_norm,
    trim(university) as university_norm,
    coalesce(nullif(trim(university_type),''),'') as university_type_norm,
    coalesce(nullif(trim(branch),''),'Rama no especificada') as branch_norm,
    coalesce(nullif(trim(credits),''),'') as credits_norm,
    coalesce(nullif(trim(source_id),''),'educabase') as source_id_norm,
    source_url
  from public.itinera_university_offers
  where coalesce(trim(university),'') <> ''
    and lower(coalesce(trim(university),'')) not in ('total','universidad','no consta','sin especificar')
    and coalesce(trim(level),'') <> ''
)
select
  case
    when lower(level_norm) like '%grado%' then
      'grado-clean-' || md5(concat_ws('|', university_norm, branch_norm, credits_norm, university_type_norm))
    when lower(level_norm) like '%máster%' or lower(level_norm) like '%master%' then
      'master-clean-' || md5(concat_ws('|', university_norm, branch_norm, credits_norm, university_type_norm))
    else
      'univ-clean-' || md5(concat_ws('|', level_norm, university_norm, branch_norm, credits_norm, university_type_norm))
  end as id,
  concat_ws(' · ', nullif(level_norm,''), nullif(university_norm,''), nullif(branch_norm,''), case when nullif(credits_norm,'') is not null then credits_norm || ' ECTS' end) as title,
  level_norm as level,
  university_norm as university,
  university_type_norm as university_type,
  ''::text as center,
  ''::text as province,
  ''::text as community,
  branch_norm as branch,
  ''::text as field,
  credits_norm as credits,
  ''::text as modality,
  ''::text as cut_off_note,
  null::integer as places,
  source_id_norm as source_id,
  max(source_url) as source_url,
  true as official,
  'aggregate_official_clean'::text as data_status,
  'Dato oficial agregado y depurado desde EDUCAbase/SIIU. Útil para orientación general; la oficialidad de un título concreto debe verificarse en RUCT/QEDU.'::text as notes,
  jsonb_build_object(
    'raw_rows', count(*),
    'v', '0.23.1',
    'source', 'EDUCAbase/SIIU',
    'warning', 'No equivale a catálogo título a título'
  ) as metadata,
  now() as created_at,
  now() as updated_at
from normalized
group by level_norm, university_norm, university_type_norm, branch_norm, credits_norm, source_id_norm;

insert into public.itinera_university_catalog_clean(
  id,title,level,university,university_type,center,province,community,branch,field,credits,modality,cut_off_note,places,source_id,source_url,official,data_status,notes,metadata,created_at,updated_at
)
select id,title,level,university,university_type,center,province,community,branch,field,credits,modality,cut_off_note,places,source_id,source_url,official,data_status,notes,metadata,created_at,updated_at
from tmp_itinera_university_clean
where title is not null and university is not null
on conflict (id) do update set
  title=excluded.title,
  level=excluded.level,
  university=excluded.university,
  university_type=excluded.university_type,
  branch=excluded.branch,
  credits=excluded.credits,
  source_id=excluded.source_id,
  source_url=excluded.source_url,
  data_status=excluded.data_status,
  notes=excluded.notes,
  metadata=excluded.metadata,
  updated_at=now();

-- Sustituye la tabla usada por la interfaz por la versión depurada, para evitar los 110.160 registros brutos.
delete from public.itinera_university_offers
where coalesce(data_status,'') in ('aggregate_official','aggregate_official_raw','aggregate_official_clean')
   or coalesce(source_id,'') like 'educabase-%';

insert into public.itinera_university_offers(
  id,title,level,university,university_type,center,province,community,branch,field,credits,modality,cut_off_note,places,source_id,source_url,official,data_status,notes,metadata,created_at,updated_at
)
select id,title,level,university,university_type,center,province,community,branch,field,credits,modality,cut_off_note,places,source_id,source_url,official,data_status,notes,metadata,created_at,updated_at
from public.itinera_university_catalog_clean
on conflict (id) do update set
  title=excluded.title,
  level=excluded.level,
  university=excluded.university,
  university_type=excluded.university_type,
  branch=excluded.branch,
  credits=excluded.credits,
  data_status=excluded.data_status,
  notes=excluded.notes,
  metadata=excluded.metadata,
  updated_at=now();

-- Control de calidad visible.
insert into public.itinera_quality_checks(id, block, status, severity, value, notes, checked_at, metadata)
values
('q-v023-university-clean', 'Universidad', 'clean_catalog_ready', 'info',
  (select count(*) from public.itinera_university_catalog_clean),
  'Catálogo universitario agregado depurado. RUCT/QEDU siguen siendo fuente de verificación título a título.', now(), '{"v":"0.23"}'::jsonb),
('q-v023-ciug-cutoffs', 'CIUG notas de corte', case when (select count(*) from public.itinera_ciug_cutoffs)>0 then 'imported_needs_review' else 'pending' end, 'warning',
  (select count(*) from public.itinera_ciug_cutoffs),
  'Notas CIUG importadas desde PDF. Deben revisarse visualmente con la convocatoria oficial vigente.', now(), '{"v":"0.23"}'::jsonb),
('q-v023-ciug-ponderations', 'CIUG ponderaciones', case when (select count(*) from public.itinera_ciug_ponderations)>0 then 'index_or_values_imported_needs_review' else 'pending_pdf_extraction' end, 'warning',
  (select count(*) from public.itinera_ciug_ponderations),
  'Las ponderaciones CIUG solo se muestran si se extraen con suficiente seguridad. Las filas sin coeficiente son índice de consulta, no dato definitivo.', now(), '{"v":"0.23"}'::jsonb),
('q-v023-fp-galicia', 'FP Galicia', case when (select count(*) from public.itinera_fp_galicia_offer)>20 then 'offer_imported_needs_review' else 'minimum_layer_only' end, 'warning',
  (select count(*) from public.itinera_fp_galicia_offer),
  'Oferta FP Galicia por centro/ciclo/plazas aún requiere cruce fino con Xunta FP. No presentar como oferta completa si el valor es bajo.', now(), '{"v":"0.23"}'::jsonb),
('q-v023-fp-specializations', 'Cursos especialización FP', case when (select count(*) from public.itinera_fp_specializations)>0 then 'imported_needs_review' else 'pending' end, 'info',
  (select count(*) from public.itinera_fp_specializations),
  'Cursos de especialización importados desde TodoFP. Revisar familia, requisitos y duración por ficha oficial.', now(), '{"v":"0.23"}'::jsonb)
on conflict (id) do update set
  status=excluded.status,
  severity=excluded.severity,
  value=excluded.value,
  notes=excluded.notes,
  checked_at=now(),
  metadata=excluded.metadata;

update public.itinera_integral_status
set status = case when (select count(*) from public.itinera_university_catalog_clean)>0 then 'clean_catalog_ready' else status end,
    count_value = greatest(count_value, (select count(*) from public.itinera_university_catalog_clean)),
    notes = 'v0.23: catálogo universitario agregado depurado. Útil para orientación; verificación oficial título a título en RUCT/QEDU.',
    checked_at = now()
where id = 'v022-university-offers';

update public.itinera_integral_status
set status = case when (select count(*) from public.itinera_ciug_cutoffs)>0 then 'pdf_text_imported_needs_review' else status end,
    count_value = greatest(count_value, (select count(*) from public.itinera_ciug_cutoffs) + (select count(*) from public.itinera_ciug_ponderations)),
    notes = 'v0.23: CIUG se muestra con notas importadas y ponderaciones solo si se extraen con seguridad. Consultar siempre PDF oficial vigente.',
    checked_at = now()
where id = 'v022-ciug';

update public.itinera_source_coverage
set current_status='verified_with_dynamic_checks',
    notes='v0.23: fuente oficial conectada. Los datos cambiantes se muestran con estado de revisión y enlace oficial.'
where id in ('universidad-grados','universidad-masteres-habilitantes','galicia-ciug-ponderaciones-notas','fp-cursos-especializacion','galicia-oferta-centros-fp');

select
  (select count(*) from public.itinera_university_catalog_clean) as university_catalog_clean,
  (select count(*) from public.itinera_university_offers) as university_offers_ui,
  (select count(*) from public.itinera_ciug_cutoffs) as ciug_cutoffs,
  (select count(*) from public.itinera_ciug_ponderations) as ciug_ponderations,
  (select count(*) from public.itinera_fp_galicia_offer) as fp_galicia_offer,
  (select count(*) from public.itinera_fp_specializations) as fp_specializations,
  (select count(*) from public.itinera_quality_checks) as quality_checks;
