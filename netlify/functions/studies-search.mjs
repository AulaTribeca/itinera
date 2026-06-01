import { readFileSync } from 'node:fs';
import { getStore } from '@netlify/blobs';
import { getSupabase, hasSupabase, normalise } from './_lib/supabase.mjs';

const seed = JSON.parse(readFileSync(new URL('../../data/studies.seed.json', import.meta.url), 'utf8'));

function lev(a, b) {
  a = normalise(a); b = normalise(b);
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return dp[a.length][b.length];
}
function similarity(a, b) {
  a = normalise(a); b = normalise(b);
  if (!a || !b) return 0;
  if (a.includes(b) || b.includes(a)) return 1;
  return 1 - lev(a, b) / Math.max(a.length, b.length);
}
function seedScore(program, q) {
  const fields = [program.name, program.family, program.level, ...(program.keywords || [])];
  if (!q) return 0.55;
  return Math.max(...fields.map((x) => similarity(q, x)));
}
function seedSearch(q, type, family, limit) {
  return (seed.studies || [])
    .map((p) => {
      let score = seedScore(p, q);
      if (type !== 'all' && p.type !== type) score -= 0.55;
      if (family !== 'all' && normalise(p.family) !== normalise(family)) score -= 0.35;
      if (!q && (type !== 'all' || family !== 'all')) score += 0.4;
      return { ...p, score, data_source: 'seed' };
    })
    .filter((p) => (q ? p.score > 0.28 : p.score > 0))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

async function blobFallback() {
  try {
    const store = getStore('itinera-official-cache');
    const cached = await store.get('studies-latest', { type: 'json' });
    if (cached?.studies?.length) return cached;
  } catch (error) {}
  return seed;
}

export default async (request) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const type = url.searchParams.get('type') || 'all';
  const family = url.searchParams.get('family') || 'all';
  const limit = Number(url.searchParams.get('limit') || 40);

  if (hasSupabase()) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.rpc('itinera_search_studies', {
        q,
        study_type: type,
        study_family: family,
        max_results: Math.min(Math.max(limit, 1), 100)
      });
      if (error) throw error;
      const results = (data || []).map((p) => ({
        ...p,
        keywords: [],
        score: p.score ?? 0,
        data_source: 'supabase'
      }));
      return new Response(JSON.stringify({
        ok: true,
        source_mode: 'supabase',
        updated_at: new Date().toISOString(),
        results,
        official_fallbacks: [
          { title: 'TodoFP', url: 'https://www.todofp.es/que-estudiar.html' },
          { title: 'Xunta FP oferta', url: 'https://www.edu.xunta.gal/fp/oferta-fp' },
          { title: 'QEDU', url: 'https://www.ciencia.gob.es/qedu' },
          { title: 'RUCT', url: 'https://universidades.sede.gob.es/pagina/index/directorio/Proc_Ruct' },
          { title: 'CIUG admisión', url: 'https://www.ciug.gal/admision-sug' }
        ]
      }), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' } });
    } catch (error) {
      // Falls through to seed fallback so the app remains usable.
    }
  }

  const data = await blobFallback();
  const sourceStudies = data.studies?.length ? data.studies : seed.studies;
  const oldSeed = { ...seed, studies: sourceStudies };
  const results = (oldSeed.studies || [])
    .map((p) => {
      let score = seedScore(p, q);
      if (type !== 'all' && p.type !== type) score -= 0.55;
      if (family !== 'all' && normalise(p.family) !== normalise(family)) score -= 0.35;
      if (!q && (type !== 'all' || family !== 'all')) score += 0.4;
      return { ...p, score, data_source: 'seed-fallback' };
    })
    .filter((p) => (q ? p.score > 0.28 : p.score > 0))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);

  return new Response(JSON.stringify({
    ok: true,
    source_mode: 'seed-fallback',
    updated_at: data.last_updated_at || data.last_updated,
    results,
    official_fallbacks: [
      { title: 'TodoFP', url: 'https://www.todofp.es/que-estudiar.html' },
      { title: 'Xunta FP oferta', url: 'https://www.edu.xunta.gal/fp/oferta-fp' },
      { title: 'QEDU', url: 'https://www.ciencia.gob.es/qedu' },
      { title: 'RUCT', url: 'https://universidades.sede.gob.es/pagina/index/directorio/Proc_Ruct' },
      { title: 'CIUG admisión', url: 'https://www.ciug.gal/admision-sug' }
    ]
  }), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' } });
};
