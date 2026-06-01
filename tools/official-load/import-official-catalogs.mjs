import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { readFileSync } from 'node:fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: WebSocket }
});

const seed = JSON.parse(readFileSync(new URL('../../data/studies.seed.json', import.meta.url), 'utf8'));

const FP_LEVEL = {
  'todofp-gb': { type: 'fpb', level: 'Ciclo formativo de grado básico', prefix: 'Título Profesional Básico en' },
  'todofp-gm': { type: 'fpgm', level: 'Ciclo formativo de grado medio', prefix: 'Técnico en' },
  'todofp-gs': { type: 'fpgs', level: 'Ciclo formativo de grado superior', prefix: 'Técnico Superior en' },
  'todofp-especializacion': { type: 'curso-especializacion-fp', level: 'Curso de especialización de Formación Profesional', prefix: 'Curso de especialización en' }
};

function normalise(value = '') {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
function slugify(value = '') {
  return normalise(value).replace(/ñ/g, 'n').replace(/\s+/g, '-').replace(/^-+|-+$/g, '').slice(0, 150);
}
function decodeHtml(value = '') {
  return String(value)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&aacute;/gi, 'á').replace(/&eacute;/gi, 'é').replace(/&iacute;/gi, 'í').replace(/&oacute;/gi, 'ó').replace(/&uacute;/gi, 'ú')
    .replace(/&ntilde;/gi, 'ñ').replace(/&uuml;/gi, 'ü')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function cleanTitle(title = '') {
  return decodeHtml(title)
    .replace(/\s+(Real decreto|Currículo|Modificación|Actualización|Ficha|Ver).*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function inferFamily(text = '') {
  const families = [
    'Actividades Físicas y Deportivas','Administración y Gestión','Agraria','Artes Gráficas','Artes y Artesanías',
    'Comercio y Marketing','Edificación y Obra Civil','Electricidad y Electrónica','Energía y Agua','Fabricación Mecánica',
    'Hostelería y Turismo','Imagen Personal','Imagen y Sonido','Industrias Alimentarias','Industrias Extractivas',
    'Informática y Comunicaciones','Instalación y Mantenimiento','Madera, Mueble y Corcho','Marítimo-Pesquera','Química',
    'Sanidad','Seguridad y Medio Ambiente','Servicios Socioculturales y a la Comunidad','Textil, Confección y Piel',
    'Transporte y Mantenimiento de Vehículos','Vidrio y Cerámica'
  ];
  const n = normalise(text);
  return families.find(f => n.includes(normalise(f))) || 'Familia profesional pendiente de revisión';
}
function aliasesFor(name = '', keywords = []) {
  const base = name.replace(/^Técnico Superior en\s+/i, '').replace(/^Técnico en\s+/i, '').replace(/^Título Profesional Básico en\s+/i, '').replace(/^Curso de especialización en\s+/i, '').trim();
  const values = new Set([name, base, ...keywords]);
  for (const part of base.split(/\s+y\s+|\s+e\s+|,|\//i)) {
    const p = part.trim();
    if (p.length >= 4) values.add(p);
  }
  return [...values].filter(Boolean);
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'ITINERA official catalog loader/0.19 (+official sources only)',
      accept: 'text/html,application/xhtml+xml,text/plain,*/*;q=0.8'
    }
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

function parseTodoFpTitles(html, sourceId, url) {
  const cfg = FP_LEVEL[sourceId];
  const titles = new Set();
  const patterns = [
    />(\s*(?:Técnico(?:\s+Superior)?\s+en|Título Profesional Básico en|Curso de especialización en)\s+[^<]{4,180})</gi,
    /((?:Técnico(?:\s+Superior)?\s+en|Título Profesional Básico en|Curso de especialización en)\s+[^\n<]{4,180})/gi
  ];
  for (const rx of patterns) {
    for (const m of html.matchAll(rx)) {
      const title = cleanTitle(m[1]);
      if (title.length > 8 && !/imagen|logotipo|título logse|currículos/i.test(title)) titles.add(title);
    }
  }
  return [...titles].map(name => {
    const idx = html.indexOf(name);
    const around = idx >= 0 ? html.slice(Math.max(0, idx - 700), idx + 700) : html;
    return {
      id: `${cfg.type}-${slugify(name)}`,
      name,
      type: cfg.type,
      level: cfg.level,
      family: inferFamily(around),
      branch: 'Formación Profesional',
      official_title: true,
      route: cfg.type === 'fpgm'
        ? `ESO con título u otro requisito válido → ${name}. Si no se cumple requisito ordinario, revisar prueba de acceso a grado medio.`
        : cfg.type === 'fpgs'
          ? `Bachillerato, FP de grado medio u otro requisito válido → ${name}. Si no se cumple requisito ordinario, revisar prueba de acceso a grado superior.`
          : `Consultar requisitos oficiales de acceso para ${name}.`,
      regulated: cfg.type === 'curso-especializacion-fp' ? 'Formación de especialización de FP. Consultar requisitos específicos.' : 'Titulación de Formación Profesional. No requiere máster habilitante.',
      demand: 'Dato cambiante. Consultar empleabilidad, oferta territorial, plazas y tejido productivo en fuentes oficiales actualizadas.',
      labour: 'Consultar competencia general, módulos, salidas y currículo en TodoFP y administración educativa correspondiente.',
      subjects: [],
      ponderation_subjects: [],
      route_options: [],
      availability_by_province: { Galicia: ['Consultar oferta oficial de FP Xunta por curso, modalidad, régimen, localidad y centro.'] },
      sources: [sourceId, 'todofp-familias', 'xunta-fp-oferta', 'xunta-fp-centros'],
      source_url: url,
      source_id: sourceId,
      raw: { imported_from: url, parser: 'todofp-title-parser-v0.17' },
      data_quality: 'imported_needs_review',
      verified_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString()
    };
  });
}

async function upsertRows(table, rows, conflict = 'id') {
  if (!rows.length) return { count: 0 };
  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflict });
  if (error) throw error;
  return { count: rows.length };
}
async function upsertAliases(studies) {
  const seen = new Set();
  const rows = [];
  for (const s of studies) {
    for (const alias of aliasesFor(s.name, s.keywords || [])) {
      const key = `${s.id}|${normalise(alias)}`;
      if (!seen.has(key)) {
        seen.add(key);
        rows.push({ study_id: s.id, alias, alias_type: s.data_quality?.startsWith('seed') ? 'seed' : 'official-import' });
      }
    }
  }
  return upsertRows('itinera_study_aliases', rows, 'study_id,normalized_alias');
}
async function upsertDocument(source, fetched) {
  const content = decodeHtml(fetched.text).slice(0, 60000);
  return upsertRows('itinera_official_documents', [{
    id: `${source.source_id}-${slugify(source.url)}`,
    source_id: source.source_id,
    title: source.notes || source.url,
    url: source.url,
    category: source.kind || 'document',
    content,
    summary: content.slice(0, 1200),
    metadata: { status: fetched.status, imported_at: new Date().toISOString(), parser: 'document-text-v0.17' },
    checked_at: new Date().toISOString()
  }]);
}
async function loadSeed() {
  const studies = (seed.studies || []).map(s => ({
    id: s.id, name: s.name, type: s.type, level: s.level, family: s.family, branch: s.branch || null,
    official_title: true, route: s.route || '', regulated: s.regulated || '', demand: s.demand || '', labour: s.labour || '',
    subjects: s.subjects || [], ponderation_subjects: s.ponderation_subjects || [], route_options: s.route_options || [],
    availability_by_province: s.availability_by_province || {}, sources: s.sources || [], source_url: s.source_url || null, source_id: s.source_id || null,
    raw: s, data_quality: 'seed_v0_17', verified_at: new Date().toISOString(), last_seen_at: new Date().toISOString()
  }));
  await upsertRows('itinera_studies', studies);
  await upsertAliases(studies);
  return studies.length;
}

async function main() {
  const mode = process.argv.includes('--seed-only') ? 'seed-only' : 'official';
  const report = { started_at: new Date().toISOString(), mode, seed: 0, sources: [] };
  report.seed = await loadSeed();
  if (mode === 'seed-only') return report;

  const { data: queue, error } = await supabase
    .from('itinera_official_import_queue')
    .select('*')
    .eq('enabled', true)
    .order('priority', { ascending: true });
  if (error) throw error;

  for (const source of queue || []) {
    try {
      const fetched = await fetchText(source.url);
      await supabase.from('itinera_sources').update({ last_checked_at: new Date().toISOString(), last_status: fetched.status }).eq('id', source.source_id);

      let studies = [];
      let documentSaved = false;

      if (!fetched.ok) {
        await supabase.from('itinera_official_import_queue').update({
          last_attempt_at: new Date().toISOString(),
          last_status: `http ${fetched.status}; skipped`
        }).eq('id', source.id);
        report.sources.push({ source_id: source.source_id, url: source.url, status: fetched.status, studies: 0, ok: false, warning: `HTTP ${fetched.status}` });
        continue;
      }

      try {
        await upsertDocument(source, fetched);
        documentSaved = true;
      } catch (docError) {
        report.sources.push({ source_id: source.source_id, url: source.url, status: fetched.status, studies: 0, ok: false, warning: `document save failed: ${String(docError.message || docError)}` });
      }

      if (source.kind === 'fp_catalog' && FP_LEVEL[source.source_id]) {
        studies = parseTodoFpTitles(fetched.text, source.source_id, source.url);
        if (studies.length) {
          await upsertRows('itinera_studies', studies);
          await upsertAliases(studies);
        }
      }

      await supabase.from('itinera_official_import_queue').update({
        last_attempt_at: new Date().toISOString(),
        last_status: `ok ${fetched.status}; studies=${studies.length}; document=${documentSaved ? 'yes' : 'no'}`
      }).eq('id', source.id);

      report.sources.push({ source_id: source.source_id, url: source.url, status: fetched.status, studies: studies.length, document: documentSaved, ok: true });
    } catch (error) {
      await supabase.from('itinera_official_import_queue').update({
        last_attempt_at: new Date().toISOString(),
        last_status: `warning: ${String(error.message || error).slice(0, 300)}`
      }).eq('id', source.id);
      report.sources.push({ source_id: source.source_id, url: source.url, ok: false, warning: String(error.message || error) });
    }
  }
  report.finished_at = new Date().toISOString();
  report.summary = {
    total_sources: report.sources.length,
    successful_sources: report.sources.filter(s => s.ok).length,
    warning_sources: report.sources.filter(s => !s.ok).length,
    studies_detected: report.sources.reduce((sum, s) => sum + Number(s.studies || 0), 0),
    documents_detected: report.sources.filter(s => s.document).length
  };
  return report;
}

main()
  .then(report => {
    console.log(JSON.stringify(report, null, 2));
    const studiesDetected = Number(report.summary?.studies_detected || 0);
    const successfulSources = Number(report.summary?.successful_sources || 0);
    if (!successfulSources) {
      console.error('ITINERA importer failed: no official source could be processed.');
      process.exitCode = 2;
      return;
    }
    if (studiesDetected < 1) {
      console.warn('ITINERA importer completed with warnings: no new studies were detected, but documents/sources may have been refreshed.');
    }
    if (report.summary?.warning_sources) {
      console.warn(`ITINERA importer completed with ${report.summary.warning_sources} non-fatal warning(s).`);
    }
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
