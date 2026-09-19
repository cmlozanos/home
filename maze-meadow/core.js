/* Maze backtracking adapted from Kees Meijer's maze-generator (MIT),
 * commit 29da89fd5b43c9e5c521de3ec76d5069d405d76c, src/maze.js:86-163.
 * Original copyright (c) 2017 Kees Meijer. See THIRD_PARTY_NOTICES.md. */
(function (root) {
  'use strict';
  var directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  function random(seed) {
    var value = seed >>> 0;
    return function () { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
  }
  function generate(size, seed) {
    size = Math.max(2, Math.min(16, Math.floor(size) || 4));
    var rng = random(seed), cells = [], visited = [], stack = [0], position = 0;
    for (var i = 0; i < size * size; i++) { cells.push([true, true, true, true]); visited.push(false); }
    visited[0] = true;
    while (stack.length) {
      position = stack[stack.length - 1];
      var x = position % size, y = Math.floor(position / size), options = [];
      for (var d = 0; d < 4; d++) {
        var nx = x + directions[d][0], ny = y + directions[d][1], next = ny * size + nx;
        if (nx >= 0 && ny >= 0 && nx < size && ny < size && !visited[next]) options.push([d, next]);
      }
      if (!options.length) { stack.pop(); continue; }
      var choice = options[Math.floor(rng() * options.length)];
      cells[position][choice[0]] = false;
      cells[choice[1]][(choice[0] + 2) % 4] = false;
      visited[choice[1]] = true;
      stack.push(choice[1]);
    }
    return { size: size, seed: seed >>> 0, cells: cells };
  }
  function move(maze, position, direction) {
    if (direction < 0 || direction > 3 || !maze.cells[position] || maze.cells[position][direction]) return position;
    var x = position % maze.size + directions[direction][0], y = Math.floor(position / maze.size) + directions[direction][1];
    if (x < 0 || y < 0 || x >= maze.size || y >= maze.size) return position;
    return y * maze.size + x;
  }
  function solve(maze, start, goal) {
    var queue = [start], previous = {}, cursor = 0;
    previous[start] = -1;
    while (cursor < queue.length) {
      var current = queue[cursor++];
      if (current === goal) break;
      for (var d = 0; d < 4; d++) {
        var next = move(maze, current, d);
        if (next !== current && previous[next] === undefined) { previous[next] = current; queue.push(next); }
      }
    }
    if (previous[goal] === undefined) return [];
    var path = [], step = goal;
    while (step !== -1) { path.unshift(step); step = previous[step]; }
    return path;
  }
  var api = { generate: generate, move: move, solve: solve, directions: directions };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MeadowCore = api;
}(typeof window !== 'undefined' ? window : globalThis));
