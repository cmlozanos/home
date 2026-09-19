/* Original fixed-step velocity Verlet integrator around the MIT gravity kernel. */
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
    star: { radius: 30, mass: 30, color: '#ffcb7c' }
  };
  var nextId = 1;
  function body(type, x, y, vx, vy) {
    var spec = TYPES[type] || TYPES.ocean;
    return { id: nextId++, type: type, x: x, y: y, vx: vx || 0, vy: vy || 0, mass: spec.mass, radius: spec.radius, trail: [], angleTravel: 0, lastAngle: null, orbits: 0 };
  }
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
  function step(bodies, dt, onMerge) {
    var before = acceleration(bodies);
    bodies.forEach(function (b, i) {
      b.vx += before[i].x * dt / 2;
      b.vy += before[i].y * dt / 2;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
    });
    var after = acceleration(bodies);
    bodies.forEach(function (b, i) {
      b.vx += after[i].x * dt / 2;
      b.vy += after[i].y * dt / 2;
    });
    for (var i = 0; i < bodies.length; i++) {
      for (var j = i + 1; j < bodies.length; j++) {
        var a = bodies[i], b = bodies[j], dx = b.x - a.x, dy = b.y - a.y;
        if (dx * dx + dy * dy < Math.pow((a.radius + b.radius) * 0.78, 2)) {
          var mass = a.mass + b.mass;
          var dominant = a.mass >= b.mass ? a : b;
          a.x = (a.x * a.mass + b.x * b.mass) / mass;
          a.y = (a.y * a.mass + b.y * b.mass) / mass;
          a.vx = (a.vx * a.mass + b.vx * b.mass) / mass;
          a.vy = (a.vy * a.mass + b.vy * b.mass) / mass;
          a.type = dominant.type;
          a.radius = Math.min(65, Math.pow(Math.pow(a.radius, 3) + Math.pow(b.radius, 3), 1 / 3));
          a.mass = mass;
          a.trail = [];
          a.lastAngle = null;
          bodies.splice(j--, 1);
          if (onMerge) onMerge(a);
        }
      }
    }
  }
  function orbit(type, x, y, primary) {
    var dx = x - primary.x, dy = y - primary.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < primary.radius + TYPES[type].radius + 22) {
      var angle = Math.atan2(dy, dx);
      distance = primary.radius + TYPES[type].radius + 45;
      dx = Math.cos(angle) * distance;
      dy = Math.sin(angle) * distance;
      x = primary.x + dx;
      y = primary.y + dy;
    }
    var softened = Math.sqrt(distance * distance + SOFTENING * SOFTENING);
    var speed = Math.sqrt(gravity.constant * primary.mass * distance * distance / Math.pow(softened, 3));
    return body(type, x, y, primary.vx - dy / distance * speed, primary.vy + dx / distance * speed);
  }
  root.OrbitPhysics = { body: body, orbit: orbit, step: step, types: TYPES, G: gravity.constant };
}(typeof window !== 'undefined' ? window : globalThis));
