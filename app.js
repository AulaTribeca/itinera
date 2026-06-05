const ROUTES = ['inicio','buscar','itinerario'];
const routeOutput = () => document.getElementById('routeOutput');

function currentRoute(){
  const raw = (location.hash || '#inicio').replace('#','').trim();
  return ROUTES.includes(raw) ? raw : 'inicio';
}

function showRoute(){
  const route = currentRoute();
  document.body.dataset.route = route;
  document.querySelectorAll('.view').forEach(view => {
    view.classList.toggle('active', view.id === route);
  });
  const active = document.getElementById(route);
  if(active){
    active.setAttribute('tabindex','-1');
    if(document.readyState === 'complete') active.focus({preventScroll:true});
  }
}

function routeSteps(start, goal, preference){
  const base = {
    sen_eso: ['Revisión da situación académica actual', 'Obtención do título de ESO ou acceso por vías de persoas adultas'],
    eso: ['Confirmación do título de ESO', 'Comparación entre Bacharelato, FP de grao medio e outras vías'],
    fp_medio: ['Revisión do ciclo cursado e da familia profesional', 'Valoración de continuidade cara a FP de grao superior'],
    bacharelato: ['Revisión da modalidade de Bacharelato e materias cursadas', 'Comparación entre universidade e FP de grao superior'],
    fp_superior: ['Revisión do ciclo superior e da nota media', 'Consulta de validacións, familias próximas e acceso universitario'],
    grao: ['Revisión do grao cursado, expediente e intereses profesionais', 'Selección de máster, especialización ou reorientación'],
    adultos: ['Análise de dispoñibilidade, experiencia previa e requisitos de acceso', 'Priorización de vías compatibles con persoas adultas']
  }[start] || ['Definición do punto de partida'];

  const goals = {
    fp_basica: ['Consulta de FP básica e programas formativos dispoñibles', 'Revisión de idade, requisitos e informe de orientación cando proceda'],
    fp_medio: ['Consulta de ciclos de FP de grao medio no mapa', 'Revisión de acceso directo, proba de acceso ou vía de adultos'],
    fp_superior: ['Consulta de ciclos de FP de grao superior no mapa', 'Revisión de requisitos de acceso, familia profesional e prazas'],
    universidade: ['Consulta de graos universitarios no mapa', 'Revisión de vías de acceso, ponderacións, notas de corte e prazos'],
    master: ['Consulta de másteres oficiais no mapa', 'Revisión de requisitos específicos, prazos e documentación'],
    doctorado: ['Consulta de programas de doutoramento no mapa', 'Revisión de acceso, liñas de investigación e dirección posible'],
    reorientacion: ['Identificación de competencias transferibles', 'Comparación de itinerarios breves, FP, universidade e especialización']
  }[goal] || ['Definición da meta académica'];

  const pref = {
    rapida: 'Priorizar a vía máis directa, sen deixar de comprobar requisitos oficiais e prazos.',
    prudente: 'Priorizar unha vía segura, con alternativas se a primeira opción non se confirma.',
    adultos: 'Priorizar modalidades compatibles con traballo, coidados ou retomada de estudos.',
    equilibrada: 'Combinar realismo, continuidade académica e marxe para decidir con calma.'
  }[preference] || 'Manter unha ruta equilibrada.';

  return [...base, ...goals, pref, 'Abrir o mapa de estudos para localizar centros, sedes e oferta dispoñible.', 'Contrastar sempre a información final coa fonte oficial antes de formalizar matrícula ou solicitude.'];
}

function bindRouteForm(){
  const form = document.getElementById('routeForm');
  if(!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const start = document.getElementById('startPoint').value;
    const goal = document.getElementById('goalPoint').value;
    const preference = document.getElementById('preferencePoint').value;
    if(!start || !goal) return;
    const steps = routeSteps(start, goal, preference);
    routeOutput().innerHTML = `
      <div class="timeline">
        <p class="eyebrow">Ruta orientativa</p>
        <h2>Proposta inicial de itinerario</h2>
        <ol>${steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
        <div class="notice"><strong>Nota de rigor:</strong> esta ruta é orientativa. Debe comprobarse con normativa, prazos, requisitos e fontes oficiais vixentes.</div>
      </div>
    `;
  });
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
}

window.addEventListener('hashchange', showRoute);
document.addEventListener('DOMContentLoaded', () => {
  showRoute();
  bindRouteForm();
});
