/* Pair-selection state adapted from Tania Rascia, memory (MIT).
 * Copyright (c) 2018 Tania Rascia. See THIRD_PARTY_NOTICES.md. */
(function (root) {
  'use strict';
  function shuffle(items, random) {
    var result = items.slice();
    random = random || Math.random;
    for (var i = result.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var value = result[i]; result[i] = result[j]; result[j] = value;
    }
    return result;
  }
  function createRound(keys, random) {
    return { cards: shuffle(keys.concat(keys), random), selected: [], matched: [], moves: 0 };
  }
  function choose(round, index) {
    if (round.selected.length === 2 || round.selected.indexOf(index) !== -1 || round.matched.indexOf(index) !== -1 || index < 0 || index >= round.cards.length) return 'ignored';
    round.selected.push(index);
    if (round.selected.length < 2) return 'first';
    round.moves++;
    if (round.cards[round.selected[0]] === round.cards[round.selected[1]]) {
      round.matched.push(round.selected[0], round.selected[1]);
      return 'match';
    }
    return 'miss';
  }
  function release(round) { round.selected = []; }
  var api = { shuffle: shuffle, createRound: createRound, choose: choose, release: release };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MemoryGarden = api;
}(typeof window !== 'undefined' ? window : this));
