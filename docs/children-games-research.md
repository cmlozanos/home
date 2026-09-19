# Children's browser games: source review

Research date: 2026-09-19. Scope: four proposed games for children aged four and six, playable without reading, on phones and tablets including Chrome 95. The sources below were inspected directly through the public GitHub API and immutable raw-source URLs. This document records research and recommendations, not proof that any resulting implementation has been approved, completed or tested on physical devices.

## Selection and popularity limits

GitHub searches used `language:javascript license:mit`, sorted by stars, for memory games, jigsaw puzzles, canvas drawing and maze generators. Stars indicate developer visibility only. They do not establish a ranking of games most played by children or suitability for a particular child's developmental needs.

| Proposed game | Source inspected | Stars observed | Useful mechanism | License |
| --- | --- | ---: | --- | --- |
| Matching pairs | [taniarascia/memory](https://github.com/taniarascia/memory) | 123 | Two-card selection, match locking and delayed reset | MIT, Copyright (c) 2018 Tania Rascia |
| Shape/picture placement | [eric-centrifuge/responsive-jigsaw-puzzle](https://github.com/eric-centrifuge/responsive-jigsaw-puzzle) | 2 | Touch drop-target hit testing and correct-position locking | MIT, Copyright 2018 Eric Harris |
| Creative drawing | [manuhabitela/drawingboard.js](https://github.com/manuhabitela/drawingboard.js) | 2,203 | Canvas brush smoothing, eraser, undo and storage | MIT, Copyright (c) 2015 Emmanuel "@Leimina" Pelletier |
| Simple maze | [keesiemeijer/maze-generator](https://github.com/keesiemeijer/maze-generator) | 159 | Backtracking maze generation with reciprocal wall removal | MIT, Copyright (c) 2017 Kees Meijer |

Other search results included JSPaint (7,881 stars), Two.js (8,661), Vue-auto-Puzzle (138), and codebox/mazes (132). The first two are mature drawing software/frameworks rather than evidence of popular preschool games. They would introduce substantially more UI or infrastructure than the proposed focused drawing game. The smaller jigsaw candidate was selected for its inspectable touch mechanics, not popularity.

## Exact source references and reusable mechanisms

### Matching pairs

Commit: `4c991ddb6b7db2f72945b09d9c8e82af6356482b`.

- [Source: js/script.original.js](https://github.com/taniarascia/memory/blob/4c991ddb6b7db2f72945b09d9c8e82af6356482b/js/script.original.js#L85-L138).
- [MIT license](https://github.com/taniarascia/memory/blob/4c991ddb6b7db2f72945b09d9c8e82af6356482b/LICENSE).

The original compares two stored names and schedules match/reset:

```js
if (firstGuess && secondGuess) {
  if (firstGuess === secondGuess) {
    setTimeout(match, delay);
  }
  setTimeout(resetGuesses, delay);
}
```

Adapt this mechanism to explicit selected-card IDs and a locked state while mismatched cards are displayed. A new round must invalidate pending timeouts. Use independently created animal/shape artwork. The original includes Mario-related images; a code repository's MIT license does not establish rights to third-party characters. Its `sort(() => 0.5 - Math.random())` shuffle is biased; use Fisher–Yates instead. Suggested levels are four, six and eight pairs, with large touch buttons and no mandatory timer. Verify double-tapping one card cannot match itself, matched cards cannot reopen, and a third tap cannot corrupt a pending comparison.

### Shape or picture placement

Commit: `94d3b9a6c0b882302417d0cc023e1bdc3807d06b`.

- [Source: js/puzzle.js touch drop-zone logic](https://github.com/eric-centrifuge/responsive-jigsaw-puzzle/blob/94d3b9a6c0b882302417d0cc023e1bdc3807d06b/js/puzzle.js#L261-L273).
- [Correct-position locking](https://github.com/eric-centrifuge/responsive-jigsaw-puzzle/blob/94d3b9a6c0b882302417d0cc023e1bdc3807d06b/js/puzzle.js#L195-L219).
- [MIT license](https://github.com/eric-centrifuge/responsive-jigsaw-puzzle/blob/94d3b9a6c0b882302417d0cc023e1bdc3807d06b/LICENSE.md).

Reusable original hit-test predicate:

```js
evt.touches[0].clientX > left &&
evt.touches[0].clientX < right &&
evt.touches[0].clientY > top &&
evt.touches[0].clientY < bottom
```

Adapt the predicate for Pointer Events coordinates, correct-shape identity and a forgiving snap zone. Tapping a piece and then its target should provide an alternative to continuous dragging. Avoid bringing over the complete implementation: it adds global event listeners per initialization, loads a remote Unsplash default image, and `isSorted` stops at `totalelements > 1`, omitting the final element. Use four/six/nine pieces or distinctive silhouettes; verify wrong-slot release, pointer cancellation, resize during drag, and completion only after every piece is placed.

Rejected after actual code inspection: [mebjas/image-jigsaw](https://github.com/mebjas/image-jigsaw/blob/bcb797ce60351641185a610f49fd965f577ba429/js/jquery.image-jigsaw.js), MIT. Despite its title, its default behavior repeatedly scrambles/reassembles an image by timer rather than implementing a playable placement puzzle. [IonicaBizau/tangram](https://github.com/IonicaBizau/tangram/blob/308d73e8b0d0083e94f4935b9e291c6c18c5f4b8/js/index.js), MIT, has useful polygon definitions but relies on right-click/Ctrl-click to rotate/flip, unsuitable as a direct tablet game.

### Creative drawing

Commit: `92e2cfae33735efdd29885a0f564578055299293`.

- [Source: js/board.js smooth brush](https://github.com/manuhabitela/drawingboard.js/blob/92e2cfae33735efdd29885a0f564578055299293/js/board.js#L593-L602).
- [Midpoint calculation](https://github.com/manuhabitela/drawingboard.js/blob/92e2cfae33735efdd29885a0f564578055299293/js/board.js#L682-L686).
- [MIT license](https://github.com/manuhabitela/drawingboard.js/blob/92e2cfae33735efdd29885a0f564578055299293/LICENSE).

Original brush core:

```js
var currentMid = this._getMidInputCoords(this.coords.current);
this.ctx.beginPath();
this.ctx.moveTo(currentMid.x, currentMid.y);
this.ctx.quadraticCurveTo(this.coords.old.x, this.coords.old.y,
  this.coords.oldMid.x, this.coords.oldMid.y);
this.ctx.stroke();
this.coords.old = this.coords.current;
this.coords.oldMid = currentMid;
```

This can be extracted into a small native Canvas 2D helper without the upstream jQuery controls. Use round caps, explicit tap dots, large palette swatches, eraser and undo icons. Preserve the drawing through orientation changes; avoid unbounded full-resolution bitmap history on old tablets. The original storage writes are not protected against quota failures, and its input reader only handles one touch. Verify short taps, fast strokes, release outside the canvas, undo/redo, resize, and denied/full storage. Multi-finger drawing needs independent stroke state per pointer.

### Simple maze

Commit: `29da89fd5b43c9e5c521de3ec76d5069d405d76c`.

- [Source: src/maze.js backtracking generator](https://github.com/keesiemeijer/maze-generator/blob/29da89fd5b43c9e5c521de3ec76d5069d405d76c/src/maze.js#L86-L163).
- [Fisher–Yates shuffle](https://github.com/keesiemeijer/maze-generator/blob/29da89fd5b43c9e5c521de3ec76d5069d405d76c/src/utils.js#L38-L49).
- [MIT license](https://github.com/keesiemeijer/maze-generator/blob/29da89fd5b43c9e5c521de3ec76d5069d405d76c/LICENSE).

Original reciprocal wall-removal core:

```js
nodes[position] = replaceAt(nodes[position], positionIndex[direction], 0);
position = next[direction];
nodes[position] = replaceAt(nodes[position], oppositeIndex[direction], 0);
nodes[position] = replaceAt(nodes[position], 0, 1);
```

The generator marks each visited cell, removes both sides of a passage and backtracks with a stack when no unvisited neighbors remain. This mechanism can be adapted to a small array of wall flags, retaining attribution. Use small grids, an animal and visible destination, large directional controls and optional swipe movement. Verify reciprocal walls, full connectivity, no wall crossing, and reachable destination across generated levels. A hint can reveal one valid next move rather than play the whole maze automatically.

## Empirical source check

Downloaded immutable `src/utils.js`, `src/entries.js` and `src/maze.js` into Node memory and evaluated together using `node:vm`; no dependency install or copied source files were needed. Generated 20 mazes for each grid size 3, 4, 5, 6 and 8. An independent breadth-first search from the first cell checked that every cell was reachable. Output:

```text
UPSTREAM maze generator: 100 generated mazes, every cell reachable in 3/4/5/6/8 grids.
```

An initial invocation mixed CommonJS `require` with top-level `await`; it failed before evaluating upstream code. Re-running explicitly as an ES module passed. This check validates generator connectivity, not the proposed game's touch controls or browser compatibility.

## Shared implementation and validation requirements

These four mechanics can run with native HTML/CSS and Canvas 2D, with no mandatory WebGL, server, remote CDN or new framework. Actual implementation choices remain subject to the main task's approved scope.

- Preserve Chrome 95 syntax/API baseline; avoid `structuredClone`, Canvas `roundRect`, CSS `color-mix`, and unguarded modern convenience APIs. Test Safari separately.
- Use Pointer Events with `touch-action` constrained to the play area and handle `pointercancel`/lost capture. Do not use native HTML drag-and-drop as the only mobile control.
- Use local vector artwork with distinct shapes as well as colors. Do not rely on modern emoji glyph coverage on Android 5.
- Size controls for small hands, retain visible home/restart controls, and avoid mandatory reading. Keep sound off initially according to the existing game preference.
- Test phone portrait/landscape, tablet, browser zoom, orientation change, offline/PWA entry and storage failure. Emulator/browser tests do not establish performance on the physical SM-T530NU.
- If copying or substantially adapting any source, distribute its complete MIT license and copyright notice, record the immutable commit, and name exactly which files/mechanisms were adapted. Inspection alone does not mean a source was actually reused.
