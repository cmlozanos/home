// Keep touch holds inside the game; preserve desktop menus and editable fields.
(function () {
  var lastTouch = -Infinity;
  function rememberTouch(event) {
    if (event.type === 'touchstart' || event.pointerType === 'touch') lastTouch = Date.now();
  }
  document.addEventListener('touchstart', rememberTouch, { capture: true, passive: true });
  document.addEventListener('pointerdown', rememberTouch, { capture: true, passive: true });
  document.addEventListener('contextmenu', function (event) {
    var editable = event.target && event.target.closest && event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])');
    if (!editable && (event.pointerType === 'touch' || Date.now() - lastTouch < 2000)) event.preventDefault();
  }, true);
}());

(function () {
  'use strict';
  var K = Karts, $ = function (id) { return document.getElementById(id); }, canvas = $('circuit'), ctx = canvas.getContext('2d');
  var selectedTrack = 0, selectedCar = 0, s = K.make(0, 0), input = { assist: true }, running = false, paused = false, blocked = true, familyPaused = false, gate, audio, sound = false, last = 0, accumulator = 0, shown = false, pointerKeys = {}, keyboardKeys = {};
  var w = 800, h = 600, zoom = 1, cx = 0, cy = 0, skid = [];
  function sceneFont(size) {
    return size + 'px "' + (window.FamilyV2 && FamilyV2.fontFamily || 'Family School') + '", cursive';
  }
  // The native scene also works without the optional family shell.
  function nightScene() {
    return window.FamilyV2 && typeof FamilyV2.theme === 'function'
      ? FamilyV2.theme() === 'dark' : document.documentElement.getAttribute('data-family-theme') === 'dark';
  }
  function decorativeMotion() {
    return window.FamilyV2 && typeof FamilyV2.motionAllowed === 'function'
      ? FamilyV2.motionAllowed() : !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function resize() { w = innerWidth; h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--family-height')) || innerHeight; var d = Math.min(devicePixelRatio || 1, 1); canvas.width = Math.round(w * d); canvas.height = Math.round(h * d); ctx.setTransform(d, 0, 0, d, 0, 0); zoom = Math.min((w - 26) / 845, (h - 170) / 590); cx = w / 2; cy = h / 2 + 12; }
  function allowed() { if (gate) gate.check(); return !blocked; }
  function clearInput() { var assist = input.assist; input = { assist: assist }; pointerKeys = {}; keyboardKeys = {}; document.querySelectorAll('[data-input]').forEach(function (b) { b.classList.toggle('held', !!input[b.dataset.input]); }); }
  function tone(frequency) { if (!sound || blocked || familyPaused || paused) return; try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); var o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = frequency; o.type = 'triangle'; g.gain.setValueAtTime(.065, audio.currentTime); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .12); o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + .13); } catch (_) {} }
  function choices(id, list, isCar) { list.forEach(function (item, i) { var b = document.createElement('button'); b.className = i === 0 ? 'selected' : ''; b.setAttribute('aria-label', item.name); b.setAttribute('aria-pressed', String(i === 0)); b.dataset.choice = String(i); if (isCar) { var swatch = document.createElement('span'); swatch.className = 'swatch'; swatch.style.background = item.color; b.appendChild(swatch); } else b.textContent = item.icon; b.onclick = function () { if (!allowed()) return; if (isCar) selectedCar = i; else selectedTrack = i; $(id).querySelectorAll('button').forEach(function (el, j) { el.classList.toggle('selected', j === i); el.setAttribute('aria-pressed', String(j === i)); }); if (!running) s = K.make(selectedTrack, selectedCar); }; $(id).appendChild(b); }); }
  choices('cars', K.cars, true); choices('tracks', K.tracks, false);
  function start() { raceInstance++;  if (!allowed()) return; s = K.make(selectedTrack, selectedCar); skid = []; shown = false; running = true; paused = false; last = 0; accumulator = 0; clearInput(); $('menu').hidden = true; $('result').hidden = true; $('controls').hidden = false; $('hud').hidden = false; tone(600); }
  function result(finish) { paused = true; clearInput(); $('result').hidden = false; $('result-icon').textContent = finish ? '🏆' : 'Ⅱ'; $('result-title').textContent = finish ? '¡Dos vueltas!' : 'Pausa'; $('result-stats').textContent = finish ? '⭐ ' + Math.round(s.time) + ' s  ·  🏁 ✓ ✓' : K.tracks[s.track].icon + '  🚘'; $('next').setAttribute('aria-label', finish ? 'Siguiente circuito' : 'Continuar'); }
  $('play').onclick = start; $('retry').onclick = start;
  $('next').onclick = function () { if (!allowed()) return; if (s.finished) { selectedTrack = (selectedTrack + 1) % K.tracks.length; $('tracks').querySelectorAll('button')[selectedTrack].click(); start(); } else { paused = false; last = 0; accumulator = 0; $('result').hidden = true; } };
  $('garage').onclick = function () { if (!allowed()) return; running = false; paused = false; $('result').hidden = true; $('menu').hidden = false; $('controls').hidden = true; $('hud').hidden = true; clearInput(); };
  $('pause').onclick = function () { if (!allowed() || !running || s.finished) return; if (paused) $('next').click(); else result(false); };
  $('assist').onclick = function () { if (!allowed()) return; input.assist = !input.assist; $('assist').setAttribute('aria-pressed', String(input.assist)); $('assist').setAttribute('aria-label', 'Aceleración suave automática ' + (input.assist ? 'activada' : 'desactivada')); $('assist').textContent = input.assist ? '🤝 ✓' : '🤝 ○'; };
  $('help').onclick = function () { if (allowed()) { $('guide').setAttribute('slot', 'family-settings'); this.parentNode.appendChild($('guide')); $('guide').hidden = !$('guide').hidden; } };
  $('sound').onclick = function () { if (!allowed()) return; sound = !sound; $('sound').textContent = sound ? '🔊' : '🔇'; $('sound').setAttribute('aria-label', sound ? 'Desactivar sonido' : 'Activar sonido'); $('sound').setAttribute('aria-pressed', String(sound)); if (sound && audio && !familyPaused && !paused) audio.resume().catch(function () {}); tone(650); };
  document.querySelectorAll('[data-input]').forEach(function (b) { b.addEventListener('pointerdown', function (e) { if (!allowed() || familyPaused || !running || paused) return; e.preventDefault(); input[b.dataset.input] = true; pointerKeys[e.pointerId] = b.dataset.input; b.classList.add('held'); try { b.setPointerCapture(e.pointerId); } catch (_) {} }); function up(e) { delete pointerKeys[e.pointerId]; input[b.dataset.input] = Object.keys(keyboardKeys).some(function (key) { return keyboardKeys[key] === b.dataset.input; }) || Object.keys(pointerKeys).some(function (id) { return pointerKeys[id] === b.dataset.input; }); b.classList.toggle('held', !!input[b.dataset.input]); } b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up); });
  var keyMap = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'throttle', w: 'throttle', ArrowDown: 'brake', s: 'brake' };
  addEventListener('keydown', function (e) { if ((e.composedPath&&e.composedPath().some(function(n){return n.tagName==='FAMILY-V2-SHELL';})) || !allowed() || familyPaused || (e.target.closest && e.target.closest('input,select,textarea,dialog'))) return; if (e.key === 'Escape') $('pause').click(); if (keyMap[e.key] && running && !paused) { e.preventDefault(); keyboardKeys[e.key] = keyMap[e.key]; input[keyMap[e.key]] = true; } });
  addEventListener('keyup', function (e) { if (keyMap[e.key]) { delete keyboardKeys[e.key]; input[keyMap[e.key]] = Object.keys(keyboardKeys).some(function (key) { return keyboardKeys[key] === keyMap[e.key]; }) || Object.keys(pointerKeys).some(function (id) { return pointerKeys[id] === keyMap[e.key]; }); } }); addEventListener('blur', clearInput); document.addEventListener('visibilitychange', function () { clearInput(); last = 0; accumulator = 0; }); addEventListener('resize', function () { requestAnimationFrame(resize); });
  function path() { ctx.beginPath(); s.points.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.closePath(); }
  function kart(x, y, angle, color, ghost) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2); var scale = Math.max(1, .63 / zoom); ctx.scale(scale, scale); if (ghost) ctx.globalAlpha = .42;
    ctx.fillStyle = '#15372d50'; ctx.beginPath(); ctx.ellipse(3, 5, 18, 24, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#152b31'; ctx.fillRect(-17, -13, 8, 12); ctx.fillRect(9, -13, 8, 12); ctx.fillRect(-17, 9, 8, 14); ctx.fillRect(9, 9, 8, 14);
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-12, 19); ctx.lineTo(-13, -10); ctx.quadraticCurveTo(-11, -24, 0, -25); ctx.quadraticCurveTo(11, -24, 13, -10); ctx.lineTo(12, 19); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff7d5'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#ffffff50'; ctx.fillRect(-10, -14, 3, 27);
    ctx.fillStyle = '#10233255'; ctx.fillRect(8, -9, 4, 25);
    ctx.fillStyle = '#e9f4d870'; ctx.fillRect(-7, -19, 14, 5); ctx.fillStyle = '#234244'; ctx.fillRect(-8, -4, 16, 14); ctx.fillStyle = '#e4f8e2'; ctx.beginPath(); ctx.arc(0, 2, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#234244'; ctx.fillRect(-6, 0, 12, 3);
    ctx.fillStyle = color; ctx.fillRect(-18, 19, 36, 5); ctx.fillStyle = '#ffffff70'; ctx.fillRect(-10, -12, 3, 24); ctx.restore();
  }
  function draw() {
    var t = K.tracks[s.track], night = nightScene();
    var turf = ctx.createLinearGradient(0, 0, w, h);
    turf.addColorStop(0, night ? '#142e36' : s.track === 1 ? '#7ac9cc' : s.track === 2 ? '#d8ae80' : '#88aa70');
    turf.addColorStop(1, night ? '#28424a' : t.ground); ctx.fillStyle = turf; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(zoom, zoom);
    // Bounded scenic props stay outside the drivable ribbon.
    for (var i = 0; i < 34; i++) {
      var tx = (i * 137 % 970) - 485, ty = (i * 211 % 790) - 395;
      if (K.nearest(tx, ty, s.points).distance < 91) continue;
      ctx.fillStyle = '#102c3540'; ctx.beginPath(); ctx.ellipse(tx + 10, ty + 15, 22, 10, .4, 0, Math.PI * 2); ctx.fill();
      if (s.track === 1) {
        ctx.fillStyle = night ? '#315659' : '#e3cf97'; ctx.beginPath(); ctx.ellipse(tx, ty, 26, 16, -.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#624b39'; ctx.fillRect(tx - 2, ty - 16, 4, 24);
        for (var leaf = 0; leaf < 5; leaf++) { var angle = leaf * Math.PI * 2 / 5; ctx.beginPath(); ctx.moveTo(tx, ty - 17); ctx.quadraticCurveTo(tx + Math.cos(angle) * 24, ty - 30 + Math.sin(angle) * 16, tx + Math.cos(angle) * 29, ty - 14 + Math.sin(angle) * 18); ctx.closePath(); ctx.fillStyle = night ? '#264c43' : leaf % 2 ? '#518c59' : '#377357'; ctx.fill(); }
      } else {
        ctx.fillStyle = night ? '#203d3d' : s.track === 2 ? '#9b7d5a' : '#3e7652'; ctx.beginPath(); ctx.arc(tx, ty, 19 + i % 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = night ? '#36534b' : s.track === 2 ? '#c6aa7c' : '#75a062'; ctx.beginPath(); ctx.arc(tx - 6, ty - 7, 13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = night ? '#49665a' : '#a8bd7b'; ctx.beginPath(); ctx.arc(tx - 10, ty - 11, 5, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Infield clubhouse: roof, veranda and windows, not a competing HUD label.
    ctx.fillStyle = '#102b3640'; ctx.fillRect(-73, -42, 152, 83);
    ctx.fillStyle = night ? '#536673' : '#e4d8ba'; ctx.fillRect(-78, -48, 144, 72);
    ctx.fillStyle = night ? '#293a51' : '#71828b'; ctx.fillRect(-83, -56, 154, 52);
    ctx.fillStyle = night ? '#6d7d88' : '#a8b8b7'; ctx.fillRect(-78, -56, 144, 6);
    ctx.fillStyle = night ? '#ffd987' : '#315969'; ctx.fillRect(-65, 3, 40, 15); ctx.fillRect(12, 3, 40, 15);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'; path(); ctx.strokeStyle = '#102b3655'; ctx.lineWidth = 143; ctx.stroke(); path(); ctx.strokeStyle = t.edge; ctx.lineWidth = 124; ctx.stroke(); path(); ctx.strokeStyle = '#faeee0'; ctx.lineWidth = 109; ctx.stroke(); ctx.setLineDash([18, 18]); ctx.strokeStyle = '#d8766a'; ctx.stroke(); ctx.setLineDash([]); path(); ctx.strokeStyle = night ? '#33434f' : t.road; ctx.lineWidth = 96; ctx.stroke(); path(); ctx.lineWidth = 2; ctx.strokeStyle = '#eaf0da68'; ctx.setLineDash([13, 24]); ctx.stroke(); ctx.setLineDash([]);
    // Fine inner/outer edge seams and a darker rubber racing line.
    path(); ctx.strokeStyle = night ? '#b8ccbe' : '#e9e6cb'; ctx.lineWidth = 88; ctx.stroke();
    path(); ctx.strokeStyle = night ? '#33434f' : t.road; ctx.lineWidth = 84; ctx.stroke();
    path(); ctx.strokeStyle = '#122b3320'; ctx.lineWidth = 33; ctx.stroke();
    ctx.font = sceneFont(22); ctx.textAlign = 'center'; ctx.fillStyle = '#f1efd599'; ctx.fillText(K.tracks[s.track].icon, 0, -20); ctx.font = sceneFont(17); ctx.fillText('Mini karts', 0, 15);
    var start = s.points[0], nextPoint = s.points[1], a = Math.atan2(nextPoint.y - start.y, nextPoint.x - start.x);
    ctx.save(); ctx.translate(start.x, start.y); ctx.rotate(a); for (var row = 0; row < 2; row++) for (var col = 0; col < 10; col++) { ctx.fillStyle = (row + col) % 2 ? '#213c40' : '#fff1d2'; ctx.fillRect(row * 8 - 8, col * 9 - 45, 8, 9); } ctx.restore();
    ctx.lineWidth = 2; ctx.strokeStyle = '#253a3a55'; (decorativeMotion() ? skid : []).forEach(function (p) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(p.angle) * 9, p.y + Math.sin(p.angle) * 9); ctx.stroke(); });
    var target = s.points[s.next * 10], targetNext = s.points[(s.next * 10 + 4) % 120], ta = Math.atan2(targetNext.y - target.y, targetNext.x - target.x);
    if (running) { ctx.save(); ctx.translate(target.x, target.y); ctx.rotate(ta); ctx.fillStyle = '#ffea99'; ctx.globalAlpha = decorativeMotion() ? .75 + Math.sin(s.time * 3) * .15 : .9; ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(8, 0); ctx.lineTo(-14, 14); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }
    // Transparent pace karts are visual ghosts, not collidable opponents.
    if (running && decorativeMotion()) [0, 1].forEach(function (g) { var phase = (s.time * (4.1 + g * .5) + 3 + g * 4) % 120, index = Math.floor(phase), p = s.points[index], q = s.points[(index + 1) % 120]; kart(p.x + (q.x - p.x) * (phase - index), p.y + (q.y - p.y) * (phase - index), Math.atan2(q.y - p.y, q.x - p.x), g ? '#d8c2fa' : '#fff3c7', true); });
    kart(s.x, s.y, s.angle, K.cars[s.car].color, false); ctx.restore();
  }
  function frame(now) { requestAnimationFrame(frame); if (gate) gate.check(); var dt = last ? Math.min(.08, (now - last) / 1000) : 0; last = now;
    if (!document.hidden && running && !paused && !blocked && !familyPaused) { accumulator += dt; while (accumulator >= 1 / 120) { var oldGate = s.gates; K.step(s, input, 1 / 120); if (s.gates !== oldGate) { tone(s.laps ? 700 : 430); if (s.gates % 12 === 0) award('lap-' + s.track + '-' + s.laps, 2); } accumulator -= 1 / 120; } if (decorativeMotion() && (input.left || input.right) && s.speed > 90 && Math.floor(s.time * 30) % 2 === 0) { skid.push({ x: s.x, y: s.y, angle: s.angle }); if (skid.length > 40) skid.shift(); } if (s.finished && !shown) { shown = true; award('finish-' + s.track + '-' + s.car, 3); tone(900); result(true); } } else accumulator = 0;
    $('laps').textContent = '🏁 ' + (s.laps > 0 ? '✓' : '○') + ' ' + (s.laps > 1 ? '✓' : '○'); draw();
  }
  document.addEventListener('DOMContentLoaded', function () {
    if (window.FamilyV2 && FamilyV2.fontReady) FamilyV2.fontReady.then(function () { draw(); });
  });
  addEventListener('familyv2:appearance', function () { draw(); });
  // Family overlays are a separate pause reason: never clear a gate or manual pause.
  var raceInstance=0;
  function award(id, points) { id='race-'+raceInstance+':'+id; if (window.FamilyV2) { FamilyV2.touch(); FamilyV2.award(id, points); } }
  function familyPause() { familyPaused = true; clearInput(); last = 0; accumulator = 0; if (audio) audio.suspend().catch(function () {}); }
  function familyResume() { familyPaused = false; clearInput(); last = 0; accumulator = 0; if (sound && audio && !blocked && !paused) audio.resume().catch(function () {}); }
  addEventListener('familyv2:pause', familyPause);
  addEventListener('familyv2:resume', familyResume);
  document.addEventListener('DOMContentLoaded', function () { if (window.FamilyV2) FamilyV2.register({ pause: familyPause, resume: familyResume, home: function () { $('garage').click(); } }); resize(); });
  resize();
  if (window.LearningGate) gate = LearningGate.mount({ gameId: 'pocket-karts', onLock: function () { blocked = true; clearInput(); last = 0; accumulator = 0; if (audio) audio.suspend().catch(function () {}); }, onUnlock: function () { blocked = false; last = 0; accumulator = 0; if (sound && audio && !familyPaused && !paused) audio.resume().catch(function () {}); } });
  else { $('play').disabled = true; $('guide').hidden = false; $('guide').textContent = 'No se pudo cargar el reto. Recarga la página.'; }
  if (location.search.indexOf('test=1') !== -1) Object.defineProperty(window, '__karts', { get: function () { return { running: running, paused: paused, familyPaused: familyPaused, blocked: blocked, sound: sound, x: s.x, y: s.y, angle: s.angle, speed: s.speed, laps: s.laps, next: s.next, gates: s.gates, finished: s.finished, track: s.track, car: s.car, time: s.time, held: Object.keys(input).filter(function (k) { return k !== 'assist' && input[k]; }) }; } });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(function () {});
  requestAnimationFrame(frame);
})();
