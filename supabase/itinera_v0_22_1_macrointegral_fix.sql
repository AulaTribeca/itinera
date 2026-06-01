
-- ITINERA v0.22.1 · corrección importador universidad/estado
-- Ejecutar en Supabase antes o después del workflow v0.22.1. No borra datos.

insert into public.itinera_sources(id,title,url,category,usefulness,official,jurisdiction)
values
('educabase-grados-univ-2024', 'UNIVBASE/EDUCAbase 2024: titulaciones de grado por universidad', 'https://estadisticas.ciencia.gob.es/jaxiPx/files/_px/es/csv_c/Universitaria/EUCT/2024/Titulaciones/l0/Titulaciones_Grado_Rama_Univ.px', 'universidad_datos', 'CSV oficial actualizado con titulaciones de grado impartidas por universidad, tipo de centro, créditos y rama de enseñanza.', true, 'España'),
('educabase-masteres-univ-2024', 'UNIVBASE/EDUCAbase 2024: titulaciones de máster por universidad', 'https://estadisticas.ciencia.gob.es/jaxiPx/files/_px/es/csv_c/Universitaria/EUCT/2024/Titulaciones/l0/Titulaciones_Master_Rama_Univ.px', 'universidad_datos', 'CSV oficial actualizado con titulaciones de máster por universidad, estructura, créditos y rama de enseñanza.', true, 'España')
on conflict (id) do update set
title=excluded.title,
url=excluded.url,
category=excluded.category,
usefulness=excluded.usefulness,
official=excluded.official,
jurisdiction=excluded.jurisdiction;

update public.itinera_integral_status
set status = 'in_progress_structured',
    notes = 'v0.22.1 corrige el importador universitario para usar UNIVBASE/EDUCAbase 2024 en estadisticas.ciencia.gob.es. Ejecutar workflow v0.22 macrointegral refresh.',
    checked_at = now()
where id in ('v022-university-offers','v022-university-grados-educabase','v022-university-masteres-educabase')
  and status in ('schema_ready','fetch_failed');

update public.itinera_integral_status
set status = 'in_progress_structured',
    notes = 'v0.22.1 mantiene CIUG como capa enlazada y pendiente de extracción tabular validada desde PDF/convocatoria vigente.',
    checked_at = now()
where id = 'v022-ciug'
  and status = 'schema_ready';

select id, block, status, count_value, source_id, notes, checked_at
from public.itinera_integral_status
order by block;
