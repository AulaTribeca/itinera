
-- ITINERA v0.20 · Depuración FP y cobertura visible
-- Ejecutar en Supabase SQL Editor después de subir la versión.
-- Es idempotente y no borra datos.

-- Corregir URL oficial de TodoFP para FP de Grado Básico.
update public.itinera_sources
set url = 'https://www.todofp.es/que-estudiar/grados-d/fp-grado-basico.html',
    usefulness = coalesce(usefulness, 'Catálogo oficial de ciclos formativos de FP de Grado Básico.'),
    updated_at = now()
where id = 'todofp-gb';

update public.itinera_official_import_queue
set url = 'https://www.todofp.es/que-estudiar/grados-d/fp-grado-basico.html',
    last_status = 'url corrected in v0.20',
    updated_at = now()
where source_id = 'todofp-gb';

-- Backfill de familias profesionales para estudios ya importados con familia pendiente.
update public.itinera_studies set family = 'Electricidad y Electrónica', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%electric%' or normalized_name ilike '%electrotecn%' or normalized_name ilike '%telecomunic%' or normalized_name ilike '%automatiz%'
);

update public.itinera_studies set family = 'Fabricación Mecánica', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%soldadura%' or normalized_name ilike '%caldereria%' or normalized_name ilike '%mecanizado%' or normalized_name ilike '%fabricacion mecanica%' or normalized_name ilike '%construcciones metalicas%'
);

update public.itinera_studies set family = 'Madera, Mueble y Corcho', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%carpinter%' or normalized_name ilike '%mueble%' or normalized_name ilike '%madera%' or normalized_name ilike '%corcho%'
);

update public.itinera_studies set family = 'Sanidad', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%emergencias sanitarias%' or normalized_name ilike '%cuidados auxiliares%' or normalized_name ilike '%farmacia%' or normalized_name ilike '%parafarmacia%' or normalized_name ilike '%higiene bucodental%' or normalized_name ilike '%laboratorio clinico%' or normalized_name ilike '%imagen para el diagnostico%' or normalized_name ilike '%anatomia patologica%'
);

update public.itinera_studies set family = 'Servicios Socioculturales y a la Comunidad', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%educacion infantil%' or normalized_name ilike '%integracion social%' or normalized_name ilike '%atencion a personas%' or normalized_name ilike '%mediacion comunicativa%' or normalized_name ilike '%animacion sociocultural%' or normalized_name ilike '%promocion de igualdad%'
);

update public.itinera_studies set family = 'Informática y Comunicaciones', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%informatica%' or normalized_name ilike '%sistemas microinformaticos%' or normalized_name ilike '%desarrollo de aplicaciones%' or normalized_name ilike '%administracion de sistemas%' or normalized_name ilike '%ciberseguridad%' or normalized_name ilike '%big data%'
);

update public.itinera_studies set family = 'Administración y Gestión', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%administracion%' or normalized_name ilike '%gestion administrativa%' or normalized_name ilike '%finanzas%' or normalized_name ilike '%asistencia a la direccion%'
);

update public.itinera_studies set family = 'Comercio y Marketing', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%comercio%' or normalized_name ilike '%marketing%' or normalized_name ilike '%ventas%' or normalized_name ilike '%logistica%'
);

update public.itinera_studies set family = 'Hostelería y Turismo', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%cocina%' or normalized_name ilike '%gastronomia%' or normalized_name ilike '%restauracion%' or normalized_name ilike '%alojamientos%' or normalized_name ilike '%turismo%' or normalized_name ilike '%agencias de viajes%'
);

update public.itinera_studies set family = 'Imagen Personal', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%estetica%' or normalized_name ilike '%peluqueria%' or normalized_name ilike '%cosmetica%' or normalized_name ilike '%caracterizacion%' or normalized_name ilike '%asesoria de imagen%'
);

update public.itinera_studies set family = 'Transporte y Mantenimiento de Vehículos', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%automocion%' or normalized_name ilike '%vehiculos%' or normalized_name ilike '%carroceria%' or normalized_name ilike '%electromecanica%' or normalized_name ilike '%aeromecanica%' or normalized_name ilike '%avionica%'
);

update public.itinera_studies set family = 'Instalación y Mantenimiento', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%instalaciones frigorificas%' or normalized_name ilike '%climatizacion%' or normalized_name ilike '%produccion de calor%' or normalized_name ilike '%mantenimiento industrial%' or normalized_name ilike '%mecatronica%'
);

update public.itinera_studies set family = 'Agraria', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%agropecuaria%' or normalized_name ilike '%jardineria%' or normalized_name ilike '%floristeria%' or normalized_name ilike '%forestal%' or normalized_name ilike '%paisajismo%' or normalized_name ilike '%ganaderia%'
);

update public.itinera_studies set family = 'Actividades Físicas y Deportivas', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%acondicionamiento fisico%' or normalized_name ilike '%animacion sociodeportiva%' or normalized_name ilike '%medio natural%' or normalized_name ilike '%instalaciones deportivas%'
);

update public.itinera_studies set family = 'Edificación y Obra Civil', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%construccion%' or normalized_name ilike '%obra civil%' or normalized_name ilike '%edificacion%' or normalized_name ilike '%obras%'
);

update public.itinera_studies set family = 'Energía y Agua', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%energia%' or normalized_name ilike '%agua%' or normalized_name ilike '%eficiencia energetica%' or normalized_name ilike '%energias renovables%'
);

update public.itinera_studies set family = 'Imagen y Sonido', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%audiovisuales%' or normalized_name ilike '%sonido%' or normalized_name ilike '%iluminacion%' or normalized_name ilike '%animaciones 3d%' or normalized_name ilike '%realizacion%'
);

update public.itinera_studies set family = 'Química', updated_at = now()
where family ilike '%pendiente%' and (
  normalized_name ilike '%quimica%' or normalized_name ilike '%laboratorio%' or normalized_name ilike '%planta quimica%' or normalized_name ilike '%productos farmaceuticos%'
);

-- Cobertura actualizada para mostrar a la usuaria/alumnado qué está completo y qué no.
insert into public.itinera_source_coverage(scope, current_status, last_checked_at, notes)
values
('FP · Grado medio', 'imported_needs_review', now(), 'Carga amplia desde TodoFP. Familias mejoradas en v0.20. Comprobar oferta concreta por curso en Xunta FP.'),
('FP · Grado superior', 'imported_needs_review', now(), 'Carga amplia desde TodoFP. Familias mejoradas en v0.20. Comprobar oferta concreta por curso en Xunta FP.'),
('FP · Grado básico', 'in_progress', now(), 'URL oficial corregida en v0.20. Requiere nueva ejecución del workflow.'),
('FP · Cursos de especialización', 'in_progress', now(), 'Pendiente de extracción fina desde TodoFP Grados E.'),
('Universidad · Grados', 'pending', now(), 'Pendiente de carga estructurada desde RUCT/QEDU.'),
('Universidad · Másteres habilitantes', 'pending', now(), 'Pendiente de carga estructurada desde RUCT/QEDU y normativa de profesiones reguladas.'),
('Galicia · Ponderaciones y notas CIUG', 'pending', now(), 'Pendiente de conector específico o carga manual revisada desde CIUG.'),
('Galicia · Oferta por centros FP', 'pending', now(), 'Pendiente de conector específico desde Xunta FP y/o datos abiertos.')
on conflict (scope) do update set
current_status = excluded.current_status,
last_checked_at = excluded.last_checked_at,
notes = excluded.notes;

-- Añadir alias útiles frecuentes para búsqueda con errores o términos cotidianos.
insert into public.itinera_study_aliases(study_id, alias, alias_type)
select id, 'carpinteria', 'common-typo'
from public.itinera_studies
where normalized_name ilike '%carpinter%' or family = 'Madera, Mueble y Corcho'
on conflict (study_id, normalized_alias) do nothing;

insert into public.itinera_study_aliases(study_id, alias, alias_type)
select id, 'crapinteria', 'common-typo'
from public.itinera_studies
where normalized_name ilike '%carpinter%' or family = 'Madera, Mueble y Corcho'
on conflict (study_id, normalized_alias) do nothing;

insert into public.itinera_study_aliases(study_id, alias, alias_type)
select id, 'soldador', 'common-keyword'
from public.itinera_studies
where normalized_name ilike '%soldadura%' or family = 'Fabricación Mecánica'
on conflict (study_id, normalized_alias) do nothing;

insert into public.itinera_study_aliases(study_id, alias, alias_type)
select id, 'electricidad', 'common-keyword'
from public.itinera_studies
where family = 'Electricidad y Electrónica'
on conflict (study_id, normalized_alias) do nothing;

select
  (select count(*) from public.itinera_studies) as studies,
  (select count(*) from public.itinera_study_aliases) as aliases,
  (select count(*) from public.itinera_sources) as sources,
  (select count(*) from public.itinera_official_documents) as official_documents,
  (select count(*) from public.itinera_source_coverage) as source_coverage,
  (select count(*) from public.itinera_studies where family ilike '%pendiente%') as studies_pending_family;
