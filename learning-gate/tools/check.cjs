'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { Core } = require('../gate.js');
assert.equal(Core.interval, 600000);
assert.equal(Core.letters.length, 54);
assert.equal(new Set(Core.letters).size, 54);
let seed = 28179;
function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
const seen = new Set();
for (let i = 0; i < 10000; i++) {
  const c = Core.challenge(random); seen.add(c.kind === 'math' ? c.operator : c.kind);
  if (c.kind === 'math') {
    assert.ok(Number.isInteger(c.a) && c.a >= 0 && c.a <= 9);
    assert.ok(Number.isInteger(c.b) && c.b >= 0 && c.b <= 9);
    assert.ok(Number.isInteger(c.answer) && c.answer >= 0 && c.answer <= 9);
    assert.equal(c.answer, c.operator === '+' ? c.a + c.b : c.a - c.b);
  } else assert.ok(Core.glyphs[c.letter]);
}
assert.deepEqual([...seen].sort(), ['+', 'trace', '−'].sort());
let strokeCount = 0;
for (const letter of Core.letters) {
  const state = Core.newTrace(letter);
  for (const stroke of Core.glyphs[letter]) {
    stroke.forEach(p => { assert.ok(p[0] >= 0 && p[0] <= 100); assert.ok(p[1] >= 0 && p[1] <= 100); });
    assert.ok(Core.beginTrace(state, stroke[0]), letter + ' starts');
    for (const point of stroke.slice(1)) assert.ok(Core.moveTrace(state, point), letter + ' follows its path');
    assert.ok(Core.endTrace(state, false), letter + ' completes stroke');
    strokeCount++;
  }
  assert.equal(state.index, state.strokes.length, letter + ' complete');
}
let state = Core.newTrace('O');
assert.equal(Core.beginTrace(state, [1, 1]), false, 'cannot start away from guide');
assert.ok(Core.beginTrace(state, Core.glyphs.O[0][0]));
assert.equal(Core.endTrace(state, false), false, 'a touch alone cannot trace a circle');
Core.beginTrace(state, Core.glyphs.O[0][0]);
assert.equal(Core.moveTrace(state, [50,86]), false, 'a chord cannot shortcut a curved guide');
assert.equal(Core.endTrace(state, false), false);
state = Core.newTrace('L');
Core.beginTrace(state, Core.glyphs.L[0][0]);
for (const p of Core.glyphs.L[0].slice(1)) Core.moveTrace(state,p);
assert.equal(Core.endTrace(state, true), false, 'cancellation never completes a stroke');
assert.equal(state.index,0);
Core.beginTrace(state, Core.glyphs.L[0][0]);
assert.equal(Core.moveTrace(state,[95,5]),false,'off-path scribble rejected');
assert.equal(Core.moveTrace(state,[77,85]),false,'cannot recover failed stroke without retry');
assert.equal(Core.endTrace(state,false),false);
state=Core.newTrace('T');
assert.equal(Core.beginTrace(state,[50,85]),false,'strokes must start in guided order');
let clock=0,timerSequence=0;
const nativeTimers=new Map();
const sandbox={module:{exports:{}},performance:{now:()=>clock},setTimeout:(fn,delay)=>{const id=++timerSequence;nativeTimers.set(id,{fn,at:clock+delay});return id;},clearTimeout:id=>nativeTimers.delete(id)};
vm.runInNewContext(readFileSync(join(__dirname,'../gate.js'),'utf8'),sandbox);
const timers=sandbox.module.exports.createTimers();
function advance(ms){const target=clock+ms;for(;;){const due=[...nativeTimers.entries()].filter(([,t])=>t.at<=target).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;clock=due[1].at;nativeTimers.delete(due[0]);due[1].fn();}clock=target;}
const fired=[];
timers.set(()=>fired.push('match'),600);
advance(200);timers.pause();timers.pause();advance(900000);
assert.equal(fired.length,0,'paused game callbacks never fire');
timers.set(()=>fired.push('created-while-paused'),450);
timers.resume();timers.resume();advance(399);assert.equal(fired.length,0);
advance(1);assert.deepEqual(fired,['match'],'remaining active delay preserved');
advance(50);assert.deepEqual(fired,['match','created-while-paused']);
const cancelled=timers.set(()=>fired.push('cancelled'),100);timers.pause();timers.clear(cancelled);timers.resume();advance(100);
assert.equal(fired.length,2,'cancel works while paused');
timers.set(()=>{fired.push('parent');timers.set(()=>fired.push('child'),10);},10);advance(20);
assert.deepEqual(fired.slice(-2),['parent','child'],'callbacks can schedule other callbacks');
console.log('Learning gate: 10,000 arithmetic samples, 54 letters / ' + strokeCount + ' strokes, rejection/cancellation and pausable timer checks passed.');
