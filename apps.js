// ── Registro de apps ─────────────────────────────────────────────────────────
// Para añadir una nueva app: añade un objeto a este array y crea su carpeta
// con el index.html de redirect apuntando a su gistId.
const APPS = [
  {
    slug:    "catalog",
    icon:    "🛍️",
    title:   "Catálogo de Productos",
    desc:    "SPA con Flask + MongoDB. Busca y filtra productos con actualización en tiempo real.",
    badge:   "Flask · MongoDB",
    color:   "#4f46e5",
    gistId:  "22e1aa2424c8fc9c1d341154de4c71eb",
  },
  {
    slug:   "animal-quiz",
    icon:   "🐾",
    title:  "Quiz de Animales",
    desc:   "Juego 3D educativo para Miguel Angel y Alejandro Manuel. Identifica animales y aprende a escribir su nombre.",
    badge:  "Flask · MongoDB · Three.js",
    color:  "#16a34a",
    gistId: "832e18462de60c3c94b4d2bf5db79386",
  },
  // Próximas apps — descomenta y rellena cuando estén listas:
  // {
  //   slug:  "game1",
  //   icon:  "🎮",
  //   title: "Juego 1",
  //   desc:  "Descripción del juego.",
  //   badge: "Pygame · MongoDB",
  //   color: "#0ea5e9",
  //   gistId: "GIST_ID_DEL_JUEGO",
  // },
];

// ── Render (estático) ─────────────────────────────────────────────────────────
function render() {
  const grid = document.getElementById("grid");

  for (const app of APPS) {
    const card = document.createElement("a");
    card.href  = `./${app.slug}/`;
    card.className = "card";
    card.style.setProperty("--accent-color", app.color);
    card.innerHTML = `
      <div class="card-icon">${app.icon}</div>
      <div class="card-title">${app.title}</div>
      <div class="card-desc">${app.desc}</div>
      <span class="badge">${app.badge}</span>
      <div>
        <span class="status-dot soon" id="dot-${app.slug}"></span>
        <span class="status-label" id="lbl-${app.slug}">Verificando…</span>
      </div>`;
    grid.appendChild(card);
  }
}

// ── Web Worker — polling continuo cada 30 s ───────────────────────────────────
function startStatusWorker() {
  if (!window.Worker) return; // fallback: sin actualización de estado

  const worker = new Worker("./status-worker.js");

  // Enviar lista de apps al worker para que empiece a hacer polling
  worker.postMessage({
    type: "init",
    apps: APPS.map(({ slug, gistId }) => ({ slug, gistId })),
  });

  // Recibir actualizaciones y pintarlas en el DOM
  worker.onmessage = ({ data: { slug, status } }) => {
    const dot = document.getElementById(`dot-${slug}`);
    const lbl = document.getElementById(`lbl-${slug}`);
    if (!dot || !lbl) return;
    dot.className = `status-dot ${status}`;
    lbl.textContent = status === "online" ? "En línea ✓" : "Servidor apagado";
  };

  worker.onerror = (e) => console.warn("[status-worker] error:", e.message);
}

render();
startStatusWorker();
