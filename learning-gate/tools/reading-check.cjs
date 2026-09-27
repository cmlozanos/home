const assert = require('node:assert/strict');
const {Core} = require('../gate.js');
const words = require('../reading-words.js');
assert.equal(typeof Core.readingChallenge, 'function');
let seed = 80915;
const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const seenWords = new Set(), positions = new Set(), types = new Set();
let previous = null;
for (let i=0;i<10000;i++) {
  const round = Core.readingChallenge(words, random, previous);
  assert.equal(round.kind, 'reading');
  assert.ok(round.word.length <= 5 && round.word === round.word.toLowerCase());
  assert.equal(round.choices.length, 3);
  assert.equal(new Set(round.choices.map(item=>item.id)).size, 3);
  assert.equal(round.choices.filter(item=>item.word===round.word).length, 1);
  assert.equal(round.choices.find(item=>item.id===round.answer).word, round.word);
  for (const a of round.choices) for (const b of round.choices) if(a!==b) assert.equal(a.groups.some(group=>b.groups.includes(group)), false);
  if (previous) assert.ok(round.choices.every(item=>previous.choices.every(old=>old.id!==item.id)), 'mistake rotates all three images, not just order');
  seenWords.add(round.word);positions.add(round.choices.findIndex(item=>item.id===round.answer));previous=round;
  const mixed = Core.challenge(random, {reading:true}, words);
  types.add(mixed.kind==='math'?mixed.operator:mixed.kind);
  assert.notEqual(Core.challenge(random, {reading:false}, words).kind,'reading');
  assert.notEqual(Core.challenge(random, null, words).kind,'reading');
}
assert.equal(seenWords.size,100);assert.equal(positions.size,3);
assert.deepEqual([...types].sort(),['+','−','trace','reading'].sort());
assert.equal(Core.readingChallenge([],random,null),null);
console.log('Reading: 10,000 random rounds, 100 words, 3 answer positions, no overlapping distractors, full rotation and additive minimum challenges PASS.');
