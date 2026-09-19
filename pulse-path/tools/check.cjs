'use strict';
const assert=require('node:assert/strict');
const C=require('../core.js');
assert.equal(C.rectsOverlap({x:0,y:0,w:20,h:20},{x:19,y:0,w:20,h:20}),true);
assert.equal(C.rectsOverlap({x:0,y:0,w:20,h:20},{x:20,y:0,w:20,h:20}),false);
assert.equal(C.triangleHit({x:12,y:-28,w:8,h:8},{x:0,w:32,h:32}),true);
assert.equal(C.triangleHit({x:0,y:-32,w:4,h:4},{x:0,w:32,h:32}),false,'triangle broad-phase corner must not count');
function run(level,difficulty,fps,help){const s=C.create(level,difficulty);let accumulator=0;for(let frame=0;frame<fps*60&&s.status==='playing';frame++){accumulator+=1/fps;while(accumulator+1e-10>=C.STEP){C.step(s,C.STEP,{assist:help});accumulator-=C.STEP;}}return s;}
for(let level=0;level<3;level++)for(const difficulty of ['easy','normal']){
  const results=[30,60,120].map(fps=>run(level,difficulty,fps,true));
  results.forEach(s=>{assert.equal(s.status,'won',level+' '+difficulty+' solvable');assert.ok(s.stars.length>0);assert.ok(s.jumps>=C.levels[level].obstacles.length);});
  assert.deepEqual(results[0],results[1]);assert.deepEqual(results[1],results[2]);
  const failure=run(level,difficulty,60,false);assert.equal(failure.status,'crashed','input or assistance required');
  const restored=C.restore(failure);assert.equal(restored.status,'playing');assert.equal(restored.y,0);assert.equal(restored.x,failure.checkpoint+30);
  console.log('Course '+(level+1)+' '+difficulty+': 30/60/120Hz equal, finish at '+results[0].t.toFixed(2)+'s, '+results[0].stars.length+' stars.');
}
let s=C.create(0,'easy');C.step(s,C.STEP,{jump:true});assert.ok(s.y>0);const jumps=s.jumps;for(let i=0;i<10;i++)C.step(s,C.STEP,{jump:true});assert.equal(s.jumps,jumps,'no double jump in midair');
s=C.create(1,'easy');s.checkpoint=2420;s.stars=[0,1];const restored=C.restore(s);assert.equal(restored.gravity,1000,'checkpoint restores portal gravity');assert.deepEqual(restored.stars,[0,1]);
const immutable=JSON.stringify(C.levels);run(2,'normal',60,true);assert.equal(JSON.stringify(C.levels),immutable,'authored tracks never mutate');
console.log('Pulse Path collision, gravity, checkpoint and solvability checks passed.');
