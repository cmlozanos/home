const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const scope = {}; vm.createContext(scope); vm.runInContext(fs.readFileSync('core.js', 'utf8'), scope); const H = scope.Highway;
const near = H.project({ z: 1000 }, 0, 800, 0, 1, 800, 400, 1100), far = H.project({ z: 2000 }, 0, 800, 0, 1, 800, 400, 1100); assert.equal(near.w, far.w * 2);
for (let t = 0; t < 3; t++) for (let c = 0; c < 3; c++) { const s = H.make(t, c); for (let i = 0; i < 120 * 160 && !s.finished; i++) H.step(s, { assist: true, boost: true }, 1 / 120); assert(s.finished, 'every circuit/car can finish'); assert(Number.isFinite(s.x)); assert(s.nitro >= 0 && s.nitro <= 1); }
let s = H.make(0, 0); s.z = s.ramps[0].z - 20; s.x = s.ramps[0].x; s.speed = 950; for (let i = 0; i < 10; i++) H.step(s, { throttle: true, boost: true }, 1 / 120); assert.equal(s.jumps, 1); assert(s.flight > 1);
s = H.make(0, 0); s.z = 2500; s.x = s.traffic[0].x; s.speed = 900; for (let i = 0; i < 40; i++) H.step(s, { throttle: true }, 1 / 120); assert.equal(s.bumps, 1); assert(s.speed < 900);
const values = []; for (const hz of [30, 60, 120]) { s = H.make(1, 1); for (let frame = 0; frame < hz * 10; frame++) for (let step = 0; step < 120 / hz; step++) H.step(s, { throttle: true, boost: true }, 1 / 120); values.push(JSON.stringify(s)); } assert.equal(values[0], values[1]); assert.equal(values[1], values[2]);
const before = JSON.stringify(s); s.finished = true; const finished = JSON.stringify(s); H.step(s, { throttle: true }, 5); assert.equal(JSON.stringify(s), finished); assert.notEqual(before, finished);
assert.equal(fs.readFileSync('learning-gate.js', 'utf8'), fs.readFileSync('../learning-gate/gate.js', 'utf8'));
console.log('PASS: 9 car/course finishes, projection, traffic, turbo jump, fixed 30/60/120 Hz, finished freeze, canonical gate');
