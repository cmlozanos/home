'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const game = require('../core.js');
for (const pairs of [4, 6, 8]) {
  const keys = Array.from({length:pairs}, (_, i) => i);
  const round = game.createRound(keys, () => .37);
  assert.equal(round.cards.length, pairs * 2);
  for (const key of keys) assert.equal(round.cards.filter(value => value === key).length, 2);
  for (const key of keys) {
    const indices = round.cards.map((value, i) => value === key ? i : -1).filter(i => i >= 0);
    assert.equal(game.choose(round, indices[0]), 'first');
    assert.equal(game.choose(round, indices[0]), 'ignored', 'Cannot match a card with itself');
    assert.equal(game.choose(round, indices[1]), 'match');
    assert.equal(game.choose(round, indices[1]), 'ignored');
    game.release(round);
    assert.equal(game.choose(round, indices[0]), 'ignored', 'Completed cards are locked');
  }
  assert.equal(round.matched.length, pairs * 2);
  assert.equal(round.moves, pairs);
}
const miss = { cards:[1,2,1,2], selected:[], matched:[], moves:0 };
assert.equal(game.choose(miss, 0), 'first');
assert.equal(game.choose(miss, 1), 'miss');
assert.equal(game.choose(miss, 2), 'ignored', 'A third card cannot flip during a comparison');
assert.equal(miss.matched.length, 0);
game.release(miss);
assert.equal(game.choose(miss, 0), 'first');
assert.notDeepEqual(game.shuffle([1,2,3,4], () => 0), [1,2,3,4]);
const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest')));
assert.equal(manifest.scope, './');
assert.equal(manifest.start_url, './');
for (const icon of manifest.icons) {
  const png = fs.readFileSync(path.join(root, icon.src));
  assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a');
  const size = Number(icon.sizes.split('x')[0]);
  assert.equal(png.readUInt32BE(16), size);
  assert.equal(png.readUInt32BE(20), size);
}
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
assert.match(sw, /key\.indexOf\(PREFIX\) === 0/);
for (const file of ['index.html', 'game.js', 'core.js', 'style.css', 'icon.svg', 'THIRD_PARTY_NOTICES.md']) assert.ok(fs.existsSync(path.join(root, file)), file);
for (const file of ['game.js', 'core.js', 'style.css']) assert.doesNotMatch(fs.readFileSync(path.join(root, file), 'utf8'), /structuredClone\(|\.at\(|color-mix\(/);
console.log('Memory Garden: deck, pair locking, completion, shuffle and offline shell checks passed.');
