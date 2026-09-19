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
    slug:         "nitro-highway",
    icon:         "🏁",
    title:        "Turbo Horizonte",
    desc:         "Conduce entre curvas, rampas y tráfico. Elige tu coche y utiliza el nitro para llegar a la meta.",
    badge:        "Carreras · PWA",
    color:        "#ffad65",
    href:         "https://cmlozanos.github.io/home/nitro-highway/",
    alwaysOnline: true,
  },
  {
    slug:         "pocket-karts",
    icon:         "🚦",
    title:        "Mini Karts",
    desc:         "Pequeñas carreras vistas desde arriba. Tres circuitos para aprender a girar, acelerar y frenar.",
    badge:        "Karts · PWA",
    color:        "#8bd8b0",
    href:         "https://cmlozanos.github.io/home/pocket-karts/",
    alwaysOnline: true,
  },
  {
    slug:         "pulse-path",
    icon:         "💠",
    title:        "Salto Neón",
    desc:         "Salta al ritmo entre prismas y portales. Tres recorridos originales con puntos de control y ayudas opcionales.",
    badge:        "Saltos · PWA",
    color:        "#a699ff",
    href:         "https://cmlozanos.github.io/home/pulse-path/",
    alwaysOnline: true,
  },
  {
    slug:         "fruit-splash",
    icon:         "🍉",
    title:        "Fruit Splash",
    desc:         "Desliza y corta frutas, encadena combos y juega a tu ritmo. Tres modos para pequeños ninjas.",
    badge:        "Táctil · PWA",
    color:        "#ffb48f",
    href:         "https://cmlozanos.github.io/home/fruit-splash/",
    alwaysOnline: true,
  },
  {
    slug:         "orbit-lab",
    icon:         "🪐",
    title:        "Órbita · Tu pequeño universo",
    desc:         "Crea mundos con vida, fusiona estrellas y descubre nebulosas y agujeros negros con los dedos.",
    badge:        "Exploración · PWA",
    color:        "#b8a1ff",
    href:         "https://cmlozanos.github.io/home/orbit-lab/",
    alwaysOnline: true,
  },
  {
    slug:         "memory-garden",
    icon:         "🦊",
    title:        "Jardín de parejas",
    desc:         "Encuentra los animales iguales. Tres tamaños de tablero, sin prisas ni necesidad de leer.",
    badge:        "Memoria · PWA",
    color:        "#80b6a0",
    href:         "https://cmlozanos.github.io/home/memory-garden/",
    alwaysOnline: true,
  },
  {
    slug:         "shape-studio",
    icon:         "🔷",
    title:        "Taller de formas",
    desc:         "Encaja piezas por su silueta y descubre formas y colores. Arrastra o toca para colocar.",
    badge:        "Lógica · PWA",
    color:        "#ebac76",
    href:         "https://cmlozanos.github.io/home/shape-studio/",
    alwaysOnline: true,
  },
  {
    slug:         "little-atelier",
    icon:         "🎨",
    title:        "Pequeño Atelier",
    desc:         "Dibuja con colores, pinceles y sellos. Guarda tus creaciones y vuelve a pintar cuando quieras.",
    badge:        "Creatividad · PWA",
    color:        "#e8a4a9",
    href:         "https://cmlozanos.github.io/home/little-atelier/",
    alwaysOnline: true,
  },
  {
    slug:         "maze-meadow",
    icon:         "🐇",
    title:        "El jardín de los caminos",
    desc:         "Ayuda al conejo a encontrar el camino. Recoge estrellas con el dedo o las flechas del teclado.",
    badge:        "Orientación · PWA",
    color:        "#aac48a",
    href:         "https://cmlozanos.github.io/home/maze-meadow/",
    alwaysOnline: true,
  },
  {
    slug:         "turbo-loop-legends",
    icon:         "🏎️",
    title:        "Turbo Loop Legends",
    desc:         "Carreras para niños con turbo, loopings, saltos y coches con habilidades para resolver cada pista.",
    badge:        "Carreras · PWA",
    color:        "#f3a529",
    href:         "https://cmlozanos.github.io/turbo-loop-legends/",
    alwaysOnline: true,
  },
  {
    slug:         "rubik-solver",
    icon:         "🧩",
    title:        "Rubik Solver",
    desc:         "Solucionador 3x3: dibuja el cubo, usa foto como ayuda y sigue movimientos paso a paso.",
    badge:        "HTML · CSS · JS",
    color:        "#38bdf8",
    href:         "https://cmlozanos.github.io/home/rubik-solver/",
    alwaysOnline: true,
  },
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
