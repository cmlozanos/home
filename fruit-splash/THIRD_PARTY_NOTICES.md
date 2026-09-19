# Código adaptado y referencias

`core.js: distanceToSegmentSq` adapta a JavaScript la función del proyecto
[matheussiqueira-dev/Clone-Fruit-Ninja](https://github.com/matheussiqueira-dev/Clone-Fruit-Ninja/blob/323795f40db404b236abab822c1cef84f5c05ce0/lib/gameLogic.ts),
commit `323795f40db404b236abab822c1cef84f5c05ce0`. La adaptación conserva las matemáticas originales y añade exposición para navegador y pruebas Node. No se reutilizan marcas, imágenes ni sonidos de Fruit Ninja.

## Licencia del código adaptado

MIT License

Copyright (c) 2026 Matheus Henrique Dias Siqueira

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Investigación y decisión (2026-09-19)

- **Clone-Fruit-Ninja**, commit anterior: revisados `lib/gameLogic.ts`, tests y dependencias. Se reutiliza únicamente el cálculo de distancia a un segmento. Su React 19, MediaPipe/WASM y backend no aportan ventajas a este juego móvil y offline.
- [Rehan4010/Fruit-Ninja-](https://github.com/Rehan4010/Fruit-Ninja-/tree/afcad78a239ad16aaa105c38b5c631e5e8637b52), MIT: revisado el Canvas de `index.html`, mitades con clipping y movimiento. Física por frame y detección solo en la posición puntual del cursor; no se copia código.
- [abdurrahman101bd/fruit-ninja-game](https://github.com/abdurrahman101bd/fruit-ninja-game/tree/ed64f5f0f72f790a2e3fbf21f9e67442321d79eb), MIT: revisado `script.js`, combos, vidas, audio y pausa. Solo primer dedo y emojis variables por sistema; no se copia código.

PoC de la función reutilizada: cruce rápido, fallo perpendicular, extremo acotado y segmento de longitud cero. Casos reproducibles en `tools/check.cjs`. Se elige Canvas 2D local con sprites originales prerenderizados, paso fijo, eventos por pointerId y recursos limitados. Ninguna dependencia de red para jugar.
