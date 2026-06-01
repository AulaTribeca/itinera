import { getStore } from '@netlify/blobs';
import { readFileSync } from 'node:fs';

const seed = JSON.parse(
  readFileSync(new URL('../../data/studies.seed.json', import.meta.url), 'utf8')
);

const OFFICIAL_SOURCES = [
  'https://www.todofp.es/inicio.html',
  'https://www.todofp.es/que-estudiar/familias-profesionales.html',
  'https://www.edu.xunta.gal/fp/oferta-fp',
  'https://www.edu.xunta.gal/fp/ciclos',
  'https://www.edu.xunta.gal/fp/centros',
  'https://www.ciug.gal/admision-sug',
  'https://www.ciencia.gob.es/Universidades/QEDU.html',
  'https://universidades.sede.gob.es/pagina/index/directorio/Proc_Ruct',
  'https://www.infoartisticas.gob.es/ensenanzas.html'
];

async function checkSource(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'user-agent': 'ITINERA academic guidance updater' }
    });
    return { url, status: res.status, ok: res.ok, checked_at: new Date().toISOString() };
  } catch (error) {
    return {
      url,
      status: 0,
      ok: false,
      error: String(error?.message || error),
      checked_at: new Date().toISOString()
    };
  }
}

export default async () => {
  try {
    const checks = await Promise.all(OFFICIAL_SOURCES.map(checkSource));
    const dataset = {
      ...seed,
      source_mode: 'scheduled-official-cache',
      last_updated: new Date().toISOString().slice(0, 10),
      source_checks: checks,
      note:
        'La estructura está preparada para incorporar conectores parseadores específicos por fuente oficial. Esta función valida disponibilidad de fuentes y mantiene una caché oficial para la app.'
    };

    const store = getStore('itinera-official-cache');
    await store.setJSON('studies-latest', dataset);

    return new Response(
      JSON.stringify({ ok: true, updated_at: dataset.last_updated, source_checks: checks }),
      { headers: { 'content-type': 'application/json; charset=utf-8' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: String(error?.message || error) }),
      { status: 500, headers: { 'content-type': 'application/json; charset=utf-8' } }
    );
  }
};
