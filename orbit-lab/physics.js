/* Velocity Verlet around the MIT gravity kernel. Mass, distance and lifetime are
 * GAME units, not astrophysical predictions. Evolution runs separately. */
(function (root) {
  'use strict';
  var gravity = new Gravity();
  gravity.constant = 16000;
  var SOFTENING = 10;
  var TYPES = {
    ocean: { radius: 12, mass: 0.07, color: '#66d9cb' },
    rock: { radius: 10, mass: 0.05, color: '#f3ad7d' },
    giant: { radius: 20, mass: 0.22, color: '#c49ee8' },
    comet: { radius: 6, mass: 0.012, color: '#b9ebff' },
    nebula: { radius: 44, mass: 1.2, color: '#d48dff' },
    protostar: { radius: 24, mass: 2, color: '#ff9e76' },
    'red-dwarf': { radius: 20, mass: 5, color: '#ff896d' },
    star: { radius: 30, mass: 30, color: '#ffcb7c' },
    'white-star': { radius: 32, mass: 45, color: '#fff5e4' },
    'blue-star': { radius: 36, mass: 60, color: '#92caff' },
    'red-giant': { radius: 52, mass: 12, color: '#ff795c' },
    supergiant: { radius: 64, mass: 75, color: '#ffb7dc' },
    'mega-giant': { radius: 85, mass: 110, color: '#ff8aaa' },
    'white-dwarf': { radius: 13, mass: 3, color: '#edf5ff' },
    pulsar: { radius: 12, mass: 50, color: '#b4f5ff' },
    magnetar: { radius: 15, mass: 75, color: '#e7abff' },
    blackhole: { radius: 24, mass: 100, color: '#b995ff' }
  };
  // Illustrative lives in simulated seconds. Thresholds are original game rules.
  var LIFETIMES = { nebula: 10, protostar: 8, 'red-dwarf': 70, star: 50, 'white-star': 40, 'blue-star': 30, 'red-giant': 15, supergiant: 12, 'mega-giant': 10 };
  var IGNITION_MASS = 1, COLLAPSE_MASS = 90;
  var nextId = 1;
  function finite(value, fallback) { return typeof value === 'number' && isFinite(value) ? value : fallback; }
  function mainSequence(mass) { return mass < 10 ? 'red-dwarf' : mass < 40 ? 'star' : mass < 50 ? 'white-star' : 'blue-star'; }
  function normalize(b) {
    if (!TYPES[b.type]) b.type = 'ocean';
    var spec = TYPES[b.type];
    b.x = finite(b.x, 0); b.y = finite(b.y, 0);
    b.vx = finite(b.vx, 0); b.vy = finite(b.vy, 0);
    b.mass = Math.max(0.00001, finite(b.mass, spec.mass));
    b.radius = Math.max(3, Math.min(110, finite(b.radius, spec.radius)));
    b.age = Math.max(0, finite(b.age, 0));
    b.stageAge = Math.max(0, finite(b.stageAge, 0));
    b.sizeScale = Math.max(0.5, Math.min(2.5, finite(b.sizeScale, 1)));
    b.locked = b.locked === true; b.held = b.held === true;
    if (!Array.isArray(b.trail)) b.trail = [];
    if (!Number.isFinite(b.id)) b.id = nextId++;
    nextId = Math.max(nextId, b.id + 1);
    return b;
  }
  function body(type, x, y, vx, vy) {
    var spec = TYPES[type] || TYPES.ocean;
    return normalize({ id: nextId++, type: type, x: x, y: y, vx: vx || 0, vy: vy || 0, mass: spec.mass, radius: spec.radius, trail: [], angleTravel: 0, lastAngle: null, orbits: 0 });
  }
  function setSize(b, factor) {
    normalize(b);
    factor = Math.max(0.5, Math.min(2.5, finite(factor, 1)));
    var ratio = factor / b.sizeScale;
    b.mass *= ratio * ratio * ratio;
    b.radius = Math.max(3, Math.min(110, b.radius * ratio));
    b.sizeScale = factor;
    return b;
  }
  function fixed(b) { return b.locked || b.held; }
  function acceleration(bodies) {
    var values = bodies.map(function () { return { x: 0, y: 0 }; });
    for (var i = 0; i < bodies.length; i++) {
      for (var j = i + 1; j < bodies.length; j++) {
        var dx = bodies[j].x - bodies[i].x;
        var dy = bodies[j].y - bodies[i].y;
        var distance = Math.sqrt(dx * dx + dy * dy + SOFTENING * SOFTENING);
        var ai = gravity.calculateAcceleration(bodies[j].mass, distance);
        var aj = gravity.calculateAcceleration(bodies[i].mass, distance);
        values[i].x += ai * dx / distance;
        values[i].y += ai * dy / distance;
        values[j].x -= aj * dx / distance;
        values[j].y -= aj * dy / distance;
      }
    }
    return values;
  }
  function transition(b, type) {
    b.type = type; b.stageAge = 0; b.sizeScale = 1;
    b.radius = Math.max(6, Math.min(110, TYPES[type].radius * Math.pow(b.mass / TYPES[type].mass, 1 / 3)));
  }
  function event(callback, b, kind, from, consumedId) {
    if (callback) callback(b, { kind: kind, x: b.x, y: b.y, from: from, to: b.type, mass: b.mass, survivorId: b.id, consumedId: consumedId });
  }
  function merge(bodies, i, j, callback) {
    var a = bodies[i], b = bodies[j], mass = a.mass + b.mass;
    var dominant = a.mass >= b.mass ? a : b, from = dominant.type;
    // Explicit locks/held bodies are external constraints. A collision cancels
    // protected-orbit assistance rather than turning the remnant into an anchor.
    var fixedA = a.locked && !a.orbitLocked, fixedB = b.locked && !b.orbitLocked;
    var anchor = fixedA || a.held ? a : (fixedB || b.held ? b : null);
    var x = anchor ? anchor.x : (a.x * a.mass + b.x * b.mass) / mass;
    var y = anchor ? anchor.y : (a.y * a.mass + b.y * b.mass) / mass;
    var vx = (a.vx * a.mass + b.vx * b.mass) / mass;
    var vy = (a.vy * a.mass + b.vy * b.mass) / mass;
    var radius = Math.min(110, Math.pow(Math.pow(a.radius, 3) + Math.pow(b.radius, 3), 1 / 3));
    var kind = 'merge', type = from;
    if (a.type === 'blackhole' || b.type === 'blackhole') { type = 'blackhole'; kind = 'accrete'; }
    else if (mass >= COLLAPSE_MASS) { type = 'blackhole'; kind = 'collapse'; }
    else if (['red-dwarf', 'star', 'white-star', 'blue-star'].indexOf(from) !== -1) type = mainSequence(mass);
    else if (!LIFETIMES[from] && from !== 'white-dwarf' && from !== 'pulsar' && from !== 'magnetar' && mass >= IGNITION_MASS) { type = 'protostar'; kind = 'ignite'; }
    a.stageAge = dominant.stageAge; a.age = dominant.age;
    a.lifeStage = type === 'ocean' || type === 'rock' ? dominant.lifeStage || 0 : 0;
    a.habitableTime = type === 'ocean' || type === 'rock' ? dominant.habitableTime || 0 : 0;
    a.locked = fixedA || fixedB; a.held = a.held || b.held;
    a.orbitLocked = false; delete a.anchorId; delete a.orbitRadius; delete a.orbitPhase;
    a.x = x; a.y = y; a.vx = anchor ? 0 : vx; a.vy = anchor ? 0 : vy;
    a.type = from; a.mass = mass; a.radius = radius;
    if (type !== from) transition(a, type);
    a.trail = []; a.lastAngle = null;
    bodies.splice(j, 1);
    event(callback, a, kind, from, b.id);
  }
  // Earliest swept-circle contact during a Verlet drift, including visible rims.
  function contactTime(a, b, duration) {
    var dx = b.x - a.x, dy = b.y - a.y, radius = a.radius + b.radius;
    var c = dx * dx + dy * dy - radius * radius;
    if (c <= 0) return 0;
    var vx = (fixed(b) ? 0 : b.vx) - (fixed(a) ? 0 : a.vx);
    var vy = (fixed(b) ? 0 : b.vy) - (fixed(a) ? 0 : a.vy);
    var speed2 = vx * vx + vy * vy, projection = dx * vx + dy * vy;
    if (speed2 === 0 || projection >= 0) return Infinity;
    var discriminant = projection * projection - speed2 * c;
    if (discriminant < 0) return Infinity;
    // Stable equivalent of (-projection - sqrt(discriminant))/speed2.
    var time = c / (-projection + Math.sqrt(discriminant));
    return time <= duration ? time : Infinity;
  }
  function drift(bodies, duration, callback) {
    var remaining = duration;
    while (true) {
      var earliest = Infinity, first = -1, second = -1;
      for (var i = 0; i < bodies.length; i++) {
        for (var j = i + 1; j < bodies.length; j++) {
          var time = contactTime(bodies[i], bodies[j], remaining);
          if (time < earliest) { earliest = time; first = i; second = j; }
        }
      }
      var elapsed = first < 0 ? remaining : earliest;
      bodies.forEach(function (b) { if (!fixed(b)) { b.x += b.vx * elapsed; b.y += b.vy * elapsed; } });
      if (first < 0) break;
      remaining = Math.max(0, remaining - elapsed);
      merge(bodies, first, second, callback);
      // Merger can touch an earlier-index neighbour: rescan every pair.
    }
  }
  function step(bodies, dt, onMerge) {
    dt = Math.max(0, finite(dt, 0));
    bodies.forEach(normalize);
    drift(bodies, 0, onMerge);
    var before = acceleration(bodies);
    bodies.forEach(function (b, i) {
      if (!fixed(b)) { b.vx += before[i].x * dt / 2; b.vy += before[i].y * dt / 2; }
    });
    drift(bodies, dt, onMerge);
    var after = acceleration(bodies);
    bodies.forEach(function (b, i) {
      if (!fixed(b)) { b.vx += after[i].x * dt / 2; b.vy += after[i].y * dt / 2; }
    });
  }
  function evolve(bodies, dt, onEvent) {
    dt = Math.max(0, finite(dt, 0));
    bodies.forEach(function (b) {
      normalize(b);
      b.age += dt; b.stageAge += dt;
      // Finite stage graph, at most four transitions even with a very large dt.
      while (LIFETIMES[b.type] && b.stageAge >= LIFETIMES[b.type]) {
        var from = b.type, leftover = b.stageAge - LIFETIMES[from], type, kind;
        if (from === 'nebula') { type = b.mass < IGNITION_MASS ? 'rock' : 'protostar'; kind = 'condense'; }
        else if (from === 'protostar') { type = mainSequence(b.mass); kind = 'ignite'; }
        else if (from === 'red-dwarf' || from === 'star' || from === 'white-star' || from === 'blue-star') { type = b.mass >= COLLAPSE_MASS ? 'mega-giant' : b.mass >= 50 ? 'supergiant' : 'red-giant'; kind = 'expand'; }
        else { type = b.mass < 40 ? 'white-dwarf' : b.mass < 65 ? 'pulsar' : b.mass < COLLAPSE_MASS ? 'magnetar' : 'blackhole'; kind = type === 'blackhole' ? 'collapse' : 'supernova'; }
        var cloud = null;
        // A stellar death ejects 8% as a physical cloud. The recoil balances
        // momentum; at the 24-body budget all mass stays in the remnant instead.
        if ((kind === 'supernova' || kind === 'collapse') && bodies.length < 24) {
          var ejectMass = b.mass * 0.08, originalVx = b.vx, originalVy = b.vy;
          b.mass -= ejectMass;
          cloud = body('nebula', b.x, b.y, originalVx, originalVy);
          cloud.mass = ejectMass;
          transition(cloud, 'nebula');
        }
        transition(b, type); b.stageAge = leftover;
        if (cloud) {
          var direction = b.id * 2.3999632297, distance = b.radius + cloud.radius + 35;
          var outward = Math.sqrt(2 * gravity.constant * (b.mass + cloud.mass) / distance) * 1.25;
          var ux = Math.cos(direction), uy = Math.sin(direction);
          cloud.x = b.x + ux * distance; cloud.y = b.y + uy * distance;
          cloud.vx += ux * outward; cloud.vy += uy * outward;
          b.vx -= ux * outward * cloud.mass / b.mass; b.vy -= uy * outward * cloud.mass / b.mass;
          bodies.push(cloud);
        }
        event(onEvent, b, kind, from);
        if (cloud) event(onEvent, cloud, 'eject', from);
      }
    });
  }
  function orbit(type, x, y, primary) {
    normalize(primary);
    var spec = TYPES[type] || TYPES.ocean;
    var dx = x - primary.x, dy = y - primary.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < primary.radius + spec.radius + 22) {
      var angle = Math.atan2(dy, dx);
      distance = primary.radius + spec.radius + 45;
      dx = Math.cos(angle) * distance; dy = Math.sin(angle) * distance;
      x = primary.x + dx; y = primary.y + dy;
    }
    var softened = Math.sqrt(distance * distance + SOFTENING * SOFTENING);
    var speed = Math.sqrt(gravity.constant * primary.mass * distance * distance / Math.pow(softened, 3));
    return body(type, x, y, (fixed(primary) ? 0 : primary.vx) - dy / distance * speed, (fixed(primary) ? 0 : primary.vy) + dx / distance * speed);
  }
  root.OrbitPhysics = { body: body, orbit: orbit, step: step, evolve: evolve, setSize: setSize, normalize: normalize, types: TYPES, lifetimes: LIFETIMES, G: gravity.constant };
}(typeof window !== 'undefined' ? window : globalThis));
