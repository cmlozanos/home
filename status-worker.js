/* ── Status Worker ────────────────────────────────────────────────────────────
 * Corre en background, hace polling cada INTERVAL ms a cada app.
 * Recibe:  { type: "init", apps: [{ slug, urlFile }] }
 * Emite:   { slug, status: "online"|"offline", url? }
 * ─────────────────────────────────────────────────────────────────────────── */

const INTERVAL = 30_000;

let apps = [];

async function checkApp({ slug, urlFile }) {
  try {
    const res = await fetch(urlFile, { cache: 'no-store' });
    if (!res.ok) return { slug, status: 'offline' };

    const { url } = await res.json();
    if (!url || url.includes('placeholder')) return { slug, status: 'offline' };

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
    poll();
    setInterval(poll, INTERVAL);
  }
};
