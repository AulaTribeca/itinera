-- ITINERA v0.22.3 · cache de descarga oficial para UNIVBASE/CIUG
-- Ejecutar en Supabase y relanzar el workflow. No borra datos.

update public.itinera_integral_status
set status='in_progress_structured',
    notes='v0.22.3 añade descarga previa con curl y cache local para UNIVBASE/CIUG antes del importador Node. Relanzar workflow.',
    checked_at=now()
where id in ('v022-university-offers','v022-university-grados-educabase','v022-university-masteres-educabase','v022-ciug');

select id, block, status, count_value, source_id, notes, checked_at
from public.itinera_integral_status
order by block;
