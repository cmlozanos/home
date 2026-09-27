const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../learning-gate/READING_WORDS.md'), 'utf8');
const rows = [...source.matchAll(/^\| (\d+) \| ([a-záéíóúüñ]+) \| (\d+) \| .*?https:\/\/arasaac\.org\/pictograms\/es\/(\d+)\) \|$/gm)];
assert.equal(rows.length, 100);
assert.equal(new Set(rows.map(row => row[2])).size, 100);
assert.equal(new Set(rows.map(row => row[4])).size, 100);
rows.forEach((row, index) => {
  assert.equal(Number(row[1]), index + 1);
  assert.equal(row[2], row[2].toLocaleLowerCase('es'));
  assert.ok(Array.from(row[2]).length <= 5, row[2]);
  assert.equal(Array.from(row[2]).length, Number(row[3]));
});
console.log('Reading word catalogue: 100 unique lowercase words, at most five letters, with unique source references.');
