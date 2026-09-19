'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const game = require('../core.js');
const rect = { left:10, top:20, right:110, bottom:120 };
assert.equal(game.contains(rect, 50, 60), true);
assert.equal(game.contains(rect, 10, 120), true, 'Edges accept an imprecise finger');
assert.equal(game.contains(rect, 9, 50), false);
assert.equal(game.contains(rect, 50, 121), false);
const shapes = ['circle', 'triangle', 'square', 'star', 'oval', 'rectangle', 'diamond', 'hexagon'];
for (const size of [4,6,8]) {
  const placed = [];
  assert.equal(game.place(placed, 'circle', 'triangle'), false);
  assert.equal(game.place(placed, 'circle', 'oval'), false, 'Similar geometry is not equivalent');
  assert.equal(game.place(placed, 'square', 'rectangle'), false);
  for (const shape of shapes.slice(0, size)) {
    assert.equal(game.place(placed, shape, shape), true);
    assert.equal(game.place(placed, shape, shape), false, 'Completed slots cannot count twice');
  }
  assert.equal(placed.length, size);
}
const shuffled = game.shuffle(shapes, () => .2);
assert.notDeepEqual(shuffled, shapes);
assert.deepEqual(shuffled.slice().sort(), shapes.slice().sort());
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
console.log('Shape Studio: drop hit-tests, geometry matching, locking, levels and offline shell checks passed.');
