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

// ── Estado en tiempo real ─────────────────────────────────────────────────────
async function getStatus(gistId) {
  try {
    const res  = await fetch(`https://api.github.com/gists/${gistId}`, { cache: "no-store" });
    if (!res.ok) return "offline";
    const data = await res.json();
    const raw  = Object.values(data.files)[0]?.content;
    const { url } = JSON.parse(raw);
    if (!url || url.includes("placeholder")) return "offline";

    // Ping rápido para ver si el servidor responde
    const ping = await fetch(url, { method: "HEAD", mode: "no-cors", signal: AbortSignal.timeout(4000) });
    return "online";
  } catch {
    return "offline";
  }
}

// ── Render ────────────────────────────────────────────────────────────────────
async function render() {
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

    // Actualiza el indicador de estado de forma asíncrona
    getStatus(app.gistId).then(status => {
      const dot = document.getElementById(`dot-${app.slug}`);
      const lbl = document.getElementById(`lbl-${app.slug}`);
      dot.className = `status-dot ${status}`;
      lbl.textContent = status === "online" ? "En línea" : "Servidor apagado";
    });
  }
}

render();
