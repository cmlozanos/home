# cmlozanos · home

Portal público de proyectos en vivo. Cada proyecto corre localmente en Docker y se expone a internet mediante **Cloudflare Tunnel**. Esta página actúa como enrutador central, redirigiendo a cada proyecto usando su URL actual almacenada en un GitHub Gist.

🌐 **URL pública:** https://cmlozanos.github.io/home

---

## Arquitectura general

```
Visitante
   │
   ▼
cmlozanos.github.io/home          ← Este repo (público, GitHub Pages)
   │   index.html  → lista de proyectos con estado en tiempo real
   │
   ├── /catalog/   → lee Gist → redirige a https://xxxx.trycloudflare.com
   ├── /game1/     → lee Gist → redirige a https://yyyy.trycloudflare.com
   └── /game2/     → ...
          │
          ▼
   GitHub Gist (público)          ← almacena la URL actual del túnel
          │
          ▼
   Cloudflare Tunnel              ← se actualiza automáticamente al arrancar
          │
          ▼
   Docker Compose (local)         ← app + MongoDB + cloudflared
          │
          └── Flask / FastAPI / cualquier framework
```

---

## Reglas del paradigma

### Regla 1 — Cada proyecto publica su URL en `urls/<slug>.json`

Cuando el túnel arranca, el script `cloudflared-start.sh` actualiza el fichero `urls/<slug>.json` de **este mismo repo** mediante la GitHub Contents API:

```json
{"url":"https://xxxx.trycloudflare.com"}
```

- Nombre del archivo: `urls/<slug>.json` (ej: `urls/catalog.json`)
- Si el servidor está apagado, el fichero conserva la última URL y la página de redirect muestra "Servidor apagado".
- **No se usan Gists** — el fichero es estático, público y sin rate limit.

### Regla 2 — Cada proyecto tiene su carpeta en este repo

```
home/
├── urls/
│   └── <slug>.json       ← URL del túnel (actualizada por cloudflared-start.sh)
└── <slug>/
    └── index.html        ← copia de template/index.html apuntando a ../urls/<slug>.json
```

El `slug` debe ser:
- En minúsculas, sin espacios, con guiones si es necesario (`my-game`, `catalog`)
- Igual al campo `slug` registrado en `apps.js` y al `APP_SLUG` del `.env`

### Regla 3 — Registrar el proyecto en `apps.js`

Añadir un objeto al array `APPS` en `apps.js`:

```js
{
  slug:    "my-project",          // carpeta en home/ y URL: /home/my-project/
  icon:    "🎮",                  // emoji representativo
  title:   "Nombre del Proyecto", // título en la landing
  desc:    "Descripción corta.",  // 1-2 frases
  badge:   "Flask · MongoDB",     // stack tecnológico
  color:   "#0ea5e9",             // color de acento (hex)
  urlFile: "./urls/my-project.json", // fichero JSON con la URL del túnel
}
```

### Regla 4 — Cada proyecto es un repo privado

El código fuente de cada app vive en un **repo privado** (`cmlozanos/<nombre>`) y **nunca** se expone aquí. Solo es público el redirect de `home/`.

### Regla 5 — El repo privado sigue la estructura estándar

Todo proyecto debe incluir:

| Archivo | Propósito |
|---------|-----------|
| `Dockerfile` | Imagen de la app |
| `Dockerfile.cloudflared` | Alpine + cloudflared + shell |
| `docker-compose.yml` | Orquesta: app + mongo + seed + cloudflared |
| `scripts/cloudflared-start.sh` | Arranca el túnel y actualiza `urls/<slug>.json` en home |
| `Makefile` | `install`, `up`, `down`, `logs`, `seed`, `shell`, `clean` |
| `seed.py` | Datos iniciales para MongoDB |
| `.env` | Variables locales (nunca commiteadas) |
| `.gitignore` | Excluye `.env`, `__pycache__`, etc. |
| `README.md` | Documentación del proyecto |

### Regla 6 — Variables de entorno obligatorias en `.env`

```env
MONGO_URI=mongodb://mongo:27017/<nombre_db>
FLASK_SECRET_KEY=<clave_secreta>
GITHUB_TOKEN=<token_con_scope_contents>
APP_SLUG=<slug_del_proyecto>   # debe coincidir con urls/<slug>.json en home
```

> ⚠️ `.env` **nunca** se commitea. Está en `.gitignore`.

### Regla 8 — El script `cloudflared-start.sh` es estándar

El script en `scripts/cloudflared-start.sh` es idéntico en todos los proyectos salvo la URL en el mensaje de log. No modificar la lógica central. Si se mejora, propagar el cambio a todos los proyectos.

---

## Cómo añadir un nuevo proyecto (paso a paso)

### Paso 1 — Crear el Gist

```bash
echo '{"url":"https://placeholder.trycloudflare.com"}' > tunnel-url.json
gh gist create --public --desc "<nombre> tunnel URL" tunnel-url.json
# Guarda el GIST_ID que aparece en la URL
```

### Paso 2 — Crear el repo privado del proyecto

```bash
gh repo create cmlozanos/<nombre> --private --description "<descripción>"
```

Usar la plantilla de `catalog-app` como base:
- Copiar `Dockerfile`, `Dockerfile.cloudflared`, `docker-compose.yml`, `Makefile`, `scripts/`
- Adaptar `app/`, `seed.py`, `wsgi.py` al nuevo proyecto
- Actualizar `.env` con el nuevo `GIST_ID`

### Paso 3 — Crear la carpeta en este repo

```bash
mkdir <slug>
cp template/index.html <slug>/index.html
# Editar <slug>/index.html:
#   - Cambiar GIST_ID al del nuevo proyecto
#   - Cambiar título, emoji y color de gradiente
```

### Paso 4 — Registrar en `apps.js`

Añadir el objeto al array `APPS` en `apps.js` (ver Regla 3).

### Paso 5 — Commit y push

```bash
git add <slug>/ apps.js
git commit -m "feat: add <nombre> project"
git push
```

GitHub Pages se actualiza en ~30 segundos. ✅

---

## Estructura de este repo

```
home/
├── index.html          → Landing: lista de proyectos con estado
├── apps.js             → Registro central de proyectos
├── template/
│   └── index.html      → Plantilla de redirect para nuevos proyectos
├── catalog/
│   └── index.html      → Redirect al catálogo de productos
└── README.md           → Este archivo
```

---

## Stack de referencia (catalog-app)

| Capa | Tecnología |
|------|-----------|
| Backend | Python · Flask · Jinja2 |
| Base de datos | MongoDB 7 |
| Contenedores | Docker · Docker Compose |
| Túnel | Cloudflare Tunnel (quick tunnel) |
| Enrutador | GitHub Pages + GitHub Gist |
| CI/CD | — (deploy = `make up`) |

---

### Regla 8 — Cada servicio tiene su propio `docker-compose`

Cada proyecto usa **3 ficheros compose independientes** para poder gestionar cada capa sin afectar a las demás:

| Fichero | Servicio | Cuándo reiniciar |
|---------|----------|-----------------|
| `docker-compose.mongo.yml` | MongoDB + seed | Cambios de datos o schema |
| `docker-compose.web.yml` | App (Flask/etc.) | Cambios en el código |
| `docker-compose.cloudflared.yml` | Cloudflare Tunnel | Problemas de red/túnel |

Todos comparten una **red Docker externa** (`<proyecto>-net`) creada con `make network`.

```bash
# Reiniciar solo la app sin tocar la BBDD ni el túnel
make restart-web

# Reiniciar solo el túnel sin tirar la app
make restart-tunnel

# Arranque completo desde cero
make install && make up
```

**Nunca** usar un único `docker-compose.yml` monolítico — reiniciar un servicio no debe tirar los demás.

---

### Regla 10 — Todas las tarjetas de la home abren en pestaña nueva

Todas las entradas del array `APPS` en `apps.js` abren en `target="_blank"` (con `rel="noopener"`), independientemente de si son apps locales con túnel o juegos estáticos en GitHub Pages.

Esto permite al usuario mantener la home abierta como punto de partida mientras navega por las apps.

```js
card.target = "_blank";
card.rel    = "noopener";
```

No añadir `target="_self"` ni omitir el target en ningún caso.

---

### Regla 9 — Los personajes visuales se representan con emojis, nunca con geometría 3D

Three.js se usa **solo para fondos y efectos** (escenarios, partículas, plataformas giratorias). Los personajes o elementos principales de la UI se muestran siempre como **emojis CSS**, porque:

- Son instantáneamente reconocibles por cualquier usuario (especialmente niños)
- No requieren modelos, texturas ni geometría personalizada
- Escalan perfectamente con `font-size` / `clamp()`
- Se animan fácilmente con keyframes CSS (`float`, `shake`, `bounce`)

```css
/* ✅ Correcto */
.personaje { font-size: clamp(7rem, 18vw, 13rem); animation: emojiFloat 3s ease-in-out infinite; }

/* ❌ Nunca hacer */
/* createAnimal() con SphereGeometry + CylinderGeometry → parece un muñeco roto */
```

