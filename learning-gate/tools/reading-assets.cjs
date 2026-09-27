// Explicit --download fetches only the 100 approved ARASAAC assets. Default: offline checks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const words = require('../reading-words.js');
const imageDir = path.join(__dirname, '../reading-images');
const manifestPath = path.join(imageDir, 'manifest.json');
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function validateWords() {
  assert.equal(words.length, 100);
  assert.equal(new Set(words.map(item => item.word)).size, 100);
  assert.equal(new Set(words.map(item => item.id)).size, 100);
  words.forEach(item => {
    assert.match(item.word, /^[a-záéíóúüñ]{1,5}$/);
    assert.equal(item.word, item.word.toLocaleLowerCase('es'));
    assert.ok(Number.isSafeInteger(item.id) && item.id > 0);
    assert.ok(Array.isArray(item.groups));
    assert.equal(new Set(item.groups).size, item.groups.length);
    item.groups.forEach(group => assert.match(group, /^[a-z]+$/));
  });
}

function inspect(item, bytes) {
  assert.ok(bytes.length > 100 && bytes.length < 200000, item.word + ': size');
  assert.ok(bytes.subarray(0, 8).equals(signature), item.word + ': PNG');
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR');
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  assert.ok(width > 0 && width <= 300 && height > 0 && height <= 300, item.word + ': dimensions');
  assert.equal(bytes.toString('ascii', bytes.length - 8, bytes.length - 4), 'IEND');
  return {
    word: item.word, id: item.id, width, height, bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    source: 'https://static.arasaac.org/pictograms/' + item.id + '/' + item.id + '_300.png'
  };
}

async function request(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  assert.ok(response.ok, url + ': HTTP ' + response.status);
  return response;
}

async function download() {
  fs.mkdirSync(imageDir, { recursive: true });
  const records = new Array(words.length);
  let cursor = 0;
  // Two requests at most; one metadata request and one image request per approved word.
  async function worker() {
    while (cursor < words.length) {
      const index = cursor++;
      const item = words[index];
      const metadata = await (await request('https://api.arasaac.org/api/pictograms/es/' + item.id)).json();
      assert.equal(metadata._id, item.id);
      assert.ok(metadata.keywords.some(keyword => keyword.keyword.toLocaleLowerCase('es') === item.word), item.word + ': metadata');
      assert.equal(metadata.sex, false, item.word + ': unsuitable content');
      assert.equal(metadata.violence, false, item.word + ': unsuitable content');
      const response = await request('https://static.arasaac.org/pictograms/' + item.id + '/' + item.id + '_300.png');
      assert.match(response.headers.get('content-type'), /^image\/png/);
      const bytes = Buffer.from(await response.arrayBuffer());
      records[index] = inspect(item, bytes);
      const target = path.join(imageDir, item.id + '.png');
      if (fs.existsSync(target)) assert.ok(fs.readFileSync(target).equals(bytes), item.word + ': existing image differs; review before replacing');
      else fs.writeFileSync(target, bytes, { flag: 'wx' });
    }
  }
  await Promise.all([worker(), worker()]);
  assert.ok(records.reduce((total, item) => total + item.bytes, 0) < 2000000);
  console.log(JSON.stringify({ license: 'CC-BY-NC-SA-4.0', verified: '2026-09-27', images: records }, null, 2));
}

function check() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.license, 'CC-BY-NC-SA-4.0');
  assert.equal(manifest.images.length, 100);
  assert.equal(fs.readdirSync(imageDir).filter(file => file.endsWith('.png')).length, 100);
  const records = words.map(item => inspect(item, fs.readFileSync(path.join(imageDir, item.id + '.png'))));
  assert.deepEqual(records, manifest.images);
  const total = records.reduce((sum, item) => sum + item.bytes, 0);
  assert.ok(total < 2000000);
  console.log('Reading assets: 100 unique lowercase words <=5 letters, PNGs <=300px, SHA-256 verified; ' + total + ' bytes total.');
}

validateWords();
if (process.argv[2] === '--download') download().catch(error => { console.error(error.message); process.exitCode = 1; });
else { assert.equal(process.argv.length, 2, 'Usage: node reading-assets.cjs [--download]'); check(); }
