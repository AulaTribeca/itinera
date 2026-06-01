import { getStore } from '@netlify/blobs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const seed = JSON.parse(readFileSync(join(__dirname, '../../data/studies.seed.json'), 'utf8'));

const normalise = (value='') => String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function levenshtein(a,b){
  a=normalise(a); b=normalise(b);
  const dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
  for(let i=0;i<=a.length;i++) dp[i][0]=i;
  for(let j=0;j<=b.length;j++) dp[0][j]=j;
  for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++) dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return dp[a.length][b.length];
}
function similarity(a,b){
  a=normalise(a); b=normalise(b); if(!a||!b) return 0;
  if(a.includes(b)||b.includes(a)) return 1;
  return 1 - levenshtein(a,b) / Math.max(a.length,b.length);
}
async function loadDataset(){
  try{
    const store=getStore('itinera-official-cache');
    const cached=await store.get('studies-latest',{type:'json'});
    if(cached?.studies?.length) return cached;
  }catch(e){ /* local/dev fallback */ }
  return seed;
}

export default async (request) => {
  const url=new URL(request.url);
  const q=normalise(url.searchParams.get('q')||'');
  const type=url.searchParams.get('type')||'all';
  const family=url.searchParams.get('family')||'all';
  const residence=url.searchParams.get('residence')||'';
  const data=await loadDataset();
  const results=(data.studies||[]).map(item=>{
    const hay=[item.name,item.family,...(item.keywords||[])].join(' ');
    const exact=q && normalise(hay).includes(q);
    const fuzzy=q ? Math.max(...[item.name,item.family,...(item.keywords||[])].map(x=>similarity(q,x))) : .55;
    let score=exact?1.25:fuzzy;
    if(type!=='all' && item.type!==type) score-=.6;
    if(family!=='all' && normalise(item.family)!==normalise(family)) score-=.45;
    if(!q && (type!=='all'||family!=='all')) score+=.25;
    return {...item, score, suggestion: q && !normalise(item.name).includes(q) && score>.45};
  }).filter(x=>x.score>.38).sort((a,b)=>b.score-a.score).slice(0,12);

  return new Response(JSON.stringify({
    updated_at:data.last_updated,
    source_mode:data.source_mode || 'seed+official-cache',
    residence,
    results,
    official_fallbacks:[
      {title:'Xunta de Galicia: oferta de FP', url:'https://www.edu.xunta.gal/fp/oferta-fp'},
      {title:'Xunta de Galicia: centros FP', url:'https://www.edu.xunta.gal/fp/centros'},
      {title:'QEDU', url:'https://www.ciencia.gob.es/Universidades/QEDU.html'},
      {title:'RUCT', url:'https://universidades.sede.gob.es/pagina/index/directorio/Proc_Ruct'},
      {title:'CIUG admisión SUG', url:'https://www.ciug.gal/admision-sug'}
    ]
  }), {headers:{'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=3600'}});
};
