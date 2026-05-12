/* ── Status Worker ────────────────────────────────────────────────────────────
 * Corre en background, hace polling cada INTERVAL ms a cada app.
 * Recibe:  { type: "init", apps: [{ slug, gistId }] }
 * Emite:   { slug, status: "online"|"offline", url? }
 * ─────────────────────────────────────────────────────────────────────────── */

const INTERVAL = 30_000; // 30 segundos entre cada ronda de checks

let apps = [];

async function checkApp({ slug, gistId }) {
  try {
    const res = await fetch(`https://api.github.com/gists/${gistId}`, { cache: 'no-store' });
    if (!res.ok) return { slug, status: 'offline' };

    const data = await res.json();
    const raw  = data.files['tunnel-url.json']?.content;
    if (!raw) return { slug, status: 'offline' };

    const { url } = JSON.parse(raw);
    if (!url || url.includes('placeholder')) return { slug, status: 'offline' };

    // Ping — no-cors devuelve respuesta opaca pero no lanza error si hay conectividad
    await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(5000) });
    return { slug, status: 'online', url };
  } catch {
    return { slug, status: 'offline' };
  }
}

async function poll() {
  const results = await Promise.all(apps.map(checkApp));
  results.forEach(r => self.postMessage(r));
}

self.onmessage = ({ data }) => {
  if (data.type === 'init') {
    apps = data.apps;
    poll();                          // check inmediato al arrancar
    setInterval(poll, INTERVAL);     // y cada 30s
  }
};
