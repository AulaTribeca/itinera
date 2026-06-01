import { readFileSync } from 'node:fs';
import { getSupabase, hasSupabase, slugify, normalise, unique } from './_lib/supabase.mjs';

const seed = JSON.parse(readFileSync(new URL('../../data/studies.seed.json', import.meta.url), 'utf8'));

const OFFICIAL_IMPORTS = {
  'todofp-gm': {
    source_id: 'todofp-catalogo',
    url: 'https://www.todofp.es/que-estudiar/grados-d/grado-medio.html',
    type: 'fpgm',
    level: 'Ciclo formativo de grado medio',
    category: 'fp'
  },
  'todofp-gs': {
    source_id: 'todofp-catalogo',
    url: 'https://www.todofp.es/que-estudiar/grados-d/grado-superior.html',
    type: 'fpgs',
    level: 'Ciclo formativo de grado superior',
    category: 'fp'
  },
  'todofp-familias': {
    source_id: 'todofp-familias',
    url: 'https://www.todofp.es/que-estudiar/familias-profesionales.html',
    type: 'catalog',
    level: 'Catálogo de familias profesionales',
    category: 'fp'
  },
  'xunta-ciclos': {
    source_id: 'xunta-fp-ciclos',
    url: 'https://www.edu.xunta.gal/fp/ciclos',
    type: 'catalog',
    level: 'Ciclos FP con oferta sostenida con fondos públicos',
    category: 'fp'
  },
  'qedu-index': {
    source_id: 'qedu',
    url: 'https://www.ciencia.gob.es/qedu',
    type: 'catalog',
    level: 'Catálogo universitario',
    category: 'universidad'
  },
  'ruct-index': {
    source_id: 'ruct',
    url: 'https://universidades.sede.gob.es/pagina/index/directorio/Proc_Ruct',
    type: 'catalog',
    level: 'Registro oficial universitario',
    category: 'universidad'
  }
};

const FAMILY_NAMES = [
  'Actividades Físicas y Deportivas',
  'Administración y Gestión',
  'Agraria',
  'Artes Gráficas',
  'Artes y Artesanías',
  'Comercio y Marketing',
  'Edificación y Obra Civil',
  'Electricidad y Electrónica',
  'Energía y Agua',
  'Fabricación Mecánica',
  'Hostelería y Turismo',
  'Imagen Personal',
  'Imagen y Sonido',
  'Industrias Alimentarias',
  'Industrias Extractivas',
  'Informática y Comunicaciones',
  'Instalación y Mantenimiento',
  'Madera, Mueble y Corcho',
  'Marítimo-Pesquera',
  'Química',
  'Sanidad',
  'Seguridad y Medio Ambiente',
  'Servicios Socioculturales y a la Comunidad',
  'Textil, Confección y Piel',
  'Transporte y Mantenimiento de Vehículos',
  'Vidrio y Cerámica'
];

function decodeHtml(value = '') {
  return String(value)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í').replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú')
    .replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É').replace(/&Iacute;/g, 'Í').replace(/&Oacute;/g, 'Ó').replace(/&Uacute;/g, 'Ú')
    .replace(/&ntilde;/g, 'ñ').replace(/&Ntilde;/g, 'Ñ')
    .replace(/&uuml;/g, 'ü').replace(/&Uuml;/g, 'Ü')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferFamily(text = '') {
  const n = normalise(text);
  let best = '';
  for (const family of FAMILY_NAMES) {
    const nf = normalise(family);
    if (n.includes(nf)) best = family;
  }
  return best || null;
}

function titleAliases(title = '') {
  const base = title.replace(/^Técnico Superior en\s+/i, '').replace(/^Técnico en\s+/i, '').replace(/^Título Profesional Básico en\s+/i, '').trim();
  return unique([
    title,
    base,
    base.replace(/\sy\s/gi, ' '),
    base.replace(/\se\s/gi, ' '),
    ...base.split(/\s+y\s+|\s+e\s+|,|\//).map((x) => x.trim()).filter((x) => x.length > 3)
  ]);
}

function parseTodoFp(html, cfg) {
  const text = html.replace(/\r/g, '\n');
  const names = new Set();

  const titleRegex = /(Técnico(?:\s+Superior)?\s+en\s+[^<\n]{5,160})/gi;
  for (const match of text.matchAll(titleRegex)) {
    let title = decodeHtml(match[1]).replace(/\s+(Real decreto|Currículo|Modificación|Actualización).*$/i, '').trim();
    if (title.length > 5 && !/imagen|logotipo|título logse/i.test(title)) names.add(title);
  }

  const linkRegex = />(\s*Técnico(?:\s+Superior)?\s+en\s+[^<]{5,160})</gi;
  for (const match of html.matchAll(linkRegex)) {
    let title = decodeHtml(match[1]).replace(/\s+(Real decreto|Currículo|Modificación|Actualización).*$/i, '').trim();
    if (title.length > 5 && !/imagen|logotipo/i.test(title)) names.add(title);
  }

  return [...names].map((name) => ({
    id: `${cfg.type}-${slugify(name)}`,
    name,
    type: cfg.type,
    level: cfg.level,
    family: inferFamily(html.slice(Math.max(0, html.indexOf(name) - 400), html.indexOf(name) + 400)) || 'Familia profesional pendiente de revisión',
    branch: 'Formación Profesional',
    official_title: true,
    route:
      cfg.type === 'fpgm'
        ? `ESO con título u otro requisito válido → ${name}. Si no se cumple requisito ordinario, revisar prueba de acceso a grado medio.`
        : `Bachillerato, FP de grado medio u otro requisito válido → ${name}. Si no se cumple requisito ordinario, revisar prueba de acceso a grado superior.`,
    regulated: 'Titulación de Formación Profesional. No requiere máster habilitante.',
    demand: 'Consultar empleabilidad, oferta territorial y ocupaciones en fuentes oficiales actualizadas.',
    labour: 'Consultar perfil profesional, competencia general, módulos y salidas en TodoFP y, para Galicia, Xunta FP.',
    subjects: [],
    ponderation_subjects: [],
    route_options: [],
    availability_by_province: { Galicia: ['Consultar oferta oficial de FP Xunta por curso, modalidad, régimen, localidad y centro.'] },
    sources: ['todofp-catalogo', 'xunta-fp-oferta', 'xunta-fp-centros'],
    source_url: cfg.url,
    source_id: cfg.source_id,
    raw: { imported_from: cfg.url, parser: 'todofp-title-regex' },
    data_quality: 'imported_needs_review',
    verified_at: new Date().toISOString()
  }));
}

function parseCatalogDocument(html, cfg) {
  const content = decodeHtml(html).slice(0, 30000);
  return {
    document: {
      id: `${cfg.source_id}-${slugify(cfg.url)}`,
      source_id: cfg.source_id,
      title: cfg.level,
      url: cfg.url,
      category: cfg.category,
      content,
      summary: content.slice(0, 700),
      metadata: { parser: 'catalog-document', imported_at: new Date().toISOString() },
      checked_at: new Date().toISOString()
    },
    studies: []
  };
}

async function fetchOfficial(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'ITINERA official academic guidance importer/0.15',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

async function upsertStudies(supabase, studies) {
  if (!studies.length) return { inserted: 0, aliases: 0 };
  const { error } = await supabase.from('itinera_studies').upsert(studies, { onConflict: 'id' });
  if (error) throw error;

  const aliases = [];
  for (const study of studies) {
    for (const alias of titleAliases(study.name)) aliases.push({ study_id: study.id, alias, alias_type: 'official-import' });
  }
  if (aliases.length) {
    const { error: aliasError } = await supabase.from('itinera_study_aliases').upsert(aliases, { onConflict: 'study_id,normalized_alias' });
    if (aliasError) throw aliasError;
  }
  return { inserted: studies.length, aliases: aliases.length };
}

async function upsertSeed(supabase) {
  const studies = (seed.studies || []).map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    level: s.level,
    family: s.family,
    branch: s.branch || null,
    official_title: true,
    route: s.route || '',
    regulated: s.regulated || '',
    demand: s.demand || '',
    labour: s.labour || '',
    subjects: s.subjects || [],
    ponderation_subjects: s.ponderation_subjects || [],
    route_options: s.route_options || [],
    availability_by_province: s.availability_by_province || {},
    sources: s.sources || [],
    source_url: s.source_url || null,
    source_id: s.source_id || null,
    raw: s,
    data_quality: 'seed_verified_or_needs_review',
    verified_at: new Date().toISOString()
  }));
  const result = await upsertStudies(supabase, studies);

  const sourceRows = (seed.official_sources || []).map((s) => ({
    id: s.id,
    title: s.title,
    url: s.url,
    category: s.category || 'general',
    usefulness: s.use || s.usefulness || '',
    official: true,
    jurisdiction: s.jurisdiction || null
  }));
  if (sourceRows.length) {
    const { error } = await supabase.from('itinera_sources').upsert(sourceRows, { onConflict: 'id' });
    if (error) throw error;
  }

  const tables = [
    ['itinera_faq_items', (seed.faq || []).map((f, i) => ({ id: `faq-${slugify(f.q).slice(0, 90) || i}`, category: 'Orientación general', question: f.q, answer: f.a, sources: f.sources || [], priority: i + 1 }))],
    ['itinera_access_exams', (seed.access_exams || []).map((x) => ({ id: x.id, title: x.title, short: x.short, when_needed: x.when_needed, age: x.age, structure: x.structure || [], notes: x.notes || [], sources: x.sources || [] }))],
    ['itinera_scholarships', (seed.scholarships || []).map((x) => ({ id: x.id, title: x.title, summary: x.summary, period: x.period, sources: x.sources || [] }))],
    ['itinera_reservations', (seed.reservations || []).map((x) => ({ id: slugify(x.title), title: x.title, summary: x.summary, sources: x.sources || [] }))],
    ['itinera_convalidations', (seed.convalidations || []).map((x) => ({ id: x.id, title: x.title, summary: x.summary, details: x.details || [], sources: x.sources || [] }))]
  ];

  for (const [table, rows] of tables) {
    if (!rows.length) continue;
    const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  }

  return result;
}

export default async (request) => {
  if (!hasSupabase()) {
    return new Response(JSON.stringify({ ok: false, error: 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' }), {
      status: 503,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }

  const url = new URL(request.url);
  const mode = url.searchParams.get('mode') || 'seed+official';
  const requested = (url.searchParams.get('sources') || 'todofp-gm,todofp-gs,todofp-familias,xunta-ciclos,qedu-index,ruct-index')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

  const supabase = getSupabase({ service: true });
  const report = { ok: true, mode, started_at: new Date().toISOString(), sources: [], seed: null };

  try {
    if (mode.includes('seed')) {
      report.seed = await upsertSeed(supabase);
    }

    if (mode.includes('official')) {
      for (const key of requested) {
        const cfg = OFFICIAL_IMPORTS[key];
        if (!cfg) {
          report.sources.push({ key, ok: false, error: 'unknown source key' });
          continue;
        }

        const run = await supabase
          .from('itinera_ingestion_runs')
          .insert({ source_id: cfg.source_id, mode: key, status: 'running' })
          .select('id')
          .single();

        const runId = run.data?.id;
        try {
          const fetched = await fetchOfficial(cfg.url);
          await supabase.from('itinera_sources').update({
            last_checked_at: new Date().toISOString(),
            last_status: fetched.status
          }).eq('id', cfg.source_id);

          let studies = [];
          let doc = null;
          if (key === 'todofp-gm' || key === 'todofp-gs') studies = parseTodoFp(fetched.text, cfg);
          else {
            const parsed = parseCatalogDocument(fetched.text, cfg);
            doc = parsed.document;
          }

          const upsert = await upsertStudies(supabase, studies);
          if (doc) {
            const { error: docError } = await supabase.from('itinera_official_documents').upsert(doc, { onConflict: 'id' });
            if (docError) throw docError;
          }

          if (runId) await supabase.from('itinera_ingestion_runs').update({
            finished_at: new Date().toISOString(),
            ok: true,
            status: `completed ${fetched.status}`,
            inserted_count: upsert.inserted,
            updated_count: 0,
            error_count: 0
          }).eq('id', runId);

          report.sources.push({ key, url: cfg.url, ok: true, status: fetched.status, studies: upsert.inserted, document: Boolean(doc) });
        } catch (error) {
          if (runId) await supabase.from('itinera_ingestion_runs').update({
            finished_at: new Date().toISOString(),
            ok: false,
            status: 'failed',
            error_count: 1,
            notes: String(error?.message || error)
          }).eq('id', runId);
          report.sources.push({ key, url: cfg.url, ok: false, error: String(error?.message || error) });
        }
      }
    }

    report.finished_at = new Date().toISOString();
    return new Response(JSON.stringify(report, null, 2), {
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: String(error?.message || error), report }, null, 2), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }
};
