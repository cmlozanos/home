# Taller de formas: código y licencias

Ilustraciones SVG, interfaz, niveles, audio y experiencia originales de este proyecto. Sin dependencias de red ni recursos de marcas ajenas.

Código inspeccionado: [https://github.com/eric-centrifuge/responsive-jigsaw-puzzle](https://github.com/eric-centrifuge/responsive-jigsaw-puzzle), commit `94d3b9a6c0b882302417d0cc023e1bdc3807d06b`, archivo [js/puzzle.js](https://github.com/eric-centrifuge/responsive-jigsaw-puzzle/blob/94d3b9a6c0b882302417d0cc023e1bdc3807d06b/js/puzzle.js).

La función contains de core.js adapta el hit-test rectangular de touchmove en js/puzzle.js (líneas 261–273). La colocación compara la identidad de la pieza y su destino antes de bloquearla, simplificando correctTiles (líneas 195–219). Se sustituyó drag HTML por Pointer Events, se añadieron tap y teclado, se eliminó la dependencia de fotos remotas y todos los dibujos son originales. No se reutiliza isSorted del original, que omite la última pieza.

## MIT License

Copyright 2018 Eric Harris

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
