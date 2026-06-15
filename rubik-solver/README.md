# Rubik Solver 3x3

Aplicación web estática servida desde GitHub Pages en:

<https://cmlozanos.github.io/home/rubik-solver/>

## Funcionalidad

- Entrada explícita del patrón por selección de color o por detección de cámara/foto.
- Cubo 3D interactivo con rotación táctil/ratón y pintado directo de pegatinas.
- Diseño mobile-first con paleta táctil sticky y acción de resolver prioritaria.
- Editor plano de las 54 pegatinas en orden `U R F D L B`.
- Entrada asistida por foto/cámara para muestrear una cara cada vez.
- Validación de conteos, piezas, orientaciones y paridad antes de resolver.
- Solución paso a paso con movimientos Singmaster.

## Algoritmo

El solver usa `cube.js`, librería MIT que implementa el algoritmo de dos fases de Herbert Kociemba para cubos 3x3. El motor se inicializa en un Web Worker para evitar bloquear la interfaz durante la generación de tablas.

Fuentes:

- <https://kociemba.org/math/imptwophase.htm>
- <https://github.com/ldez/cubejs>

## Licencia de terceros

Los archivos en `vendor/cubejs/` proceden de `cubejs@1.3.2` y conservan su licencia MIT en `vendor/cubejs/LICENSE`.
