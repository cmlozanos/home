# cmlozanos · home

Portal público de proyectos en vivo. Reúne servicios locales publicados mediante **Cloudflare Tunnel** y juegos estáticos desplegados en **GitHub Pages**.

🌐 **URL pública:** https://cmlozanos.github.io/home

## Nuevos juegos táctiles

- [Turbo Horizonte](https://cmlozanos.github.io/home/nitro-highway/): carreras pseudo-3D con curvas, tráfico, nitro y rampas.
- [Mini Karts](https://cmlozanos.github.io/home/pocket-karts/): carreras cenitales con tres coches y tres circuitos, vueltas y controles táctiles.
- [Salto Neón](https://cmlozanos.github.io/home/pulse-path/): plataformas de un toque con tres circuitos, gravedad, puntos de control y ayudas opcionales.
- [Fruit Splash](https://cmlozanos.github.io/home/fruit-splash/): cortar frutas con varios dedos, jardín sin penalizaciones, reto de 60 segundos y aventura con bombas y tres vidas. Récords locales.
- [Órbita](https://cmlozanos.github.io/home/orbit-lab/): colisiones continuas, evolución estelar, nebulosas, agujeros negros, zonas habitables, civilizaciones y naves. Seis escenarios y guardado compatible con la versión anterior.
- [Jardín de parejas](https://cmlozanos.github.io/home/memory-garden/): memoria visual con animales y tres tamaños de tablero.
- [Taller de formas](https://cmlozanos.github.io/home/shape-studio/): encajar siluetas arrastrando o tocando, con retos progresivos.
- [Pequeño Atelier](https://cmlozanos.github.io/home/little-atelier/): dibujo libre, sellos, deshacer y guardar/exportar creaciones.
- [El jardín de los caminos](https://cmlozanos.github.io/home/maze-meadow/): laberintos generados siempre resolubles, estrellas y controles de dirección.

Son proyectos estáticos autónomos dentro de este repositorio, con Canvas 2D/SVG, scripts clásicos, sonido inicialmente apagado, iconos táctiles y recursos locales. Cada uno tiene su PWA instalable y su caché offline aislada. No requieren servidor de aplicación, anuncios, cuentas ni dependencias de producción. Primera apertura con conexión; después pueden abrirse sin red desde su acceso instalado. En Chrome usa «Instalar aplicación»/«Añadir a pantalla de inicio»; en Safari, Compartir → Añadir a pantalla de inicio.

Su objetivo de compatibilidad es Chrome 95 (incluida la tablet Android 5 indicada) y Safari con Pointer Events, además de navegadores actuales. La revisión real del motor Chromium 95 no sustituye medir la GPU, RAM y respuesta táctil de la tablet física. No es posible garantizar cualquier navegador obsoleto o cualquier dispositivo existente.

La investigación, repositorios revisados y licencias del código adaptado están en [Fruit Splash](fruit-splash/THIRD_PARTY_NOTICES.md) y [Órbita](orbit-lab/RESEARCH.md). El usuario autorizó el 19-09-2026 crear y publicar ambos juegos de principio a fin; el alcance incluye estas carpetas, sus herramientas/pruebas y sus dos entradas del catálogo. Los juegos anteriores mantienen sus enlaces.

La ampliación solicitada el 19-09-2026 añade las cuatro actividades infantiles y evoluciona Órbita dentro de `home`; no modifica el juego de coches ni sus enlaces. La comparación del museo está en [STELLAR_AUDIT.md](orbit-lab/STELLAR_AUDIT.md), y las alternativas, señales de popularidad y licencias de los juegos revisados en [children-games-research.md](docs/children-games-research.md). No se reutilizan marcas, gráficos ni código comercial de Stellar Playground.

Los tres juegos de carreras y ritmo fueron aprobados expresamente el 19-09-2026 con gráficos propios y créditos de las bases abiertas. No son versiones oficiales ni copias de los recursos de Asphalt o Geometry Dash. La procedencia, licencias y experimentos están en [racing-rhythm-research.md](docs/racing-rhythm-research.md).
El alcance, los controles y las comprobaciones de esta entrega están en [racing-release.md](docs/racing-release.md).

Estos tres juegos incluyen un reto educativo al entrar y cada diez minutos: suma/resta de números de 0 a 9 sin resultados negativos o trazo guiado de letras mayúsculas/minúsculas. La partida se congela mientras se resuelve; equivocarse no resta vidas. El tiempo cuenta también fuera de la pestaña y de noche. Es una actividad educativa local, no un control parental inviolable. El módulo compartido y su contrato se documentan en [learning-gate/README.md](learning-gate/README.md).

La autorización del 25-09-2026 amplía el nuevo bloqueo a los seis juegos educativos
anteriores: Fruit Splash, Órbita, Jardín de parejas, Taller de formas, Pequeño
Atelier y El jardín de los caminos. La partida y los temporizadores pendientes
se detienen durante el reto, conservando la pausa manual. Sus botones de salida,
y los de los tres juegos nuevos, vuelven al [catálogo de videojuegos](https://cmlozanos.github.io/games/), no al catálogo general de aplicaciones.

El service worker de Rubik limita su limpieza a `rubik-solver-*`. `check-cache-isolation.mjs` comprueba que los juegos preservan las cachés ajenas y sus versiones actuales.

### Desarrollo y validación

Requiere Node 20+ y Python 3 para los servidores opcionales de cada juego.

```sh
make install-tests         # npm ci + navegadores de prueba
make check check-games     # catálogo, sintaxis, cortes y física orbital
make test-games            # Chrome actual, teléfono horizontal/vertical y WebKit
npm run serve              # previsualización http://127.0.0.1:4177
make screenshots           # con el servidor anterior activo
make icons GAME=fruit-splash
make sync-gates            # copiar el reto canónico a los nueve juegos integrados
make check-gates           # geometría, aritmética y copias offline idénticas
```

Solo el tooling de desarrollo usa Playwright; el código servido por GitHub Pages no importa paquetes npm. Las pruebas cubren gestos reales, pausa, persistencia, multitáctil, rotación, almacenamiento bloqueado y modo offline. `?test=1` habilita diagnósticos de solo lectura.

Se puede añadir un navegador antiguo real al mismo conjunto de pruebas:

```sh
CHROME95_PATH='/ruta/a/Chromium.app/Contents/MacOS/Chromium' npm test -- --project=chrome95
```

La versión verificada procede del [archivo oficial Mac ARM de Chromium, revisión 917397](https://storage.googleapis.com/chromium-browser-snapshots/Mac_Arm/917397/chrome-mac.zip): Chromium 95.0.4630.0, SHA-256 `5ec453364a3067fc859abf5fb64c79fe453536379f8f77b7b14be9962a1117e7`. No es una sustitución del navegador del usuario ni está incluida en la descarga del juego.

GitHub Pages sirve la rama `main` existente. El workflow `Check family games` ejecuta la validación cuando cambian los juegos; no modifica la configuración de publicación. Al editar estáticos, actualizar los parámetros de versión del HTML y la versión/lista del service worker correspondiente.

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

Los juegos desplegados en GitHub Pages se registran directamente, sin carpeta de redirect ni fichero en `urls/`:

```js
{
  slug:         "my-game",
  icon:         "🎮",
  title:        "My Game",
  desc:         "Descripción corta.",
  badge:        "Juego · PWA",
  color:        "#f59e0b",
  href:         "https://cmlozanos.github.io/my-game/",
  alwaysOnline: true,
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

## Comprobaciones

```bash
make check
```

Valida la sintaxis del registro y que las aplicaciones estáticas tengan enlaces HTTPS únicos.

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
