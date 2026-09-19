/* Projection adapted from javascript-racer, Copyright (c) 2012–2016 Jake Gordon
 * and contributors, MIT. See THIRD_PARTY.md. All race rules below are original. */
(function (root) {
  'use strict';
  var tracks = [
    { name: 'Costa azul', icon: '🌊', sky: '#84d5e5', ground: '#59a887', road: '#40586d', length: 24000, curve: .7 },
    { name: 'Cañón dorado', icon: '🏜', sky: '#f6c996', ground: '#c97e47', road: '#565666', length: 28000, curve: 1 },
    { name: 'Ciudad estelar', icon: '🌃', sky: '#17284c', ground: '#3b4760', road: '#343e57', length: 32000, curve: 1.25 }
  ];
  var cars = [{ name: 'Cometa', color: '#ff735c', speed: 1050, grip: 1 }, { name: 'Rayo', color: '#f9d65c', speed: 1150, grip: .85 }, { name: 'Aurora', color: '#59d9c4', speed: 980, grip: 1.3 }];
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  // Jake Gordon's perspective projection, renamed coordinates only.
  function project(p, cameraX, cameraY, cameraZ, depth, width, height, roadWidth) {
    var x = (p.x || 0) - cameraX, y = (p.y || 0) - cameraY, z = (p.z || 0) - cameraZ;
    var scale = depth / z;
    return { x: Math.round(width / 2 + scale * x * width / 2), y: Math.round(height / 2 - scale * y * height / 2), w: Math.round(scale * roadWidth * width / 2), scale: scale };
  }
  function curveAt(z, t) { return Math.sin(z / 2100) * tracks[t].curve; }
  function make(t, c) {
    var traffic = [], ramps = [];
    for (var n = 0; n < 16; n++) traffic.push({ z: 2600 + n * 1350, x: [-.6, .62, 0][n % 3], speed: 290 + n % 3 * 60, color: ['#f9d65c', '#9bafff', '#67ded3'][n % 3] });
    for (var i = 0; i < 4; i++) ramps.push({ z: 4500 + i * 5400, x: i % 2 ? .58 : -.58, used: false });
    return { track: t, car: c, z: 0, x: 0, speed: 0, nitro: 1, flight: 0, jumpTime: 0, bumps: 0, jumps: 0, time: 0, cool: 0, finished: false, traffic: traffic, ramps: ramps, boosted: false };
  }
  function step(s, input, dt) {
    if (s.finished) return;
    var car = cars[s.car], oldZ = s.z;
    s.time += dt; s.cool = Math.max(0, s.cool - dt); s.flight = Math.max(0, s.flight - dt);
    s.boosted = !!input.boost && s.nitro > .02 && !input.brake;
    var top = car.speed * (s.boosted ? 1.55 : 1);
    var throttle = input.throttle || input.assist;
    s.speed = clamp(s.speed + (input.brake ? -1700 : throttle ? 630 : -260) * dt, 0, top);
    if (s.boosted) s.speed = Math.min(top, s.speed + 950 * dt);
    s.nitro = clamp(s.nitro + (s.boosted ? -.25 : .10) * dt, 0, 1);
    s.x += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 1.5 * dt * car.grip;
    s.x -= curveAt(s.z, s.track) * Math.pow(s.speed / car.speed, 2) * .19 * dt;
    if (input.assist && !input.left && !input.right) s.x *= Math.exp(-.5 * dt);
    s.x = clamp(s.x, -1.25, 1.25);
    if (Math.abs(s.x) > .97 && !s.flight) s.speed *= Math.exp(-1.5 * dt);
    s.z += s.speed * dt;
    for (var i = 0; i < s.traffic.length; i++) {
      var rival = s.traffic[i], before = rival.z - oldZ; rival.z += rival.speed * dt;
      var after = rival.z - s.z;
      if (before >= -80 && after < 95 && Math.abs(s.x - rival.x) < .27 && !s.cool && !s.flight) { s.speed *= .42; s.cool = 1.4; s.bumps++; }
    }
    for (var j = 0; j < s.ramps.length; j++) {
      var ramp = s.ramps[j];
      if (!ramp.used && oldZ <= ramp.z && s.z >= ramp.z) {
        ramp.used = true;
        if (Math.abs(s.x - ramp.x) < .31 && s.speed > 430) { s.flight = s.boosted ? 1.45 : .9; s.jumpTime = s.flight; s.jumps++; }
      }
    }
    if (s.z >= tracks[s.track].length) { s.z = tracks[s.track].length; s.finished = true; s.boosted = false; }
  }
  root.Highway = { tracks: tracks, cars: cars, make: make, step: step, project: project, curveAt: curveAt, clamp: clamp };
})(typeof window === 'undefined' ? globalThis : window);
