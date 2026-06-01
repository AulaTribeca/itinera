-- ITINERA v0.22.4 · compatibilidad TLS legado para descarga oficial
-- Ejecutar en Supabase antes o después de subir los archivos. Después, relanzar el workflow.

update public.itinera_integral_status
set status = 'in_progress_structured',
    notes = 'v0.22.4 corrige el workflow para usar OpenSSL con UnsafeLegacyRenegotiation, curl -k, TLS 1.2 y CipherString DEFAULT:@SECLEVEL=0. Relanzar workflow y revisar tamaños de cache.',
    checked_at = now()
where id in (
  'v022-university-offers',
  'v022-university-grados-educabase',
  'v022-university-masteres-educabase',
  'v022-ciug'
);

select id, block, status, count_value, source_id, notes, checked_at
from public.itinera_integral_status
order by block;
