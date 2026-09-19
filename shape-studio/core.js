/* Point/drop-zone test adapted from Eric Harris's responsive-jigsaw-puzzle
 * Copyright 2018 Eric Harris. MIT. See THIRD_PARTY_NOTICES.md. */
(function (root) {
  'use strict';
  function contains(rect, x, y) { return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom; }
  function shuffle(items, random) { var result = items.slice(); random = random || Math.random; for (var i = result.length - 1; i > 0; i--) { var j = Math.floor(random() * (i + 1)), old = result[i]; result[i] = result[j]; result[j] = old; } return result; }
  function place(placed, piece, slot) { if (placed.indexOf(slot) !== -1 || piece !== slot) return false; placed.push(slot); return true; }
  var api = { contains: contains, shuffle: shuffle, place: place };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ShapeStudio = api;
}(typeof window !== 'undefined' ? window : this));
