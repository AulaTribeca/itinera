import { readFileSync } from 'node:fs';
import { getSupabase, hasSupabase, normalise } from './_lib/supabase.mjs';

const seed = JSON.parse(readFileSync(new URL('../../data/studies.seed.json', import.meta.url), 'utf8'));

function seedSources(ids = []) {
  const set = new Set(ids);
  return (seed.official_sources || []).filter((s) => set.has(s.id));
}

async function supabaseContext(question) {
  if (!hasSupabase()) return null;
  const supabase = getSupabase();
  const q = normalise(question);
  const [{ data: studies }, { data: docs }, { data: sources }] = await Promise.all([
    supabase.rpc('itinera_search_studies', { q: question, study_type: 'all', study_family: 'all', max_results: 8 }),
    supabase.from('itinera_official_documents').select('title,url,category,summary,content,source_id').or(`title.ilike.%${question}%,content.ilike.%${question}%`).limit(8),
    supabase.from('itinera_sources').select('id,title,url,category,usefulness').limit(50)
  ]);

  const likelySources = (sources || []).filter((s) => {
    const hay = normalise(`${s.title} ${s.category} ${s.usefulness}`);
    return q.split(/\s+/).some((word) => word.length > 3 && hay.includes(word));
  }).slice(0, 10);

  return {
    studies: studies || [],
    documents: (docs || []).map((d) => ({ ...d, content: (d.content || '').slice(0, 3500) })),
    sources: likelySources.length ? likelySources : (sources || []).slice(0, 10)
  };
}

function fallbackContext(question) {
  const q = normalise(question);
  const relevantStudies = (seed.studies || []).filter((s) => normalise([s.name, s.family, s.level, ...(s.keywords || [])].join(' ')).split(' ').some((w) => q.includes(w) && w.length > 3)).slice(0, 8);
  const ids = new Set();
  for (const s of relevantStudies) (s.sources || []).forEach((x) => ids.add(x));
  if (q.includes('fp') || q.includes('ciclo')) ['todofp', 'xunta-fp-oferta', 'xunta-fp-ciclos', 'xunta-fp-centros'].forEach((x) => ids.add(x));
  if (q.includes('univers') || q.includes('grado') || q.includes('ruct') || q.includes('ects')) ['qedu', 'ruct', 'rd-822-2021'].forEach((x) => ids.add(x));
  if (q.includes('ponder') || q.includes('nota')) ['ciug-admision', 'ciug-ponderaciones-2026'].forEach((x) => ids.add(x));
  if (!ids.size) ['todofp', 'xunta-fp-oferta', 'qedu', 'ruct', 'ciug-admision'].forEach((x) => ids.add(x));

  return {
    studies: relevantStudies,
    documents: [],
    sources: seedSources([...ids])
  };
}

function safeAnswerWithoutOpenAI(question, context) {
  const sourceList = (context.sources || []).map((s) => `${s.title}: ${s.url}`).join('\n');
  const studies = (context.studies || []).slice(0, 5).map((s) => `- ${s.name} (${s.level || s.type}${s.family ? `, ${s.family}` : ''})`).join('\n');

  return [
    'No tengo activado todavía el modo IA documental con OPENAI_API_KEY. Puedo orientarte con la base oficial incorporada, pero no generaré una respuesta abierta sin ese backend.',
    studies ? `Coincidencias encontradas:\n${studies}` : 'No he encontrado una ficha cerrada suficientemente precisa en la base incorporada.',
    `Fuentes oficiales para comprobar el dato:\n${sourceList}`
  ].join('\n\n');
}

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Use POST' }), { status: 405, headers: { 'content-type': 'application/json' } });
  }

  const { question = '', lang = 'gl' } = await request.json().catch(() => ({}));
  const context = await supabaseContext(question).catch(() => null) || fallbackContext(question);

  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({
      ok: true,
      answer: safeAnswerWithoutOpenAI(question, context),
      sources: context.sources || [],
      mode: 'documentary-fallback-no-openai'
    }), { headers: { 'content-type': 'application/json; charset=utf-8' } });
  }

  const body = {
    model: process.env.ITINERA_OPENAI_MODEL || 'gpt-4.1-mini',
    input: [
      {
        role: 'system',
        content: [
          {
            type: 'input_text',
            text:
              'Eres ItineraBot, asistente documental de orientación académica. Responde únicamente con el contexto oficial proporcionado. No uses conocimiento externo salvo para razonar de forma general. No inventes notas de corte, plazas, ponderaciones ni centros. Si falta un dato, di que no consta en la base oficial incorporada y remite a la fuente oficial concreta. Responde en el idioma solicitado cuando sea posible. Sé claro, útil y prudente.'
          }
        ]
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Idioma: ${lang}\nPregunta: ${question}\n\nContexto oficial recuperado:\n${JSON.stringify(context, null, 2)}`
          }
        ]
      }
    ],
    temperature: 0.15,
    max_output_tokens: 1100
  };

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    return new Response(JSON.stringify({
      ok: true,
      answer: safeAnswerWithoutOpenAI(question, context),
      sources: context.sources || [],
      mode: `openai-error-${res.status}-fallback`
    }), { headers: { 'content-type': 'application/json; charset=utf-8' } });
  }

  const json = await res.json();
  const answer =
    json.output_text ||
    (json.output || []).flatMap((item) => item.content || []).map((c) => c.text || '').join('\n').trim();

  return new Response(JSON.stringify({
    ok: true,
    answer,
    sources: context.sources || [],
    studies: context.studies || [],
    mode: hasSupabase() ? 'supabase-rag' : 'seed-rag'
  }), { headers: { 'content-type': 'application/json; charset=utf-8' } });
};
