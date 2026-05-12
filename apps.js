// ── Registro de apps ─────────────────────────────────────────────────────────
// alwaysOnline: true  → GitHub Pages, siempre accesible, sin polling de túnel
// urlFile             → apps locales (Docker + Cloudflare Tunnel)
const APPS = [
  // ── Apps locales (Docker + túnel) ────────────────────────────────────────
  {
    slug:    "catalog",
    icon:    "🛍️",
    title:   "Catálogo de Productos",
    desc:    "SPA con Flask + MongoDB. Busca y filtra productos con actualización en tiempo real.",
    badge:   "Flask · MongoDB",
    color:   "#4f46e5",
    urlFile: "./urls/catalog.json",
  },
  {
    slug:    "animal-quiz",
    icon:    "🐾",
    title:   "Quiz de Animales",
    desc:    "Juego educativo para Miguel Angel y Alejandro Manuel. Identifica animales y aprende a escribir su nombre.",
    badge:   "Flask · MongoDB",
    color:   "#16a34a",
    urlFile: "./urls/animal-quiz.json",
  },

  // ── Juegos estáticos (GitHub Pages) ──────────────────────────────────────
  {
    slug:         "banana-party",
    icon:         "🐵",
    title:        "Banana Party",
    desc:         "¡Ayuda al mono a recoger todas las bananas de la montaña!",
    badge:        "Plataformas",
    color:        "#f9ca24",
    href:         "https://cmlozanos.github.io/banana-party/",
    alwaysOnline: true,
  },
  {
    slug:         "fancy-jumping-car",
    icon:         "🏎️",
    title:        "Super Kart Racing",
    desc:         "Elige tu personaje y compite en emocionantes carreras.",
    badge:        "Carreras",
    color:        "#eb4d4b",
    href:         "https://cmlozanos.github.io/fancy-jumping-car/",
    alwaysOnline: true,
  },
  {
    slug:         "jump-the-car",
    icon:         "🚗",
    title:        "Jump the Car",
    desc:         "Juego educativo para niños: ¡salta los obstáculos y llega a la meta!",
    badge:        "Educativo · PWA",
    color:        "#ffd700",
    href:         "https://cmlozanos.github.io/jump-the-car/",
    alwaysOnline: true,
  },
  {
    slug:         "world-of-joy",
    icon:         "🌍",
    title:        "World of Joy",
    desc:         "Explora el mundo abierto, forma palabras y conduce en modo racing.",
    badge:        "Aventura · PWA",
    color:        "#6ab04c",
    href:         "https://cmlozanos.github.io/world-of-joy/",
    alwaysOnline: true,
  },
  {
    slug:         "little-chef-academy",
    icon:         "👩‍🍳",
    title:        "Little Chef Academy",
    desc:         "Aprende palabras, números y colores preparando recetas felices.",
    badge:        "Educativo · Idiomas",
    color:        "#fb923c",
    href:         "https://cmlozanos.github.io/games/little-chef-academy/",
    alwaysOnline: true,
  },
];

// ── Render (estático) ─────────────────────────────────────────────────────────
function render() {
  const grid = document.getElementById("grid");

  for (const app of APPS) {
    const card      = document.createElement("a");
    card.href       = app.href || `./${app.slug}/`;
    card.className  = "card";
    card.target     = "_blank";
    card.rel        = "noopener";
    card.style.setProperty("--accent-color", app.color);

    const statusInit = app.alwaysOnline ? "online" : "soon";
    const labelInit  = app.alwaysOnline ? "Siempre en línea ✓" : "Verificando…";

    card.innerHTML = `
      <div class="card-icon">${app.icon}</div>
      <div class="card-title">${app.title}</div>
      <div class="card-desc">${app.desc}</div>
      <span class="badge">${app.badge}</span>
      <div>
        <span class="status-dot ${statusInit}" id="dot-${app.slug}"></span>
        <span class="status-label" id="lbl-${app.slug}">${labelInit}</span>
      </div>`;
    grid.appendChild(card);
  }
}

// ── Web Worker — polling continuo cada 30 s (solo apps con túnel) ─────────────
function startStatusWorker() {
  if (!window.Worker) return;

  const tunnelApps = APPS.filter(a => a.urlFile);
  if (!tunnelApps.length) return;

  const worker = new Worker("./status-worker.js");

  worker.postMessage({
    type: "init",
    apps: tunnelApps.map(({ slug, urlFile }) => ({ slug, urlFile })),
  });

  worker.onmessage = ({ data: { slug, status } }) => {
    const dot = document.getElementById(`dot-${slug}`);
    const lbl = document.getElementById(`lbl-${slug}`);
    if (!dot || !lbl) return;
    dot.className  = `status-dot ${status}`;
    lbl.textContent = status === "online" ? "En línea ✓" : "Servidor apagado";
  };

  worker.onerror = (e) => console.warn("[status-worker] error:", e.message);
}

render();
startStatusWorker();
