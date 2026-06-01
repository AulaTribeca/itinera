#!/usr/bin/env node
/*
 ITINERA v0.22 · macrointegral official loader.
 Ejecuta con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 El objetivo es cargar SOLO datos que puedan vincularse a fuente oficial.
 Cuando una fuente no ofrece datos estructurados directamente, se actualiza el estado y se conserva el enlace oficial.
*/

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/,'');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if(!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY){
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const HEADERS = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'content-type': 'application/json',
  prefer: 'resolution=merge-duplicates,return=minimal'
};

const SOURCES = {
  qedu: 'https://www.ciencia.gob.es/qedu',
  qeduHelp: 'https://www.ciencia.gob.es/qedu/AyudaQEDU.html',
  ruct: 'https://universidades.sede.gob.es/pagina/index/directorio/Proc_Ruct',

  // UNIVBASE/EDUCAbase 2024. Los enlaces exportables correctos del portal jaxiPx
  // no terminan en .px dentro de /csv_c/, sino en extensiones como .csv_bd, .csv_bdsc o .xlsx.
  gradoCandidates: [
    'https://estadisticas.ciencia.gob.es/jaxiPx/files/_px/es/csv_bd/Universitaria/EUCT/2024/Titulaciones/l0/Titulaciones_Grado_Rama_Univ.csv_bd',
    'https://estadisticas.ciencia.gob.es/jaxiPx/files/_px/es/csv_bdsc/Universitaria/EUCT/2024/Titulaciones/l0/Titulaciones_Grado_Rama_Univ.csv_bdsc',
    'https://estadisticas.ciencia.gob.es/jaxiPx/files/_px/es/xlsx/Universitaria/EUCT/2024/Titulaciones/l0/Titulaciones_Grado_Rama_Univ.xlsx',
    'https://estadisticas.ciencia.gob.es/jaxiPx/files/_px/es/px/Universitaria/EUCT/2024/Titulaciones/l0/Titulaciones_Grado_Rama_Univ.px'
  ],
  masterCandidates: [
    'https://estadisticas.ciencia.gob.es/jaxiPx/files/_px/es/csv_bd/Universitaria/EUCT/2024/Titulaciones/l0/Titulaciones_Master_Rama_Univ.csv_bd',
    'https://estadisticas.ciencia.gob.es/jaxiPx/files/_px/es/csv_bdsc/Universitaria/EUCT/2024/Titulaciones/l0/Titulaciones_Master_Rama_Univ.csv_bdsc',
    'https://estadisticas.ciencia.gob.es/jaxiPx/files/_px/es/xlsx/Universitaria/EUCT/2024/Titulaciones/l0/Titulaciones_Master_Rama_Univ.xlsx',
    'https://estadisticas.ciencia.gob.es/jaxiPx/files/_px/es/px/Universitaria/EUCT/2024/Titulaciones/l0/Titulaciones_Master_Rama_Univ.px'
  ],

  ciugAdmission: 'https://www.ciug.gal/admision-sug',
  ciugPonderations2026: 'https://ciug.gal/PDF/2026/Acceso/ponderacions_2026.pdf',
  ciugCutoffs2025: 'https://ciug.gal/PDF/2025/ACCESO/notas_de_corte_2025.pdf',
  ciugCutoffs3: 'https://ciug.gal/PDF/2025/ACCESO/notas_de_corte_3_ultimos_cursos.pdf',
  xuntaFpOffer: 'https://www.edu.xunta.gal/fp/oferta-fp',
  xuntaFpCycles: 'https://www.edu.xunta.gal/fp/ciclos',
  xuntaCentersCsv: 'https://abertos.xunta.gal/catalogo/ensino-formacion/-/dataset/0257/centros-educativos-galicia/005/descarga-directa-ficheiro.csv',
  todoFpSpecializations: 'https://www.todofp.es/que-estudiar/grados-e/curso-especializacion.html'
};

function slug(s=''){
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/&/g,' y ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,180) || 'sin-id';
}

function clean(s=''){ return String(s ?? '').replace(/\s+/g,' ').trim(); }

async function getText(url){
  const res = await fetch(url, {headers:{'user-agent':'ITINERA/0.22 academic-orientation'}});
  if(!res.ok) throw new Error(`Fetch ${res.status} ${url}`);
  return await res.text();
}

async function getFirstText(urls=[]){
  const errors = [];
  for(const url of urls){
    try{
      const text = await getText(url);
      if(text && text.trim().length > 20) return {url, text};
      errors.push(`${url}: empty`);
    }catch(e){
      errors.push(`${url}: ${e.message}`);
    }
  }
  throw new Error(errors.join(' | '));
}

async function getBytes(url){
  const res = await fetch(url, {
    headers:{
      'user-agent':'Mozilla/5.0 ITINERA/0.22.2 academic-orientation',
      'accept':'text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream,text/plain,*/*',
      'referer':'https://estadisticas.ciencia.gob.es/dynPx/inebase/index.htm'
    }
  });
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  if(!res.ok && buf.length < 50){
    throw new Error(`Fetch ${res.status} ${url}: ${buf.toString('utf8').slice(0,120)}`);
  }
  return {url, status:res.status, contentType:res.headers.get('content-type') || '', buffer:buf};
}

function decodeText(buffer){
  let text = buffer.toString('utf8');
  const bad = (text.match(/\uFFFD/g)||[]).length;
  if(bad > 10){
    try{ text = new TextDecoder('windows-1252').decode(buffer); }catch(e){}
  }
  return text.replace(/^\uFEFF/, '');
}

async function parseXlsx(buffer){
  const mod = await import('xlsx');
  const XLSX = mod.default || mod;
  const wb = XLSX.read(buffer, {type:'buffer'});
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, {defval:'', raw:false});
}

function parsePcAxis(text){
  // Fallback mínimo: extrae etiquetas de valores para que el estado no sea opaco.
  // Si no hay DATA tabular interpretable, devuelve [] y se usará otra distribución.
  if(!/DATA\s*=/i.test(text)) return [];
  const dims = {};
  const valuesRe = /VALUES\("([^"]+)"\)\s*=\s*([^;]+);/gi;
  let m;
  while((m=valuesRe.exec(text))){
    dims[m[1]] = (m[2].match(/"([^"]*)"/g)||[]).map(x=>x.slice(1,-1));
  }
  return Object.entries(dims).flatMap(([k,vals]) => vals.map(v => ({dimension:k, value:v})));
}

async function getFirstRecords(urls=[]){
  const errors = [];
  for(const url of urls){
    try{
      const r = await getBytes(url);
      let records = [];
      if(/\.xlsx($|\?)/i.test(url) || /spreadsheet/i.test(r.contentType)){
        records = await parseXlsx(r.buffer);
      }else{
        const text = decodeText(r.buffer);
        if(/\.px($|\?)/i.test(url)) records = parsePcAxis(text);
        else records = parseStatCsv(text);
      }
      if(records && records.length){
        return {url, records};
      }
      errors.push(`${url}: without parseable rows`);
    }catch(e){
      errors.push(`${url}: ${e.message}`);
    }
  }
  throw new Error(errors.join(' | '));
}

async function upsert(table, rows, conflict='id'){
  if(!rows?.length) return 0;
  const chunkSize = 500;
  let total = 0;
  for(let i=0;i<rows.length;i+=chunkSize){
    const chunk = rows.slice(i,i+chunkSize);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${encodeURIComponent(conflict)}`, {
      method:'POST',
      headers: HEADERS,
      body: JSON.stringify(chunk)
    });
    if(!res.ok){
      const text = await res.text().catch(()=> '');
      throw new Error(`Upsert failed ${table}: ${res.status} ${text}`);
    }
    total += chunk.length;
  }
  return total;
}

async function updateStatus(id, block, status, count_value, source_id, notes, metadata={}){
  await upsert('itinera_integral_status', [{
    id, block, status, count_value, source_id, notes, checked_at: new Date().toISOString(), metadata
  }]);
}

function parseCsv(text, delimiter=','){
  const rows=[]; let row=[]; let cell=''; let q=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i], next=text[i+1];
    if(q){
      if(ch === '"' && next === '"'){ cell+='"'; i++; }
      else if(ch === '"'){ q=false; }
      else cell+=ch;
    }else{
      if(ch === '"') q=true;
      else if(ch === delimiter){ row.push(cell); cell=''; }
      else if(ch === '\n'){ row.push(cell); rows.push(row); row=[]; cell=''; }
      else if(ch !== '\r') cell+=ch;
    }
  }
  if(cell || row.length){ row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => clean(c)));
}

function detectDelimiter(text){
  const sample = text.split(/\r?\n/).slice(0,5).join('\n');
  const counts = {',':(sample.match(/,/g)||[]).length, ';':(sample.match(/;/g)||[]).length, '\t':(sample.match(/\t/g)||[]).length};
  return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0];
}

function parseStatCsv(text){
  const delimiter = detectDelimiter(text);
  const rows = parseCsv(text, delimiter).map(r=>r.map(clean));
  // Busca la primera fila con cabeceras plausibles.
  let hIdx = rows.findIndex(r => r.some(c => /universidad/i.test(c)) && r.some(c => /rama|cr[eé]dito|periodo|curso|tipo/i.test(c)));
  if(hIdx < 0) hIdx = rows.findIndex(r => r.length >= 4);
  if(hIdx < 0) return [];
  const headers = rows[hIdx].map((h,i)=>h || `col_${i}`);
  return rows.slice(hIdx+1).filter(r => r.length >= 2).map(r => {
    const obj={};
    headers.forEach((h,i)=> obj[h]=clean(r[i] ?? ''));
    return obj;
  });
}

function field(row, names){
  const entries = Object.entries(row);
  for(const name of names){
    const norm = slug(name);
    const hit = entries.find(([k]) => slug(k).includes(norm) || norm.includes(slug(k)));
    if(hit) return hit[1];
  }
  return '';
}

function universityAggregateRows(records, level, sourceId, sourceUrl){
  const out=[];
  for(const r of records){
    const university = field(r, ['Universidad']);
    const branch = field(r, ['Rama de enseñanza','Rama']);
    const credits = field(r, ['Número de créditos del plan de estudio','Créditos','Numero de creditos']);
    const centerType = field(r, ['Tipo de centro']);
    const count = field(r, ['Total','Titulaciones','Número de titulaciones','Numero de titulaciones']);
    const year = field(r, ['Periodo','Curso','Año']) || '2023-2024';
    if(!university || /^total$/i.test(university)) continue;
    const title = `${level} · ${university}${branch ? ' · '+branch : ''}${credits ? ' · '+credits+' ECTS' : ''}`;
    out.push({
      id: `${level === 'Grado' ? 'grado' : 'master'}-${slug(university)}-${slug(branch)}-${slug(credits)}-${slug(centerType)}-${slug(year)}`,
      title,
      level,
      university,
      university_type: '',
      center: '',
      province: '',
      community: '',
      branch,
      field: '',
      credits,
      modality: '',
      cut_off_note: '',
      places: null,
      source_id: sourceId,
      source_url: sourceUrl,
      official: true,
      data_status: 'aggregate_official',
      notes: `Registro agregado EDUCAbase/SIIU. No sustituye la consulta título a título en QEDU/RUCT. Recuento original: ${count || 'no especificado'}.`,
      metadata: {raw:r, year, count}
    });
  }
  // dedupe
  return [...new Map(out.map(x=>[x.id,x])).values()];
}

function extractSpecializationRows(html){
  const text = html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ');
  const links = [];
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while((m = re.exec(html))){
    let url=m[1], label=clean(m[2].replace(/<[^>]+>/g,' '));
    if(!label || label.length < 4) continue;
    if(!/curso|especializaci|big data|ciberseguridad|comercio|seo|redacci|inteligencia|rob[oó]tica|digital/i.test(label)) continue;
    if(url.startsWith('/')) url='https://www.todofp.es'+url;
    if(!url.startsWith('http')) continue;
    links.push({url,label});
  }
  // También extrae líneas visibles del índice, por si las tarjetas no son enlaces normales.
  const visible = text.replace(/<[^>]+>/g,'\n').split(/\n+/).map(clean).filter(x =>
    x.length > 8 && x.length < 140 && /(Acceso G[MS]|Especializaci[oó]n|Big Data|Ciberseguridad|Comercio electr[oó]nico|Inteligencia Artificial|Rob[oó]tica|SEO|marketing|digital)/i.test(x)
  );
  const items = [...links, ...visible.map(label=>({label,url:SOURCES.todoFpSpecializations}))];
  const rows = items.map(x => ({
    id: `ce-${slug(x.label)}`,
    name: x.label,
    family: '',
    level: 'Curso de especialización de FP',
    access_type: /Acceso GS/i.test(x.label) ? 'Acceso desde grado superior' : (/Acceso GM/i.test(x.label) ? 'Acceso desde grado medio' : ''),
    duration: '',
    source_id: 'todofp-cursos-especializacion',
    source_url: x.url || SOURCES.todoFpSpecializations,
    data_status: 'imported_needs_review',
    metadata: {v:'0.22'}
  }));
  return [...new Map(rows.map(x=>[x.id,x])).values()];
}

async function importUniversityAggregates(){
  let total=0;
  let gradoCount=0;
  let masterCount=0;
  const errors=[];

  try{
    const {url, records} = await getFirstRecords(SOURCES.gradoCandidates);
    const rows = universityAggregateRows(records, 'Grado', 'educabase-grados-univ-2024', url);
    await upsert('itinera_university_offers', rows);
    gradoCount = rows.length;
    total += rows.length;
    await updateStatus('v022-university-grados-educabase', 'Universidad · Grados EDUCAbase/SIIU', rows.length ? 'imported_aggregate' : 'no_rows', rows.length, 'educabase-grados-univ-2024', `Carga agregada por universidad/rama/créditos desde ${url}. Para título concreto se mantiene verificación QEDU/RUCT.`, {sample: rows.slice(0,3), url});
  }catch(e){
    errors.push(`Grados: ${e.message}`);
    console.warn(e.message);
    await updateStatus('v022-university-grados-educabase', 'Universidad · Grados EDUCAbase/SIIU', 'fetch_failed', 0, 'educabase-grados-univ-2024', e.message);
  }

  try{
    const {url, records} = await getFirstRecords(SOURCES.masterCandidates);
    const rows = universityAggregateRows(records, 'Máster', 'educabase-masteres-univ-2024', url);
    await upsert('itinera_university_offers', rows);
    masterCount = rows.length;
    total += rows.length;
    await updateStatus('v022-university-masteres-educabase', 'Universidad · Másteres EDUCAbase/SIIU', rows.length ? 'imported_aggregate' : 'no_rows', rows.length, 'educabase-masteres-univ-2024', `Carga agregada por universidad/rama/créditos desde ${url}. Para título concreto se mantiene verificación QEDU/RUCT.`, {sample: rows.slice(0,3), url});
  }catch(e){
    errors.push(`Másteres: ${e.message}`);
    console.warn(e.message);
    await updateStatus('v022-university-masteres-educabase', 'Universidad · Másteres EDUCAbase/SIIU', 'fetch_failed', 0, 'educabase-masteres-univ-2024', e.message);
  }

  await updateStatus(
    'v022-university-offers',
    'Universidad estructurada',
    total ? 'imported_aggregate' : 'fetch_failed',
    total,
    'qedu-ayuda',
    total
      ? `Carga universitaria agregada realizada: ${gradoCount} registros de grado y ${masterCount} registros de máster. QEDU/RUCT siguen siendo verificación título a título.`
      : `No se cargaron registros universitarios. ${errors.join(' || ')}`,
    {gradoCount, masterCount, errors}
  );

  return total;
}

async function importFpSpecializations(){
  try{
    const html = await getText(SOURCES.todoFpSpecializations);
    const rows = extractSpecializationRows(html);
    await upsert('itinera_fp_specializations', rows);
    await updateStatus('v022-grados-e', 'FP cursos de especialización', rows.length ? 'imported_needs_review' : 'no_rows', rows.length, 'todofp-cursos-especializacion', 'Extracción automática desde índice TodoFP. Revisar familias, duración y requisitos título a título.', {sample: rows.slice(0,5)});
    await updateStatus('v022-grados-e-parent', 'FP cursos de especialización · resumen', rows.length ? 'imported_needs_review' : 'no_rows', rows.length, 'todofp-cursos-especializacion', 'Resumen v0.22.1 de cursos de especialización cargados.', {sample: rows.slice(0,3)});
    return rows.length;
  }catch(e){
    console.warn(e.message);
    await updateStatus('v022-grados-e', 'FP cursos de especialización', 'fetch_failed', 0, 'todofp-cursos-especializacion', e.message);
    return 0;
  }
}

async function importGaliciaCenters(){
  try{
    const text = await getText(SOURCES.xuntaCentersCsv);
    const delimiter = detectDelimiter(text);
    const rows = parseCsv(text, delimiter).map(r=>r.map(clean));
    if(rows.length < 2) throw new Error('CSV sin filas suficientes');
    const headers = rows[0];
    const objects = rows.slice(1).map(r => {
      const o={}; headers.forEach((h,i)=>o[h]=r[i]||''); return o;
    });
    const offers = objects
      .filter(o => JSON.stringify(o).toLowerCase().includes('fp'))
      .slice(0, 2000)
      .map(o => {
        const name = field(o, ['Nome','Nombre','Centro','Denominación']) || Object.values(o)[1] || 'Centro FP Galicia';
        const municipality = field(o, ['Concello','Municipio']);
        const province = field(o, ['Provincia']);
        const code = field(o, ['Código','Codigo','Cod centro']) || slug(name).slice(0,60);
        return {
          id: `centro-fp-galicia-${slug(code)}-${slug(name)}`,
          academic_year: '2025-2026',
          family: '',
          cycle_name: 'Oferta FP del centro pendiente de cruce con buscador Xunta FP',
          cycle_level: '',
          center_code: code,
          center_name: name,
          municipality,
          province,
          modality: '',
          regime: '',
          places: null,
          source_id: 'xunta-centros-educativos-csv',
          source_url: SOURCES.xuntaCentersCsv,
          data_status: 'center_imported_needs_offer_crosscheck',
          metadata: {raw:o, v:'0.22'}
        };
      });
    await upsert('itinera_fp_galicia_offer', offers);
    await updateStatus('v022-fp-galicia-centros', 'FP Galicia centros', offers.length ? 'centers_imported_needs_offer_crosscheck' : 'no_rows', offers.length, 'xunta-centros-educativos-csv', 'Centros con mención FP importados desde CSV de Datos Abertos. La oferta ciclo/centro debe cruzarse con Xunta FP.', {sample: offers.slice(0,3)});
    await updateStatus('v022-fp-galicia', 'Oferta FP Galicia', offers.length ? 'centers_imported_needs_offer_crosscheck' : 'no_rows', offers.length, 'xunta-centros-educativos-csv', 'Centros con mención FP importados desde CSV de Datos Abertos. La oferta ciclo/centro sigue pendiente de cruce fino con Xunta FP.', {sample: offers.slice(0,3)});
    return offers.length;
  }catch(e){
    console.warn(e.message);
    await updateStatus('v022-fp-galicia-centros', 'FP Galicia centros', 'fetch_failed', 0, 'xunta-centros-educativos-csv', e.message);
    return 0;
  }
}


async function pdfText(url){
  const r = await getBytes(url);
  const mod = await import('pdf-parse');
  const pdfParse = mod.default || mod;
  const data = await pdfParse(r.buffer);
  return {url, text:data.text || ''};
}

function parseCiugCutoffText(text, sourceUrl){
  const lines = text.split(/\n+/).map(clean).filter(Boolean);
  const rows = [];
  for(const line of lines){
    const m = line.match(/(\d{5})\s*-\s*(Grao[^0-9]+?)(?:\s+(Ext\.|Ord\.|N|\d|,|[0-9]).*)?$/i);
    if(!m) continue;
    const code = m[1];
    const degree = clean(m[2]);
    if(degree.length < 8) continue;
    const nums = [...line.matchAll(/(?:Ext\.|Ord\.)?\s*(?:N|[0-9]{1,2},[0-9]{3})/g)].map(x=>clean(x[0]));
    rows.push({
      id:`ciug-cutoff-2025-${slug(code)}-${slug(degree)}`,
      academic_year:'2025-2026',
      degree_code:code,
      degree_name:degree,
      university:'',
      campus:'',
      general_cutoff:nums[0] || '',
      graduates_cutoff:nums[1] || '',
      m25_cutoff:nums[2] || '',
      m45_cutoff:nums[3] || '',
      athletes_cutoff:nums[4] || '',
      disability_cutoff:nums[5] || '',
      source_id:'ciug-notas-corte-2025',
      source_url:sourceUrl,
      data_status:'pdf_text_imported_needs_review',
      metadata:{raw_line:line, values:nums, v:'0.22.2'}
    });
  }
  return [...new Map(rows.map(x=>[x.id,x])).values()].slice(0,1000);
}

function parseCiugPonderationText(text, sourceUrl){
  const lines = text.split(/\n+/).map(clean).filter(Boolean);
  const subjects = ['Bioloxía','Biología','Matemáticas II','Matemáticas aplicadas','Química','Física','Debuxo Técnico','Dibujo Técnico','Empresa','Xeografía','Geografía','Historia da Arte','Historia del Arte','Latín','Grego','Griego','Tecnoloxía','Tecnología','Deseño','Diseño'];
  const rows = [];
  for(const line of lines){
    const code = (line.match(/\b\d{5}\b/)||[])[0] || '';
    if(!code && !/Grao|Grado/i.test(line)) continue;
    const degree = clean(line.replace(/\b\d{5}\b/g,'').split(/\s{2,}/)[0]).slice(0,140);
    if(!degree || degree.length < 8) continue;
    for(const subj of subjects){
      const idx = normalise(line).indexOf(normalise(subj));
      if(idx < 0) continue;
      const tail = line.slice(idx, idx+80);
      const coeff = (tail.match(/\b0[,.][12]\b/)||[])[0];
      if(!coeff) continue;
      rows.push({
        id:`ciug-pond-2026-${slug(code || degree)}-${slug(subj)}`,
        access_year:'2026-2027',
        degree_name:degree,
        university:'',
        branch:'',
        subject:subj,
        coefficient:Number(coeff.replace(',','.')),
        source_id:'ciug-ponderaciones-2026',
        source_url:sourceUrl,
        data_status:'pdf_text_imported_needs_review',
        metadata:{raw_line:line, v:'0.22.2'}
      });
    }
  }
  return [...new Map(rows.map(x=>[x.id,x])).values()].slice(0,3000);
}

async function importCiugTables(){
  let cut=0, pon=0;
  const errors=[];
  try{
    const {url,text} = await pdfText(SOURCES.ciugCutoffs2025);
    const rows = parseCiugCutoffText(text, url);
    await upsert('itinera_ciug_cutoffs', rows);
    cut = rows.length;
  }catch(e){
    errors.push(`notas: ${e.message}`);
  }
  try{
    const {url,text} = await pdfText(SOURCES.ciugPonderations2026);
    const rows = parseCiugPonderationText(text, url);
    await upsert('itinera_ciug_ponderations', rows);
    pon = rows.length;
  }catch(e){
    errors.push(`ponderaciones: ${e.message}`);
  }
  await updateStatus(
    'v022-ciug',
    'CIUG notas y ponderaciones',
    (cut || pon) ? 'pdf_text_imported_needs_review' : 'in_progress_structured',
    cut + pon,
    'ciug-admision',
    (cut || pon)
      ? `v0.22.2 importó texto tabular desde PDF CIUG: ${cut} filas de notas y ${pon} filas de ponderaciones. Revisión visual obligatoria antes de usar como dato definitivo.`
      : `CIUG queda enlazada y pendiente de extracción tabular validada. ${errors.join(' || ')}`,
    {cutoffs:cut, ponderations:pon, errors}
  );
  return {cut, pon, errors};
}

async function main(){
  console.log('ITINERA v0.22 macrointegral loader started');
  const university = await importUniversityAggregates();
  const specializations = await importFpSpecializations();
  const centers = await importGaliciaCenters();
  const ciug = await importCiugTables();

  const coveragePatch = [
    {id:'universidad-grados', scope:'Universidad · Grados', expected_coverage:'Grados universitarios oficiales desde RUCT/QEDU/SIIU, con título, universidad, centro, créditos, rama, modalidad y notas cuando estén disponibles.', current_status: university ? 'in_progress_structured' : 'pending_review', notes: university ? 'v0.22 importó datos agregados EDUCAbase/SIIU. Para titulación concreta se mantiene verificación QEDU/RUCT.' : 'Pendiente de carga estructurada: revisar workflow v0.22.'},
    {id:'universidad-masteres-habilitantes', scope:'Universidad · Másteres habilitantes', expected_coverage:'Másteres oficiales, másteres habilitantes y profesiones reguladas con normativa BOE y verificación RUCT.', current_status:'in_progress_structured', notes:'v0.22 refuerza normativa y tablas. Los másteres habilitantes deben comprobarse título a título en RUCT/universidad/BOE.'},
    {id:'fp-cursos-especializacion', scope:'FP · Cursos de especialización', expected_coverage:'Cursos de especialización de FP, Grados E, por familia, requisitos, duración y fuente TodoFP.', current_status: specializations ? 'imported_needs_review' : 'in_progress_structured', notes: specializations ? 'Cursos de especialización extraídos desde TodoFP. Revisar familia, duración y requisitos título a título.' : 'Pendiente de extracción fina desde TodoFP.'},
    {id:'galicia-oferta-centros-fp', scope:'Galicia · Oferta por centros FP', expected_coverage:'Oferta de FP por centro, localidad, modalidad, régimen y curso desde Xunta FP y datos abiertos.', current_status: centers ? 'in_progress_structured' : 'pending_review', notes: centers ? 'Centros con mención FP importados desde Datos Abertos. Oferta ciclo/centro pendiente de cruce fino con Xunta FP.' : 'Pendiente de conector específico desde Xunta FP.'},
    {id:'galicia-ciug-ponderaciones-notas', scope:'Galicia · Ponderaciones y notas CIUG', expected_coverage:'Ponderaciones, notas de corte, admisión, cupos y matrícula SUG por curso y convocatoria.', current_status:'in_progress_structured', notes:'v0.22 enlaza CIUG notas/ponderaciones/admisión. La extracción tabular por grado queda sujeta a validación de PDF vigente.'}
  ];
  await upsert('itinera_source_coverage', coveragePatch);
  console.log(JSON.stringify({university, specializations, centers, ciug}, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
