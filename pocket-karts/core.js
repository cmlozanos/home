/* Heading-based movement derives from Gaetz/js-Racing (MIT),
 * Copyright (c) 2017 Gaëtan Blaise-Cazalet. See THIRD_PARTY.md.
 * Continuous-time grip, boundaries, ordered checkpoints and courses are original. */
(function (root) {
  'use strict';
  var tracks = [{ name: 'Jardín', icon: '🌳', ground: '#417d65', edge: '#e5dcb0', road: '#748485' }, { name: 'Laguna', icon: '🏝', ground: '#73c5cd', edge: '#f4dfac', road: '#748999' }, { name: 'Dulce cañón', icon: '🌵', ground: '#c59169', edge: '#ffe1a3', road: '#847e89' }];
  var cars = [{ name: 'Fresa', color: '#ff776d', speed: 153, grip: 9 }, { name: 'Limón', color: '#ffe078', speed: 172, grip: 6.5 }, { name: 'Menta', color: '#65e2c7', speed: 141, grip: 13 }];
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function course(track) { var points = []; for (var i = 0; i < 120; i++) { var a = i / 120 * Math.PI * 2; points.push(track === 0 ? { x: Math.cos(a) * 305, y: Math.sin(a) * 210 } : track === 1 ? { x: Math.cos(a) * (300 + 50 * Math.cos(2 * a)), y: Math.sin(a) * 185 } : { x: Math.cos(a) * (280 + 35 * Math.sin(3 * a)), y: Math.sin(a) * (205 + 20 * Math.cos(2 * a)) }); } return points; }
  function nearest(x, y, points) { var best = { distance: Infinity, x: 0, y: 0, index: 0 }; for (var i = 0; i < points.length; i++) { var a = points[i], b = points[(i + 1) % points.length], dx = b.x - a.x, dy = b.y - a.y, t = clamp(((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy), 0, 1), px = a.x + dx * t, py = a.y + dy * t, d = Math.hypot(x - px, y - py); if (d < best.distance) best = { distance: d, x: px, y: py, index: i }; } return best; }
  function make(t, c) { var p = course(t); return { track: t, car: c, points: p, x: p[0].x, y: p[0].y, angle: Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x), vx: 0, vy: 0, speed: 0, laps: 0, next: 1, gates: 0, time: 0, finished: false, offroad: false, hits: 0, hitCooldown: 0 }; }
  function step(s, input, dt) {
    if (s.finished) return;
    var c = cars[s.car], throttle = input.throttle || input.assist;
    s.time += dt; s.hitCooldown = Math.max(0, s.hitCooldown - dt);
    var forward = s.vx * Math.cos(s.angle) + s.vy * Math.sin(s.angle), lateral = -s.vx * Math.sin(s.angle) + s.vy * Math.cos(s.angle);
    forward += (input.brake ? -220 : throttle ? 112 : -Math.sign(forward) * 30) * dt;
    forward = clamp(forward, input.brake ? -45 : 0, c.speed * (input.assist ? .88 : 1));
    var steer = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    s.angle += steer * 1.85 * clamp(Math.abs(forward) / 45, 0, 1) * (forward < 0 ? -1 : 1) * dt;
    lateral *= Math.exp(-c.grip * dt); forward *= Math.exp(-.10 * dt);
    s.vx = Math.cos(s.angle) * forward - Math.sin(s.angle) * lateral;
    s.vy = Math.sin(s.angle) * forward + Math.cos(s.angle) * lateral;
    s.x += s.vx * dt; s.y += s.vy * dt;
    var n = nearest(s.x, s.y, s.points); s.offroad = n.distance > 39;
    if (s.offroad) { s.vx *= Math.exp(-1.5 * dt); s.vy *= Math.exp(-1.5 * dt); }
    if (n.distance > 62) { var nx = (s.x - n.x) / n.distance, ny = (s.y - n.y) / n.distance; s.x = n.x + nx * 62; s.y = n.y + ny * 62; var outward = s.vx * nx + s.vy * ny; if (outward > 0) { s.vx -= outward * nx * 1.2; s.vy -= outward * ny * 1.2; } if (!s.hitCooldown) { s.hits++; s.hitCooldown = 1; } }
    var target = s.points[s.next * 10];
    if (Math.hypot(s.x - target.x, s.y - target.y) < 47) { s.gates++; if (s.next === 0) s.laps++; s.next = (s.next + 1) % 12; }
    s.speed = Math.hypot(s.vx, s.vy);
    if (s.laps >= 2) s.finished = true;
  }
  root.Karts = { tracks: tracks, cars: cars, course: course, make: make, step: step, nearest: nearest, clamp: clamp };
})(typeof window === 'undefined' ? globalThis : window);
