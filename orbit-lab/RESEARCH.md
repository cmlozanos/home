# Investigación y procedencia · 19 septiembre 2026

Solicitud: juego web nuevo inspirado en la interacción de Stellar Playground, jugable en teléfonos y tabletas antiguas/modernas. El usuario autorizó la implementación y publicación completas, sin preguntas. Este trabajo está limitado a `home/orbit-lab/` y no modifica juegos existentes.

## Referencia de producto

Se leyó el artículo oficial de Ideum, publicado el 6 de septiembre de 2023:

https://ideum.com/news/stellar-playground-ideum-pano

Describe un producto de Clark Planetarium que usa una paleta de soles y planetas, arrastrar/soltar/lanzar, gravedad entre todos los cuerpos y colaboración en pantallas multitáctiles. Órbita adopta esas ideas generales con una interfaz y dibujos originales para dispositivos pequeños. No usa código, recursos, fotografías ni marcas del producto de Ideum; tampoco promete la capacidad física de diez contactos en pantallas que no la soportan.

## Código JavaScript inspeccionado

1. **ybrodsky/gravity**, MIT, Copyright (c) 2016 Yael Brodsky.
   - https://github.com/ybrodsky/gravity
   - Revisión consultada: `8e6fa1e5b6c989fedf9ac12506d5a35c7f157cf6`.
   - Se leyeron `src/gravity.js`, `src/celestial.js`, `src/universe.js`, `src/vector.js` y `LICENSE` mediante GitHub API/raw.
   - Se reutilizan sin cambios funcionales el constructor y `Gravity.prototype.calculateAcceleration` de `src/gravity.js` en `vendor/gravity.js`, con atribución y licencia completa.
   - No se reutiliza la simulación completa: el original usa eventos solo de ratón, temporizadores separados de 200/10 ms, normalización de dirección mediante signos por eje y fusión que no conserva el momento. Eso no satisface el requisito de órbitas estables y multitáctil. Se añade un integrador nuevo de paso fijo y normalización vectorial correcta alrededor del núcleo reutilizado.
2. **liot234/N-Body-Sim-JS**.
   - https://github.com/liot234/N-Body-Sim-JS
   - Se inspeccionaron el árbol raíz y `Nbody.js`: presenta interfaz jQuery con dimensiones fijas 1300×1300, manejadores de ratón registrados dentro del bucle y aproximaciones gravitatorias no adecuadas para este juego.
   - No hay licencia visible en la raíz consultada; no se copia código.
3. **jdiwnab/OrbitSim**.
   - https://github.com/jdiwnab/OrbitSim
   - Los metadatos de GitHub devuelven `license: null`; no se selecciona para reutilización.

## Experimento verificable y decisión

Se adaptó el núcleo MIT en un experimento mínimo de dos cuerpos. `node tools/check.mjs` simula doce periodos orbitales con paso 1/120 s, exige variación radial menor al 2 %, conservación del momento y fusión con conservación de masa/momento. También ejecuta 1.200 pasos de una configuración densa de 24 cuerpos. Es la misma implementación usada por el juego; no es una fórmula duplicada solo para pruebas.

La elección de Canvas2D y scripts clásicos permite dibujar todos los recursos localmente con APIs de Chrome 95, evita el coste y las limitaciones de WebGL y mantiene los mismos archivos para dispositivos nuevos. La experiencia añade colocación con velocidad circular para principiantes, lanzamiento vectorial para explorar, límites de partículas/cuerpos y tres condiciones iniciales. La comprobación estática impide APIs incompatibles conocidas; la compatibilidad y fluidez definitivas de una SM-T530NU requieren probar el hardware real.
