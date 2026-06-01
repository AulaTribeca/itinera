
-- ITINERA v0.22.2 · corrección descarga UNIVBASE + extracción CIUG PDF
-- Ejecutar en Supabase antes o después de subir los archivos, y después relanzar el workflow.

insert into public.itinera_sources(id,title,url,category,usefulness,official,jurisdiction)
values
('educabase-grados-univ-2024-csvbd', 'UNIVBASE/EDUCAbase 2024: grados por universidad, CSV exportable', 'https://estadisticas.ciencia.gob.es/jaxiPx/files/_px/es/csv_bd/Universitaria/EUCT/2024/Titulaciones/l0/Titulaciones_Grado_Rama_Univ.csv_bd', 'universidad_datos', 'Exportación oficial CSV por tabuladores de titulaciones de grado por universidad, tipo de centro, créditos y rama.', true, 'España'),
('educabase-masteres-univ-2024-csvbd', 'UNIVBASE/EDUCAbase 2024: másteres por universidad, CSV exportable', 'https://estadisticas.ciencia.gob.es/jaxiPx/files/_px/es/csv_bd/Universitaria/EUCT/2024/Titulaciones/l0/Titulaciones_Master_Rama_Univ.csv_bd', 'universidad_datos', 'Exportación oficial CSV por tabuladores de titulaciones de máster por universidad, estructura, créditos y rama.', true, 'España'),
('ciug-notas-corte-2025', 'CIUG: notas de corte curso 2025/2026', 'https://ciug.gal/PDF/2025/ACCESO/notas_de_corte_2025.pdf', 'ciug', 'Documento oficial de notas de corte del SUG para el curso 2025/2026.', true, 'Galicia'),
('ciug-ponderaciones-2026', 'CIUG: ponderaciones acceso 2026/2027', 'https://ciug.gal/PDF/2026/Acceso/ponderacions_2026.pdf', 'ponderaciones', 'Documento oficial de parámetros de ponderación para estudios oficiales de grado del SUG.', true, 'Galicia')
on conflict (id) do update set
title=excluded.title,
url=excluded.url,
category=excluded.category,
usefulness=excluded.usefulness,
official=excluded.official,
jurisdiction=excluded.jurisdiction;

update public.itinera_integral_status
set status = 'in_progress_structured',
    notes = 'v0.22.2 corrige el importador para usar las rutas exportables reales de UNIVBASE: csv_bd, csv_bdsc, xlsx y px. Relanzar workflow.',
    checked_at = now()
where id in ('v022-university-offers','v022-university-grados-educabase','v022-university-masteres-educabase')
  and status in ('schema_ready','fetch_failed','in_progress_structured');

update public.itinera_integral_status
set status = 'in_progress_structured',
    notes = 'v0.22.2 añade extracción textual desde PDF CIUG para notas y ponderaciones. Revisión obligatoria antes de tratar los datos como definitivos.',
    checked_at = now()
where id = 'v022-ciug';

select id, block, status, count_value, source_id, notes, checked_at
from public.itinera_integral_status
order by block;
