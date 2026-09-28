'use strict';
const assert = require('node:assert/strict');
const {Core} = require('../gate.js');
const words = require('../reading-words.js');
const types = ['addition','subtraction','trace','reading'];
let seed = 280926;
const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const kind = round => round.kind === 'math' ? (round.operator === '+' ? 'addition' : 'subtraction') : round.kind;
for (let mask=1;mask<(1<<types.length);mask++) {
  const selected = types.filter((_,index)=>mask&(1<<index)), seen = new Set();
  for(let i=0;i<500;i++) {
    const round=Core.challenge(random,{version:2,challenges:selected,reading:selected.includes('reading')},words);
    assert(selected.includes(kind(round)), 'only selected types: '+selected+' got '+kind(round));
    seen.add(kind(round));
  }
  assert.deepEqual([...seen].sort(),selected.slice().sort(),'every selected type reachable');
}
for(const challenges of [[],['unknown'],['reading','unknown'],['reading','reading'],'reading',null]) {
  const seen=new Set();
  for(let i=0;i<100;i++)seen.add(kind(Core.challenge(random,{challenges,reading:true},words)));
  assert.deepEqual([...seen].sort(),types.slice(0,3).sort(),'invalid selection uses established defaults');
}
const missing=Core.challenge(()=>.5,{challenges:['reading']},null);
assert.equal(missing.kind,'reading');assert.equal(missing.answer,null,'missing reading assets never substitutes another type');
console.log('Challenge selections: all 15 nonempty combinations, exclusive single types, invalid fallback and reading failure containment PASS.');
