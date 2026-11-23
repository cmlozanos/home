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

// V2 packaging: local copies, matching URLs and isolated offline resources.
const familyVM = require('node:vm');
const familyHTML = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const familySW = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const familyAssets = familyVM.runInNewContext(familySW.match(/var ASSETS\s*=\s*(\[[^;]+\]);/)[1]);
assert.equal(manifest.version, '2.0.0');
assert.match(familyHTML, /href="family-v2\/family.css\?v=2.0.0"/);
assert.match(familyHTML, /src="family-v2\/family.js\?v=2.0.0"[^>]+defer/);
assert.match(familyHTML, /data-family-slot/);
for (const asset of ['family.css?v=2.0.0', 'family.js?v=2.0.0', 'playwrite-es.ttf', 'OFL.txt']) {
  const relative = 'family-v2/' + asset;
  assert(familyAssets.includes(relative), relative + ' precached with exact query');
  assert(fs.lstatSync(path.join(root, relative.split('?')[0])).isFile(), relative + ' real local file');
}
new familyVM.Script(fs.readFileSync(path.join(root, 'family-v2/family.js'), 'utf8'));
for (const match of familyHTML.matchAll(/(?:src|href)="([^"#]+\?v=[^"]+)"/g)) {
  assert(familyAssets.some(asset => asset.replace(/^\.\//, '') === match[1]), match[1] + ' exact offline URL');
}
console.log('Family V2: local assets, version 2.0.0 and exact offline URLs verified.');

for (const index of [NaN, Infinity, 0.5, '0', undefined, null]) { const invalid = game.createRound([0, 1]); assert.equal(game.choose(invalid, index), 'ignored', 'Invalid card index'); assert.equal(invalid.selected.length, 0); }
