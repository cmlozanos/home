/* Quadratic midpoint brush adapted from drawingboard.js (MIT),
 * commit 92e2cfae33735efdd29885a0f564578055299293, js/board.js:593-602.
 * Copyright (c) 2015 Emmanuel "@Leimina" Pelletier. See THIRD_PARTY_NOTICES.md. */
(function (root) {
  'use strict';
  var MAX_ACTIONS = 300, MAX_POINTS = 12000;
  function midpoint(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
  function stroke(ctx, points, width, height, size) {
    if (!points.length) return;
    var first = { x: points[0].x * width, y: points[0].y * height };
    ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (points.length === 1) { ctx.beginPath(); ctx.arc(first.x, first.y, size / 2, 0, Math.PI * 2); ctx.fill(); return; }
    ctx.beginPath(); ctx.moveTo(first.x, first.y);
    for (var i = 1; i < points.length; i++) {
      var old = { x: points[i - 1].x * width, y: points[i - 1].y * height };
      var current = { x: points[i].x * width, y: points[i].y * height };
      var mid = midpoint(old, current);
      ctx.quadraticCurveTo(old.x, old.y, mid.x, mid.y);
    }
    ctx.lineTo(current.x, current.y); ctx.stroke();
  }
  function validSave(data) {
    if (!data || data.version !== 1 || !Array.isArray(data.actions) || data.actions.length > MAX_ACTIONS) return false;
    if (['plain', 'dots', 'garden', 'night'].indexOf(data.background) < 0) return false;
    var total = 0;
    return data.actions.every(function (a) {
      if (!a || ['brush', 'eraser', 'star', 'flower', 'heart', 'sun'].indexOf(a.tool) < 0 || !/^#[0-9a-f]{6}$/i.test(a.color) || !Number.isFinite(a.size) || a.size < 1 || a.size > 40 || !Array.isArray(a.points) || !a.points.length || a.points.length > 2048) return false;
      total += a.points.length;
      return total <= MAX_POINTS && a.points.every(function (p) { return p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1; });
    });
  }
  function bounded(actions) {
    var result = actions.slice(-MAX_ACTIONS), count = result.reduce(function (n, a) { return n + a.points.length; }, 0);
    while (count > MAX_POINTS && result.length > 1) count -= result.shift().points.length;
    return result;
  }
  var api = { stroke: stroke, midpoint: midpoint, validSave: validSave, bounded: bounded };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AtelierCore = api;
}(typeof window !== 'undefined' ? window : globalThis));
