/* distanceToSegmentSq adapted from Clone-Fruit-Ninja, MIT, Matheus Henrique
 * Dias Siqueira (2026), commit 323795f40db404b236abab822c1cef84f5c05ce0.
 * Full provenance and license: THIRD_PARTY_NOTICES.md. */
(function (root) {
  'use strict';
  function distanceToSegmentSq(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay;
    if (dx === 0 && dy === 0) {
      var sx = px - ax, sy = py - ay;
      return sx * sx + sy * sy;
    }
    var t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    var clamped = Math.max(0, Math.min(1, t));
    var cx = ax + clamped * dx, cy = ay + clamped * dy;
    var ox = px - cx, oy = py - cy;
    return ox * ox + oy * oy;
  }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function launch(width, height, radius, random) {
    var x = radius * 2 + random() * (width - radius * 4);
    var peak = height * (.24 + random() * .22);
    var vy = -Math.sqrt(2 * 950 * (height + radius - peak));
    var target = width * (.25 + random() * .5);
    target = clamp(target, (x + radius) / 2, (x + width - radius) / 2);
    return { x:x, y:height + radius, vx:(target - x) / (-vy / 950), vy:vy };
  }
  var api = { distanceToSegmentSq:distanceToSegmentSq, clamp:clamp, launch:launch };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FruitCore = api;
})(typeof window !== 'undefined' ? window : this);
