
const state = { catalog:null, ponder:null, links:[], faq:[], filtered:[], selectedRoute:null };

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const norm = v => String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const uniq = arr => Array.from(new Set(arr.filter(Boolean))).sort((a,b)=>String(a).localeCompare(String(b),'gl'));

function route(){
  const raw = (location.hash || '#inicio').replace('#','') || 'inicio';
  const sectionAnchors = ['ligazons','preguntas','recursos'];
  const hash = sectionAnchors.includes(raw) ? 'buscar' : raw;
  $$('.view').forEach(v => v.classList.toggle('active', v.id === hash));
  document.body.dataset.route = hash;
  if(hash === 'buscar') renderResults();
  if(sectionAnchors.includes(raw)){
    setTimeout(() => document.getElementById(raw)?.scrollIntoView({behavior:'smooth', block:'start'}), 80);
  }
}
window.addEventListener('hashchange', route);

async function loadData(){
  const [catalog, ponder, links, faq] = await Promise.all([
    fetch('data/catalogo-estudos-v58.json').then(r=>r.json()),
    fetch('data/ponderacions-2026.json').then(r=>r.json()),
    fetch('data/ligazons-oficiais-v58.json').then(r=>r.json()),
    fetch('data/faq-v58.json').then(r=>r.json())
  ]);
  Object.assign(state, {catalog, ponder, links, faq, filtered:catalog.records});
  fillFilters();
  fillStudyList();
  renderResults();
  renderLinks();
  renderFaq();
}

function fillSelect(id, values, allLabel){
  const el = $(id);
  if(!el) return;
  el.innerHTML = `<option value="">${esc(allLabel)}</option>` + values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
}
function fillFilters(){
  fillSelect('#tipo', ['FP básica','FP grao medio','FP grao superior','Grao','Máster','Doutoramento'], 'Todos os tipos');
  fillSelect('#provincia', state.catalog.provincias, 'Todas as provincias');
  fillSelect('#localidade', state.catalog.localidades, 'Todas as localidades');
  fillSelect('#familia', state.catalog.familias, 'Todas as familias ou ramas');
  fillSelect('#centro', state.catalog.centros, 'Todos os centros ou sedes');
  ['#q','#tipo','#provincia','#localidade','#familia','#centro'].forEach(id => $(id)?.addEventListener('input', renderResults));
  $('#clearFilters')?.addEventListener('click', () => {
    ['#q','#tipo','#provincia','#localidade','#familia','#centro'].forEach(id => { const el=$(id); if(el) el.value=''; });
    renderResults();
  });
}
function fillStudyList(){
  const names = uniq(state.catalog.records.map(r=>r.nome));
  $('#studyList').innerHTML = names.slice(0,2200).map(n=>`<option value="${esc(n)}"></option>`).join('');
}
function renderResults(){
  if(!state.catalog) return;
  const q = norm($('#q')?.value);
  const tipo = $('#tipo')?.value || '';
  const provincia = $('#provincia')?.value || '';
  const localidade = $('#localidade')?.value || '';
  const familia = $('#familia')?.value || '';
  const centro = $('#centro')?.value || '';
  let rows = state.catalog.records.filter(r => {
    if(tipo && r.tipo !== tipo) return false;
    if(provincia && r.provincia !== provincia) return false;
    if(localidade && r.localidade !== localidade) return false;
    if(familia && r.familia !== familia) return false;
    if(centro && r.centro !== centro) return false;
    if(q){
      const hay = norm([r.nome,r.tipo,r.nivel,r.familia,r.provincia,r.localidade,r.centro,r.universidade,r.campus].join(' '));
      if(!hay.includes(q)) return false;
    }
    return true;
  });
  state.filtered = rows;
  $('#count').textContent = `${rows.length} resultado${rows.length===1?'':'s'}`;
  $('#status').textContent = rows.length ? 'Selecciona un resultado para contrastalo co mapa.' : 'Non hai resultados cos filtros actuais.';
  $('#results').innerHTML = rows.slice(0,80).map(r => `
    <article class="result-card">
      <h3>${esc(r.nome)}</h3>
      <div class="badges">
        <span class="badge">${esc(r.tipo)}</span>
        ${r.provincia ? `<span class="badge">${esc(r.provincia)}</span>` : ''}
        ${r.localidade ? `<span class="badge">${esc(r.localidade)}</span>` : ''}
      </div>
      <p><strong>Centro ou sede:</strong> ${esc(r.centro || 'Consultar fonte oficial')}</p>
      <p><strong>Familia ou rama:</strong> ${esc(r.familia || 'Non indicada')}</p>
      ${r.prazas ? `<p><strong>Prazas:</strong> ${esc(r.prazas)}</p>` : ''}
      ${r.fonte ? `<p><strong>Fonte:</strong> ${esc(shortSource(r.fonte))}</p>` : ''}
    </article>
  `).join('') || `<div class="result-card"><h3>Sen resultados</h3><p>Proba a ampliar filtros ou buscar por outro termo.</p></div>`;
}
function shortSource(s){ return s.startsWith('http') ? 'Ligazón oficial' : s; }

function findTarget(name){
  const n = norm(name);
  if(!n) return null;
  return state.catalog.records.find(r => norm(r.nome) === n) || state.catalog.records.find(r => norm(r.nome).includes(n) || n.includes(norm(r.nome)));
}
function findPonderation(name){
  const n = norm(name);
  if(!n) return null;
  return state.ponder.records.find(r => norm(r.grao) === n) || state.ponder.records.find(r => norm(r.grao).includes(n) || n.includes(norm(r.grao)));
}
function recommendedBach(row){
  if(!row) return 'Bacharelato coherente coa rama do grao';
  const top02 = row.materias_recomendadas.filter(x=>x.peso==='0,2').map(x=>x.materia);
  const txt = norm(top02.join(' '));
  if(/bioloxia|quimica|ciencias xerais/.test(txt) && !/debuxo tecnico|tecnoloxia/.test(txt)) return 'Bacharelato de Ciencias e Tecnoloxía, priorizando Bioloxía, Química e Matemáticas II se ponderan';
  if(/fisica|matematicas ii|debuxo tecnico|tecnoloxia/.test(txt)) return 'Bacharelato de Ciencias e Tecnoloxía, priorizando Matemáticas II, Física, Debuxo técnico II ou Tecnoloxía e enxeñaría II segundo ponderación';
  if(/empresa|matematicas aplicadas|xeografia|latín|grego|historia/.test(txt)) return 'Bacharelato de Humanidades e Ciencias Sociais, escollendo materias que ponderen 0,2 para a meta';
  if(/artes|deseño|debuxo|musica|literatura dramatica/.test(txt)) return 'Bacharelato de Artes, coas materias artísticas que ponderen mellor para a titulación';
  return 'Escoller modalidade de Bacharelato segundo materias con ponderación 0,2 e perfil do grao';
}
function buildRoutes(start, target, ponder){
  const isGrao = (target?.tipo === 'Grao') || !!ponder;
  const targetName = target?.nome || $('#targetStudy').value || 'estudo seleccionado';
  const base = [];
  if(isGrao){
    base.push({
      id:'directa', title:'Vía máis directa', years:start==='bach'?4:6, tag:'Máis curta',
      steps:[
        ['Escolla de Bacharelato', recommendedBach(ponder), 'Revisar materias de modalidade e materias que ponderan 0,2 para a PAU.'],
        ['PAU e admisión', 'Preparar fase obrigatoria e fase de admisión con materias ponderables.', 'Consultar prazos, matrícula, parámetros e notas de corte na CIUG.'],
        ['Grao universitario', `Solicitar ${targetName} na preinscrición universitaria.`, 'Ordenar preferencias correctamente e comprobar prazas, campus e centro.']
      ]
    });
    base.push({
      id:'fp-superior', title:'Bacharelato + FP superior + grao', years:start==='bach'?5:7, tag:'Máis práctica',
      steps:[
        ['Bacharelato', 'Completar Bacharelato nunha modalidade compatible coa familia profesional ou co grao final.', 'Mantén aberta a opción de PAU e de acceso a FP superior.'],
        ['FP de grao superior', 'Escoller un ciclo superior relacionado co grao obxectivo.', 'Permite obter unha titulación profesional e acceder posteriormente á universidade.'],
        ['Acceso á universidade', 'Usar a nota do ciclo e, se convén, mellorar admisión con materias específicas da PAU.', 'Comprobar recoñecemento de créditos no grao de destino.']
      ]
    });
    base.push({
      id:'fp-progresiva', title:'ESO + FP medio + FP superior + grao', years:start==='fpgm'?5:8, tag:'Con saídas intermedias',
      steps:[
        ['FP de grao medio', 'Escoller un ciclo da familia máis próxima á meta.', 'Achega unha primeira cualificación profesional.'],
        ['FP de grao superior', 'Continuar cun ciclo superior relacionado.', 'Mellora a especialización e permite acceso á universidade.'],
        ['Grao universitario', `Acceder a ${targetName} e solicitar recoñecemento de créditos se procede.`, 'Contrastar requisitos, prazas e notas no SUG.']
      ]
    });
  } else {
    base.push({
      id:'fp-directa', title:'Vía profesional directa', years:2, tag:'Especialización rápida',
      steps:[
        ['Acceso', 'Comprobar requisito de acceso para o ciclo ou estudo seleccionado.', 'Revisar idade, titulación previa, proba de acceso ou outras vías.'],
        ['Matrícula', `Solicitar praza en ${targetName}.`, 'Consultar a oferta oficial, centros, prazas e calendario.'],
        ['Continuidade', 'Valorar continuidade a outro ciclo, especialización ou emprego.', 'Manter unha ruta alternativa se non se obtén praza no primeiro centro.']
      ]
    });
  }
  return base;
}
function renderPlanner(){
  const start = $('#startPoint').value;
  const priority = $('#priority').value;
  const target = findTarget($('#targetStudy').value);
  const ponder = findPonderation($('#targetStudy').value);
  const routes = buildRoutes(start, target, ponder);
  const preferred = priority === 'seguridade' ? (routes[2] || routes[1] || routes[0]) : priority === 'practica' ? (routes[1] || routes[0]) : routes[0];
  state.selectedRoute = preferred.id;
  paintPlanner(target, ponder, routes, preferred);
}
function paintPlanner(target, ponder, routes, active){
  const top = ponder ? ponder.materias_recomendadas.filter(x=>x.peso==='0,2').slice(0,10) : [];
  $('#plannerOutput').innerHTML = `
    <div class="plan-print">
      <p class="eyebrow">Itinerario xerado</p>
      <h2>${esc(target?.nome || $('#targetStudy').value || 'Meta sen especificar')}</h2>
      <p>${target ? `${esc(target.tipo)} · ${esc(target.localidade || '')} · ${esc(target.centro || '')}` : 'Introduce unha meta máis concreta para personalizar mellor a ruta.'}</p>
      ${ponder ? `<section class="ponder-box"><strong>Ponderacións PAU atopadas para ${esc(ponder.grao)}</strong><p>Rama: ${esc(ponder.rama)}. Páxina ${ponder.pagina_pdf} do documento oficial 2026-2027.</p><div class="ponder-grid">${top.map(x=>`<span class="ponder-pill">${esc(x.materia)} · ${esc(x.peso)}</span>`).join('')}</div><p><strong>Bacharelato recomendado:</strong> ${esc(recommendedBach(ponder))}</p></section>` : `<section class="ponder-box"><strong>Ponderacións non aplicables ou non atopadas</strong><p>As ponderacións só se aplican aos graos universitarios incluídos no documento oficial. Para FP, másteres e doutoramentos deben consultarse requisitos propios.</p></section>`}
      <div class="route-options">${routes.map(r=>`<button type="button" class="route-card ${r.id===active.id?'active':''}" data-route="${esc(r.id)}"><strong>${esc(r.title)}</strong><span>${esc(r.tag)} · ${r.years} anos aprox.</span></button>`).join('')}</div>
      <div id="timeline">${timelineHtml(active)}</div>
    </div>
  `;
  $$('.route-card').forEach(btn => btn.addEventListener('click', () => {
    const r = routes.find(x=>x.id===btn.dataset.route) || routes[0];
    state.selectedRoute = r.id;
    $$('.route-card').forEach(b=>b.classList.toggle('active', b===btn));
    $('#timeline').innerHTML = timelineHtml(r);
  }));
}
function timelineHtml(route){
  return `<h3>${esc(route.title)} <span class="badge">${route.years} anos aprox.</span></h3><div class="timeline">${route.steps.map((s,i)=>`<article class="step"><div class="step-num">${i+1}</div><div><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p><details><summary>Ver información ampliada</summary><p>${esc(s[2])}</p></details></div></article>`).join('')}</div>`;
}

function renderLinks(){
  const box = $('#officialLinks');
  const grouped = {};
  state.links.forEach(l => (grouped[l.categoria] ||= []).push(l));
  box.innerHTML = Object.entries(grouped).map(([cat, items]) => items.map(l => `
    <a class="resource-card" href="${esc(l.url)}" target="_blank" rel="noopener">
      <small>${esc(cat)}</small><strong>${esc(l.titulo)}</strong><p>${esc(l.descricion)}</p>
    </a>
  `).join('')).join('');
}
function renderFaq(){
  const term = norm($('#faqSearch')?.value || '');
  const items = state.faq.filter(f => !term || norm(f.pregunta + ' ' + f.resposta).includes(term));
  $('#faqList').innerHTML = items.map(f => `<details><summary>${esc(f.pregunta)}</summary><p>${esc(f.resposta)}</p></details>`).join('');
}
$('#faqSearch')?.addEventListener('input', renderFaq);
$('#buildRoute')?.addEventListener('click', renderPlanner);
$('#printPlan')?.addEventListener('click', () => {
  if(!$('#plannerOutput .plan-print')) renderPlanner();
  window.print();
});

loadData().then(route);
