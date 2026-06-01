import { getSupabase, hasSupabase } from './_lib/supabase.mjs';

export default async () => {
  if (!hasSupabase()) {
    return new Response(JSON.stringify({ ok: false, configured: false, error: 'Supabase is not configured.' }), {
      status: 503,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }

  const supabase = getSupabase();

  const [studies, sources, runs, docs] = await Promise.all([
    supabase.from('itinera_studies').select('type, family, data_quality', { count: 'exact', head: false }).limit(10000),
    supabase.from('itinera_sources').select('*').order('category'),
    supabase.from('itinera_ingestion_runs').select('*').order('started_at', { ascending: false }).limit(10),
    supabase.from('itinera_official_documents').select('category', { count: 'exact', head: false }).limit(1000)
  ]);

  if (studies.error || sources.error || runs.error || docs.error) {
    return new Response(JSON.stringify({ ok: false, errors: [studies.error, sources.error, runs.error, docs.error].filter(Boolean) }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }

  const byType = {};
  const byFamily = {};
  const quality = {};
  for (const row of studies.data || []) {
    byType[row.type || 'sin tipo'] = (byType[row.type || 'sin tipo'] || 0) + 1;
    byFamily[row.family || 'sin familia'] = (byFamily[row.family || 'sin familia'] || 0) + 1;
    quality[row.data_quality || 'sin calidad'] = (quality[row.data_quality || 'sin calidad'] || 0) + 1;
  }

  return new Response(JSON.stringify({
    ok: true,
    configured: true,
    totals: {
      studies: studies.count ?? studies.data?.length ?? 0,
      sources: sources.data?.length ?? 0,
      documents: docs.count ?? docs.data?.length ?? 0
    },
    by_type: byType,
    by_family: byFamily,
    data_quality: quality,
    latest_runs: runs.data || [],
    sources: sources.data || []
  }, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
};
