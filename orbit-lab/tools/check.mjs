import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({ console });
for (const file of ['vendor/gravity.js', 'physics.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
const P = context.OrbitPhysics;
const sun = P.body('star', 0, 0);
const planet = P.orbit('ocean', 220, 0, sun);
const universe = [sun, planet];
const period = 2 * Math.PI * Math.sqrt(220 ** 3 / (P.G * sun.mass));
const momentum = universe.reduce((sum, b) => sum + b.mass * b.vy, 0);
let minRadius = Infinity, maxRadius = 0;
for (let i = 0; i < Math.ceil(period * 12 * 120); i++) {
  P.step(universe, 1 / 120);
  const radius = Math.hypot(planet.x - sun.x, planet.y - sun.y);
  minRadius = Math.min(minRadius, radius);
  maxRadius = Math.max(maxRadius, radius);
  assert.equal(universe.length, 2, 'Circular orbit must not collide over twelve full periods');
  for (const b of universe) assert.ok([b.x, b.y, b.vx, b.vy].every(Number.isFinite));
}
assert.ok((maxRadius - minRadius) / 220 < 0.02, 'Circular orbit radius must stay within 2%');
assert.ok(Math.abs(universe.reduce((sum, b) => sum + b.mass * b.vy, 0) - momentum) < 1e-7, 'N-body step conserves momentum');
const merging = [P.body('rock', 0, 0, 10, 3), P.body('ocean', 1, 0, -2, 7)];
const mass = merging.reduce((sum, b) => sum + b.mass, 0);
const px = merging.reduce((sum, b) => sum + b.mass * b.vx, 0);
P.step(merging, 1 / 120);
assert.equal(merging.length, 1, 'Colliding planets merge');
assert.ok(Math.abs(merging[0].mass - mass) < 1e-10, 'Collision conserves mass');
assert.ok(Math.abs(merging[0].vx * merging[0].mass - px) < 1e-10, 'Collision conserves momentum');
const crowd = Array.from({ length: 24 }, (_, i) => P.body(i % 6 === 0 ? 'star' : 'rock', Math.cos(i) * i * 9, Math.sin(i) * i * 9));
for (let i = 0; i < 1200; i++) P.step(crowd, 1 / 120);
assert.ok(crowd.every(b => [b.x, b.y, b.vx, b.vy].every(Number.isFinite)), 'Dense 24-body collisions remain finite');
for (const file of ['game.js', 'physics.js', 'style.css', 'vendor/gravity.js']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.ok(!/structuredClone\s*\(|\.roundRect\s*\(|\.at\s*\(|color-mix\s*\(/.test(source), `${file}: no known Chrome 95 incompatible runtime APIs`);
}
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
for (const icon of manifest.icons) assert.ok(fs.existsSync(path.join(root, icon.src)), `PWA icon ${icon.src} exists`);
console.log(`✓ 12 orbital periods stable: ${minRadius.toFixed(3)}–${maxRadius.toFixed(3)} world units`);
console.log('✓ Momentum, collision mass/momentum, dense 24-body stability, Chrome 95 API checks, PWA icons');
