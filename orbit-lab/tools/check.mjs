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
function totals(bodies) {
  return bodies.reduce((sum, b) => [sum[0] + b.mass, sum[1] + b.mass * b.vx, sum[2] + b.mass * b.vy], [0, 0, 0]);
}
function conserves(before, bodies, label) {
  totals(bodies).forEach((value, i) => assert.ok(Math.abs(value - before[i]) < 1e-7, `${label}: mass and both momentum components conserved`));
}
const tangency = [P.body('rock', 0, 0), P.body('rock', 20, 0)];
P.step(tangency, 0);
assert.equal(tangency.length, 1, 'Exact visual-rim contact merges, without invisible 78% collision radii');
const rim = [P.body('rock', 0, 0), P.body('rock', 19, 0)];
P.step(rim, 0);
assert.equal(rim.length, 1, 'Visible overlap merges');
const crossing = [P.body('rock', -100, 0, 40000, 5), P.body('ocean', 100, 0, -40000, -2)];
const crossingBefore = totals(crossing);
P.step(crossing, 1 / 120);
assert.equal(crossing.length, 1, 'Swept collision catches bodies that cross completely in one frame');
conserves(crossingBefore, crossing, 'High-speed collision');
const nearMiss = [P.body('rock', -100, 0, 40000, 0), P.body('rock', 100, 25, -40000, 0)];
P.step(nearMiss, 1 / 120);
assert.equal(nearMiss.length, 2, 'Swept collision does not merge a high-speed near miss');
// Bodies 1+2 touch first. Their combined radius then touches body 0, which was
// checked earlier: a single left-to-right collision pass would miss this chain.
const chain = [P.body('rock', 0, 0, 1, 2), P.body('rock', 21, -10, -3, 4), P.body('rock', 21, 10, 5, -6)];
const chainBefore = totals(chain);
P.step(chain, 0);
assert.equal(chain.length, 1, 'Dense chain rechecks previously visited pairs in the same step');
conserves(chainBefore, chain, 'Dense chain');
const ignition = [P.setSize(P.body('giant', 0, 0, 1, 3), 1.7), P.body('rock', 0, 0, -1, -3)];
const ignitionBefore = totals(ignition), ignitionEvents = [];
P.step(ignition, 0, (b, e) => ignitionEvents.push(e.kind));
assert.equal(ignition[0].type, 'protostar', 'Enough merged planet mass ignites a protostar');
assert.deepEqual(ignitionEvents, ['ignite']);
conserves(ignitionBefore, ignition, 'Ignition');
const ordinarySun = [P.body('star', 0, 0), P.body('rock', 0, 0)];
P.step(ordinarySun, 0);
assert.equal(ordinarySun[0].type, 'star', 'Small planet does not collapse a normal sun');
for (const [addedMass, expectedType] of [[15, 'white-star'], [30, 'blue-star']]) {
  const growingStars = [P.body('star', 0, 0, 2, -3), P.body('star', 0, 0, -4, 5)];
  growingStars[0].stageAge = 25;
  growingStars[1].mass = addedMass;
  const beforeGrowth = totals(growingStars);
  P.step(growingStars, 0);
  assert.equal(growingStars[0].type, expectedType, 'Merged main-sequence stars reclassify by combined mass');
  assert.equal(growingStars[0].stageAge, 0, 'A newly entered stellar family starts its own stage clock');
  conserves(beforeGrowth, growingStars, 'Main-sequence merger');
}
const collapse = [P.body('blue-star', 0, 0, 3, 6), P.body('blue-star', 0, 0, -2, -4)];
const collapseBefore = totals(collapse), collapseEvents = [];
P.step(collapse, 0, (b, e) => collapseEvents.push(e.kind));
assert.equal(collapse[0].type, 'blackhole', 'Massive merger collapses into black hole');
assert.deepEqual(collapseEvents, ['collapse']);
conserves(collapseBefore, collapse, 'Black-hole creation');
collapse.push(P.body('giant', collapse[0].x, collapse[0].y, 9, -9));
const accreteBefore = totals(collapse);
P.step(collapse, 0, (b, e) => collapseEvents.push(e.kind));
assert.equal(collapse.length, 1);
assert.equal(collapse[0].type, 'blackhole');
assert.equal(collapseEvents[1], 'accrete');
conserves(accreteBefore, collapse, 'Black-hole accretion');
const protectedPlanet = P.body('ocean', 0, 0), consumingSun = P.body('star', 0, 0);
Object.assign(protectedPlanet, { locked: true, orbitLocked: true, anchorId: consumingSun.id, orbitRadius: 180, orbitPhase: 1, lifeStage: 6, habitableTime: 48 });
const protectedMerge = [protectedPlanet, consumingSun], consumedEvents = [];
P.step(protectedMerge, 0, (b, e) => consumedEvents.push(e));
assert.equal(protectedMerge[0].type, 'star');
assert.equal(protectedMerge[0].locked, false, 'An assisted orbit does not permanently anchor a merged star');
assert.equal(protectedMerge[0].orbitLocked, false);
assert.equal(protectedMerge[0].anchorId, undefined);
assert.equal(protectedMerge[0].lifeStage, 0, 'Stellar remnants do not inherit civilizations');
assert.equal(protectedMerge[0].habitableTime, 0);
assert.equal(consumedEvents[0].survivorId, protectedPlanet.id);
assert.equal(consumedEvents[0].consumedId, consumingSun.id, 'UI can reconcile pointers to consumed bodies');
const inhabited = P.body('ocean', 0, 0), pebble = P.body('rock', 0, 0);
Object.assign(inhabited, { lifeStage: 4, habitableTime: 33, age: 17 });
const inhabitedMerge = [pebble, inhabited];
P.step(inhabitedMerge, 0);
assert.equal(inhabitedMerge[0].lifeStage, 4, 'A rocky merger inherits its dominant planet civilization');
assert.equal(inhabitedMerge[0].habitableTime, 33);
assert.equal(inhabitedMerge[0].age, 17);
const explicitAnchor = P.body('rock', 0, 0), nearbyPlanet = P.body('ocean', 5, 0);
explicitAnchor.locked = true;
const explicitMerge = [nearbyPlanet, explicitAnchor];
P.step(explicitMerge, 0);
assert.equal(explicitMerge[0].locked, true, 'Explicit user lock survives merger');
assert.equal(explicitMerge[0].x, 0);
for (const [stellarMass, mainStage, giantStage, remnant] of [
  [5, 'red-dwarf', 'red-giant', 'white-dwarf'],
  [30, 'star', 'red-giant', 'white-dwarf'],
  [45, 'white-star', 'red-giant', 'pulsar'],
  [50, 'blue-star', 'supergiant', 'pulsar'],
  [75, 'blue-star', 'supergiant', 'magnetar'],
  [100, 'blue-star', 'mega-giant', 'blackhole']
]) {
  const evolving = [P.body('protostar', 0, 0, 12, -8)];
  evolving[0].mass = stellarMass;
  const beforeEvolution = totals(evolving), events = [];
  P.evolve(evolving, 8, (b, e) => events.push(e.kind));
  assert.equal(evolving[0].type, mainStage);
  P.evolve(evolving, P.lifetimes[mainStage], (b, e) => events.push(e.kind));
  assert.equal(evolving[0].type, giantStage);
  P.evolve(evolving, P.lifetimes[giantStage], (b, e) => events.push(e.kind));
  assert.equal(evolving[0].type, remnant, `Stellar mass ${stellarMass} produces ${remnant}`);
  assert.deepEqual(events, ['ignite', 'expand', remnant === 'blackhole' ? 'collapse' : 'supernova', 'eject']);
  assert.equal(evolving.length, 2, 'Stellar death releases a physical nebula');
  assert.equal(evolving[1].type, 'nebula');
  assert.ok(Math.hypot(evolving[0].x - evolving[1].x, evolving[0].y - evolving[1].y) > evolving[0].radius + evolving[1].radius, 'Ejected cloud starts outside the remnant');
  conserves(beforeEvolution, evolving, 'Stellar evolution');
}
const cappedEvolution = Array.from({ length: 24 }, (_, i) => P.body(i === 0 ? 'red-giant' : 'rock', i * 1000, 0));
const cappedBefore = totals(cappedEvolution);
P.evolve(cappedEvolution, 15);
assert.equal(cappedEvolution.length, 24, 'Stellar ejection respects object budget');
assert.equal(cappedEvolution[0].type, 'white-dwarf');
conserves(cappedBefore, cappedEvolution, 'Capped stellar evolution retains all mass');
const cloud = P.body('nebula', 0, 0), cloudMass = cloud.mass, cloudRadius = cloud.radius;
P.evolve([cloud], 10);
assert.equal(cloud.type, 'protostar');
assert.equal(cloud.mass, cloudMass);
assert.ok(cloud.radius < cloudRadius, 'Nebula visibly condenses');
P.evolve([cloud], 100000);
assert.equal(cloud.type, 'white-dwarf', 'Large elapsed times terminate at a stable remnant');
const smallCloud = P.body('nebula', 0, 0, 7, -4);
smallCloud.mass = .4;
const smallCloudUniverse = [smallCloud], smallCloudBefore = totals(smallCloudUniverse), smallCloudEvents = [];
P.evolve(smallCloudUniverse, 100000, (b, e) => smallCloudEvents.push(e.kind));
assert.equal(smallCloud.type, 'rock', 'A cloud below ignition mass condenses into a planet');
assert.equal(smallCloudUniverse.length, 1, 'Large elapsed time terminates after planetary condensation');
assert.deepEqual(smallCloudEvents, ['condense']);
conserves(smallCloudBefore, smallCloudUniverse, 'Low-mass cloud condensation');
const legacy = { type: 'ocean', x: 0, y: 0, vx: 0, vy: 0, mass: 0.07, radius: 12 };
P.normalize(legacy);
assert.equal(legacy.age, 0); assert.equal(legacy.stageAge, 0);
assert.equal(legacy.locked, false); assert.equal(legacy.held, false);
assert.equal(legacy.sizeScale, 1);
const resized = P.body('rock', 0, 0);
P.setSize(resized, 2.5);
assert.ok(Math.abs(resized.mass - 0.05 * 2.5 ** 3) < 1e-10);
P.setSize(resized, 1);
assert.ok(Math.abs(resized.mass - 0.05) < 1e-10, 'Size selector does not compound repeated choices');
for (const flag of ['locked', 'held']) {
  const anchor = P.body('star', 0, 0, 3, -2), satellite = P.orbit('ocean', 220, 0, anchor);
  anchor[flag] = true;
  for (let i = 0; i < 120; i++) P.step([anchor, satellite], 1 / 120);
  assert.equal(anchor.x, 0); assert.equal(anchor.y, 0);
  assert.notEqual(satellite.x, 220, `${flag} primary still attracts its satellite`);
}
for (const type of Object.keys(P.types)) {
  const primary = P.body(type, 0, 0), satellite = P.orbit('ocean', 0, 0, primary);
  assert.ok([satellite.x, satellite.y, satellite.vx, satellite.vy].every(Number.isFinite), `${type}: orbit at zero initial distance remains finite`);
  assert.ok(Math.hypot(satellite.x, satellite.y) > primary.radius + satellite.radius);
}
const crowd = Array.from({ length: 24 }, (_, i) => P.body(i % 6 === 0 ? 'star' : 'rock', Math.cos(i) * i * 9, Math.sin(i) * i * 9));
const crowdBefore = totals(crowd);
for (let i = 0; i < 1200; i++) P.step(crowd, 1 / 120);
assert.ok(crowd.every(b => [b.x, b.y, b.vx, b.vy].every(Number.isFinite)), 'Dense 24-body collisions remain finite');
conserves(crowdBefore, crowd, 'Dense 24-body simulation');
for (const file of ['game.js', 'physics.js', 'style.css', 'vendor/gravity.js']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert.ok(!/structuredClone\s*\(|\.roundRect\s*\(|\.at\s*\(|color-mix\s*\(/.test(source), `${file}: no known Chrome 95 incompatible runtime APIs`);
}
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
for (const icon of manifest.icons) assert.ok(fs.existsSync(path.join(root, icon.src)), `PWA icon ${icon.src} exists`);
console.log(`✓ 12 orbital periods stable: ${minRadius.toFixed(3)}–${maxRadius.toFixed(3)} world units`);
console.log('✓ Momentum, collision mass/momentum, dense 24-body stability, Chrome 95 API checks, PWA icons');
console.log('✓ Visible-rim and swept collisions, chain mergers, ignition, collapse and black-hole accretion');
console.log('✓ Accelerated stellar stages and four mass-dependent remnants, nebula condensation, legacy saves, size and lock helpers');
