# Jardín de parejas: código y licencias

Ilustraciones SVG, interfaz, niveles, audio y experiencia originales de este proyecto. Sin dependencias de red ni recursos de marcas ajenas.

Código inspeccionado: [https://github.com/taniarascia/memory](https://github.com/taniarascia/memory), commit `4c991ddb6b7db2f72945b09d9c8e82af6356482b`, archivo [js/script.original.js](https://github.com/taniarascia/memory/blob/4c991ddb6b7db2f72945b09d9c8e82af6356482b/js/script.original.js).

La máquina de selección de dos cartas, bloqueo de cartas ya seleccionadas/encontradas, comparación y reinicio de selección de core.js adapta la lógica de script.original.js. Se cambió la mezcla aleatoria con sort por Fisher–Yates, se desacopló el DOM y se añadieron controles de teclado, vista previa y temporizadores cancelables. No se han reutilizado imágenes de Mario ni otros activos del original.

## MIT License

Copyright (c) 2018 Tania Rascia

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
