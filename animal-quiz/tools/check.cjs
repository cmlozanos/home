'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Q = require('../quiz-core.js');
const root = path.join(__dirname, '..');
assert.equal(Q.animals.length, 20);
assert.equal(new Set(Q.animals.map(q => q.id)).size, 20);
const expected = ['Elefante','León','Jirafa','Cocodrilo','Pingüino','Oso','Delfín','Canguro','Mariposa','Tortuga','Tigre','Mono','Flamenco','Caballo','Pulpo','Búho','Zorro','Panda','Hipopótamo','Murciélago'];
assert.deepEqual(Q.animals.map(q => q.name), expected);
const art = fs.readFileSync(path.join(root, 'assets/animals.svg'), 'utf8');
for (const q of Q.animals) {
  assert.equal(q.options.length, 4);
  assert.equal(new Set(q.options).size, 4);
  assert.equal(q.options[0], q.name);
  assert.ok(art.includes('id="' + q.id + '"'), q.id + ': missing illustration');
  for (const mode of ['short','full']) {
    const player = Q.fresh().profiles[mode];
    const round = { question:q, options:q.options.slice(), mode, phase:'quiz', earned:[] };
    assert.equal(Q.answer(player, round, 0), true);
    assert.equal(Q.answer(player, round, 0), null, 'No duplicate answer reward');
    assert.equal(player.stars, 1);
    round.phase = 'write';
    const target = mode === 'short' ? q.name.toUpperCase().slice(0, 3) : q.name.toUpperCase();
    assert.equal(Q.target(round), target);
    assert.equal(Q.write(player, round, '!'), false);
    assert.equal(player.stars, 1);
    assert.equal(Q.write(player, round, target), true);
    assert.equal(Q.write(player, round, target), false, 'No duplicate writing reward');
    assert.equal(player.stars, 2);
    assert.deepEqual(player.trophies, ['primer_acierto','escritor_novato']);
  }
}
const state = Q.fresh(), player = state.profiles.short;
let round = Q.round(player, 'short', () => 0);
assert.notEqual(round.options.indexOf(round.question.name), 0, 'Answers are shuffled');
Q.answer(player, round, round.options.findIndex(name => name !== round.question.name));
assert.equal(player.stars, 0);
assert.equal(player.answers.elephant.weight, 2);
assert.equal(Q.choose(player, () => 1.5 / 21).id, 'elephant', 'Wrong answers increase selection weight');
for (let i = 0; i < 5; i++) {
  round = Q.round(player, 'short', () => 0);
  Q.answer(player, round, round.options.indexOf(round.question.name));
}
assert.equal(player.streak, 5);
assert.equal(player.answers.elephant.weight, 1);
assert.ok(player.trophies.includes('racha_3') && player.trophies.includes('racha_5'));
assert.equal(state.profiles.full.stars, 0, 'Independent profiles');
player.stars = 49;
round = Q.round(player, 'short', () => 0); Q.answer(player, round, round.options.indexOf(round.question.name));
assert.ok(player.trophies.includes('experto_animales'));
round = Q.round(player, 'short', () => 0); Q.answer(player, round, round.options.findIndex(name => name !== round.question.name));
assert.equal(player.streak, 0); assert.equal(player.stars, 50, 'Mistakes do not remove stars');
assert.deepEqual(Q.restore(JSON.stringify(state)), state);
assert.deepEqual(Q.restore('{invalid'), Q.fresh());
assert.deepEqual(Q.restore({ version:2, profiles:{} }), Q.fresh());
const sanitized = Q.restore({ version:1, profiles:{ short:{ name:'discarded', age:99, stars:-3, trophies:['unknown'], answers:{ unknown:{ weight:999 } } } } });
assert.deepEqual(sanitized, Q.fresh(), 'No imported names, ages or unknown data');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const sandbox = { self:{ addEventListener(){} } }; vm.runInNewContext(sw, sandbox);
assert.match(sandbox.CACHE, /^animal-quiz-/);
assert.match(sw, /key\.indexOf\(PREFIX\) === 0/);
for (const asset of sandbox.ASSETS) assert.ok(fs.existsSync(path.join(root, asset === './' ? 'index.html' : asset.split('?')[0])), asset);
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest')));
assert.equal(manifest.scope, './'); assert.equal(manifest.start_url, './');
for (const icon of manifest.icons) {
  const png = fs.readFileSync(path.join(root, icon.src)), size = Number(icon.sizes.split('x')[0]);
  assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), size); assert.equal(png.readUInt32BE(20), size);
}
for (const file of ['index.html','quiz-core.js','game.js','style.css']) {
  const source = fs.readFileSync(path.join(root,file),'utf8');
  assert.doesNotMatch(source, /trycloudflare|\/api\/|THREE\.|WebGLRenderer|structuredClone\(|\.at\(|100dvh/);
}
assert.ok(sandbox.ASSETS.some(file => file.includes('learning-gate.js')));
console.log('Animal Quiz: 20 original questions, 40 writing paths, accents, weighting, trophies, independent local profiles and PWA verified.');
