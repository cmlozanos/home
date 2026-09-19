const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const scope = {}; vm.createContext(scope); vm.runInContext(fs.readFileSync('core.js', 'utf8'), scope); const K = scope.Karts;
function drive(s) { const n = K.nearest(s.x, s.y, s.points), target = s.points[(n.index + 6) % 120]; let a = Math.atan2(target.y - s.y, target.x - s.x) - s.angle; a = Math.atan2(Math.sin(a), Math.cos(a)); return { throttle: true, left: a < -.025, right: a > .025 }; }
for (let t = 0; t < 3; t++) for (let c = 0; c < 3; c++) { const s = K.make(t, c); for (let i = 0; i < 120 * 100 && !s.finished; i++) K.step(s, drive(s), 1 / 120); assert(s.finished, 'autopilot must physically finish track ' + t + ' car ' + c); assert.equal(s.gates, 24); assert.equal(s.laps, 2); assert(s.time > 10); }
let s = K.make(0, 0); for (let i = 0; i < 100; i++) K.step(s, {}, 1 / 120); assert.equal(s.gates, 0); s.x = s.points[30].x; s.y = s.points[30].y; K.step(s, {}, 0); assert.equal(s.gates, 0, 'cannot skip checkpoints');
for (let checkpoint = 1; checkpoint <= 24; checkpoint++) { const target = s.points[checkpoint % 12 * 10]; s.x = target.x; s.y = target.y; K.step(s, {}, 0); } assert.equal(s.laps, 2); assert(s.finished);
s = K.make(0, 0); for (let i = 0; i < 120; i++) K.step(s, { brake: true }, 1 / 120); assert(s.vx * Math.cos(s.angle) + s.vy * Math.sin(s.angle) < 0, 'reverse moves backwards');
const values = []; for (const hz of [30, 60, 120]) { s = K.make(2, 1); for (let frame = 0; frame < hz * 10; frame++) for (let step = 0; step < 120 / hz; step++) K.step(s, drive(s), 1 / 120); values.push(JSON.stringify(s)); } assert.equal(values[0], values[1]); assert.equal(values[1], values[2]);
assert.equal(fs.readFileSync('learning-gate.js', 'utf8'), fs.readFileSync('../learning-gate/gate.js', 'utf8'));
console.log('PASS: 9 physical car/course finishes, ordered 24 checkpoints, no shortcut, reverse, fixed 30/60/120 Hz, canonical gate');
