// ITINERA v0.17 · Supabase Edge Function: ItineraBot documental
// Secrets needed in Supabase:
// SUPABASE_URL
// SUPABASE_SERVICE_ROLE_KEY
// OPENAI_API_KEY
// ITINERA_OPENAI_MODEL, optional

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function normalise(value = "") {
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9ñ\s]/g, " ").replace(/\s+/g, " ").trim();
}
function sourceTitle(row: any) {
  return row?.title || row?.id || row?.url || "Fuente oficial";
}
function safePreview(text = "") {
  return String(text).slice(0, 350);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Use POST" }), { status: 405, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  const MODEL = Deno.env.get("ITINERA_OPENAI_MODEL") || "gpt-4.1-mini";

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ ok: false, error: "Supabase secrets are not configured" }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const { question = "", lang = "gl" } = await req.json().catch(() => ({}));
  const q = String(question).trim();
  if (!q) {
    return new Response(JSON.stringify({ ok: false, error: "Empty question" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const nq = normalise(q);

  const { data: studies } = await supabase.rpc("itinera_search_studies", {
    q,
    study_type: "all",
    study_family: "all",
    max_results: 10,
  });

  const terms = nq.split(/\s+/).filter((w) => w.length > 3).slice(0, 6);
  let docsQuery = supabase.from("itinera_official_documents").select("id,title,url,category,summary,content,source_id,checked_at").limit(10);
  if (terms.length) {
    const ors = terms.map((t) => `content.ilike.%${t}%,title.ilike.%${t}%`).join(",");
    docsQuery = docsQuery.or(ors);
  }
  const { data: docs } = await docsQuery;

  const sourceIds = new Set<string>();
  for (const s of studies || []) for (const id of (Array.isArray(s.sources) ? s.sources : [])) sourceIds.add(id);
  for (const d of docs || []) if (d.source_id) sourceIds.add(d.source_id);

  let sources: any[] = [];
  if (sourceIds.size) {
    const { data } = await supabase.from("itinera_sources").select("id,title,url,category,usefulness,jurisdiction,last_checked_at").in("id", [...sourceIds]);
    sources = data || [];
  } else {
    const { data } = await supabase.from("itinera_sources").select("id,title,url,category,usefulness,jurisdiction,last_checked_at").limit(12);
    sources = data || [];
  }

  const context = {
    question: q,
    language: lang,
    strict_rule: "Responde solo con el contexto oficial recuperado. No inventes notas, plazas, ponderaciones, centros ni requisitos. Si falta un dato, dilo y remite a fuentes oficiales.",
    studies: (studies || []).slice(0, 10),
    documents: (docs || []).slice(0, 10).map((d: any) => ({ ...d, content: String(d.content || "").slice(0, 4500) })),
    sources,
  };

  if (!OPENAI_API_KEY) {
    const fallback = [
      "ItineraBot documental aún no tiene activada la clave de IA en Supabase.",
      studies?.length ? `Coincidencias oficiales recuperadas: ${(studies || []).slice(0, 5).map((s: any) => s.name).join(", ")}.` : "No se ha recuperado una coincidencia cerrada.",
      sources?.length ? `Fuentes oficiales: ${sources.map(sourceTitle).join("; ")}.` : "Consulta TodoFP, Xunta FP, QEDU, RUCT o CIUG según el caso.",
    ].join("\n\n");
    await supabase.from("itinera_bot_logs").insert({ question: q, lang, answer_preview: safePreview(fallback), mode: "no_openai_key", sources });
    return new Response(JSON.stringify({ ok: true, answer: fallback, sources, mode: "no_openai_key" }), { headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const openAiBody = {
    model: MODEL,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: "Eres ItineraBot, asistente documental oficial de orientación académica. Tu tarea es ayudar a alumnado y familias con claridad, prudencia y trazabilidad. Responde solo desde el contexto oficial proporcionado. No inventes datos. Si el dato es cambiante, exige comprobar la convocatoria o fuente vigente. Cita al final las fuentes oficiales usadas por título, sin URLs en bruto salvo que sean necesarias." }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: `Idioma preferente: ${lang}\nPregunta: ${q}\nContexto oficial recuperado:\n${JSON.stringify(context, null, 2)}` }],
      },
    ],
    temperature: 0.12,
    max_output_tokens: 1200,
  };

  const aiRes = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "authorization": `Bearer ${OPENAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify(openAiBody),
  });

  if (!aiRes.ok) {
    const errorText = await aiRes.text().catch(() => "");
    const answer = `ItineraBot no pudo consultar la IA documental en este momento. No voy a inventar la respuesta. Revisa las fuentes oficiales enlazadas y vuelve a intentarlo. ${errorText.slice(0, 180)}`;
    await supabase.from("itinera_bot_logs").insert({ question: q, lang, answer_preview: safePreview(answer), mode: `openai_error_${aiRes.status}`, sources });
    return new Response(JSON.stringify({ ok: true, answer, sources, mode: `openai_error_${aiRes.status}` }), { headers: { ...corsHeaders, "content-type": "application/json" } });
  }

  const aiJson = await aiRes.json();
  const answer = aiJson.output_text || (aiJson.output || []).flatMap((item: any) => item.content || []).map((c: any) => c.text || "").join("\n").trim();

  await supabase.from("itinera_bot_logs").insert({ question: q, lang, answer_preview: safePreview(answer), mode: "supabase_edge_openai_responses", sources });

  return new Response(JSON.stringify({ ok: true, answer, sources, studies: studies || [], mode: "supabase_edge_openai_responses" }), {
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
});
