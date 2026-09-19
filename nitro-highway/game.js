(function () {
  'use strict';
  var H = Highway, $ = function (id) { return document.getElementById(id); }, canvas = $('road'), ctx = canvas.getContext('2d');
  var selectedCar = 0, selectedTrack = 0, s = H.make(0, 0), input = { assist: true }, running = false, paused = false, blocked = true, sound = false, audio, gate;
  var w = 800, h = 600, last = 0, accumulator = 0, shown = false, pointerKeys = {};
  function resize() { w = innerWidth; h = innerHeight; var d = Math.min(1.5, devicePixelRatio || 1); canvas.width = Math.round(w * d); canvas.height = Math.round(h * d); ctx.setTransform(d, 0, 0, d, 0, 0); }
  function clearInput() { var assist = input.assist; input = { assist: assist }; pointerKeys = {}; document.querySelectorAll('[data-input]').forEach(function (b) { b.classList.remove('held'); }); }
  function allowed() { if (gate) gate.check(); return !blocked; }
  function tone(freq) { if (!sound || blocked) return; try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); var o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = freq; g.gain.setValueAtTime(.055, audio.currentTime); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .16); o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + .17); } catch (_) {} }
  function choices(id, choices, car) { choices.forEach(function (item, i) { var b = document.createElement('button'); b.setAttribute('aria-label', item.name); b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); b.className = i === 0 ? 'selected' : ''; b.dataset.choice = String(i); if (car) { var swatch = document.createElement('span'); swatch.className = 'swatch'; swatch.style.background = item.color; b.appendChild(swatch); } else b.textContent = item.icon; b.onclick = function () { if (!allowed()) return; if (car) selectedCar = i; else selectedTrack = i; $(id).querySelectorAll('button').forEach(function (el, j) { el.classList.toggle('selected', j === i); el.setAttribute('aria-pressed', String(j === i)); }); if (!running) s = H.make(selectedTrack, selectedCar); }; $(id).appendChild(b); }); }
  choices('cars', H.cars, true); choices('tracks', H.tracks, false);
  function start() { if (!allowed()) return; s = H.make(selectedTrack, selectedCar); running = true; paused = false; shown = false; accumulator = 0; clearInput(); $('menu').hidden = true; $('result').hidden = true; $('hud').hidden = false; $('controls').hidden = false; $('pause').setAttribute('aria-label', 'Pausar'); tone(460); }
  function result(finish) { paused = true; clearInput(); $('result').hidden = false; $('result-icon').textContent = finish ? '🏆' : 'Ⅱ'; $('result-title').textContent = finish ? '¡Meta!' : 'Pausa'; $('result-stats').textContent = finish ? '⭐ ' + Math.round(s.time) + ' s   ·   ↗ ' + s.jumps : '🚘  ' + H.tracks[s.track].icon; $('next').setAttribute('aria-label', finish ? 'Siguiente circuito' : 'Continuar'); }
  $('play').onclick = start; $('retry').onclick = start;
  $('next').onclick = function () { if (!allowed()) return; if (s.finished) { selectedTrack = (selectedTrack + 1) % H.tracks.length; $('tracks').querySelectorAll('button')[selectedTrack].click(); start(); } else { paused = false; accumulator = 0; $('result').hidden = true; } };
  $('garage').onclick = function () { if (!allowed()) return; running = false; paused = false; $('result').hidden = true; $('menu').hidden = false; $('controls').hidden = true; $('hud').hidden = true; clearInput(); };
  $('pause').onclick = function () { if (!allowed() || !running || s.finished) return; if (paused) $('next').click(); else result(false); };
  $('assist').onclick = function () { if (!allowed()) return; input.assist = !input.assist; $('assist').setAttribute('aria-pressed', String(input.assist)); $('assist').setAttribute('aria-label', 'Ayuda de aceleración ' + (input.assist ? 'activada' : 'desactivada')); $('assist').textContent = input.assist ? '🤝 ✓' : '🤝 ○'; };
  $('help').onclick = function () { if (allowed()) $('guide').hidden = !$('guide').hidden; };
  $('sound').onclick = function () { if (!allowed()) return; sound = !sound; $('sound').textContent = sound ? '🔊' : '🔇'; $('sound').setAttribute('aria-pressed', String(sound)); $('sound').setAttribute('aria-label', sound ? 'Desactivar sonido' : 'Activar sonido'); if (sound && audio) audio.resume().catch(function () {}); tone(620); };
  document.querySelectorAll('[data-input]').forEach(function (b) {
    b.addEventListener('pointerdown', function (e) { if (!allowed() || paused || !running) return; e.preventDefault(); input[b.dataset.input] = true; pointerKeys[e.pointerId] = b.dataset.input; b.classList.add('held'); try { b.setPointerCapture(e.pointerId); } catch (_) {} });
    function up(e) { delete pointerKeys[e.pointerId]; input[b.dataset.input] = Object.keys(pointerKeys).some(function (id) { return pointerKeys[id] === b.dataset.input; }); b.classList.remove('held'); }
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
  });
  var keyMap = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'throttle', w: 'throttle', ArrowDown: 'brake', s: 'brake', ' ': 'boost' };
  addEventListener('keydown', function (e) { if (!allowed()) return; if (e.key === 'Escape') $('pause').click(); if (keyMap[e.key] && running && !paused) { e.preventDefault(); input[keyMap[e.key]] = true; } });
  addEventListener('keyup', function (e) { if (keyMap[e.key]) input[keyMap[e.key]] = false; });
  addEventListener('blur', clearInput); document.addEventListener('visibilitychange', function () { clearInput(); last = 0; accumulator = 0; }); addEventListener('resize', resize);
  function polygon(points, fill) { ctx.fillStyle = fill; ctx.beginPath(); points.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.fill(); }
  function car(x, y, size, color, boost, tilt) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt || 0); ctx.scale(size / 120, size / 120);
    ctx.fillStyle = '#07162566'; ctx.beginPath(); ctx.ellipse(0, 6, 64, 13, 0, 0, Math.PI * 2); ctx.fill();
    if (boost) { polygon([[-34, 1], [-21, 1], [-27, 38 + Math.sin(s.time * 35) * 10]], '#ff7b3a'); polygon([[21, 1], [34, 1], [27, 38 + Math.cos(s.time * 35) * 10]], '#ff7b3a'); polygon([[-30, 0], [-24, 0], [-27, 23]], '#fff1a9'); polygon([[24, 0], [30, 0], [27, 23]], '#fff1a9'); }
    ctx.fillStyle = '#0b1525'; ctx.fillRect(-56, -29, 16, 35); ctx.fillRect(40, -29, 16, 35);
    polygon([[-58, 0], [-53, -31], [-36, -42], [-26, -64], [26, -64], [36, -42], [53, -31], [58, 0]], color);
    polygon([[-29, -42], [-21, -59], [21, -59], [29, -42]], '#15384b');
    polygon([[-21, -57], [18, -57], [23, -49], [-25, -49]], '#81c4d7');
    polygon([[-50, -29], [-32, -36], [32, -36], [50, -29], [42, -21], [-42, -21]], '#ffffff25');
    ctx.fillStyle = '#152330'; ctx.fillRect(-45, -9, 90, 8); ctx.fillRect(-34, -21, 68, 5); ctx.fillStyle = '#ffefbb'; ctx.fillRect(-48, -18, 18, 5); ctx.fillRect(30, -18, 18, 5);
    ctx.fillStyle = '#071928'; ctx.fillRect(-45, -39, 90, 5); ctx.fillStyle = '#ffffff70'; ctx.fillRect(-25, -64, 50, 3); ctx.restore();
  }
  function draw() {
    var track = H.tracks[s.track], gradient = ctx.createLinearGradient(0, 0, 0, h); gradient.addColorStop(0, track.sky); gradient.addColorStop(1, '#e8eeee'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = s.track === 2 ? '#fff3ce' : '#fff3c3'; ctx.beginPath(); ctx.arc(w * .78, h * .25, Math.min(w, h) * .065, 0, Math.PI * 2); ctx.fill();
    if (s.track === 2) { for (var city = 0; city < 15; city++) { var cx = city * w / 14, bh = 30 + (city * 37 % 90); ctx.fillStyle = city % 2 ? '#233a54' : '#314d69'; ctx.fillRect(cx, h * .5 - bh, w / 17, bh); ctx.fillStyle = '#ffe9a680'; for (var wy = h * .5 - bh + 8; wy < h * .5; wy += 13) ctx.fillRect(cx + 7, wy, 4, 5); } }
    else { polygon([[0, h * .52], [0, h * .44], [w * .1, h * .34], [w * .23, h * .46], [w * .35, h * .29], [w * .52, h * .48], [w * .7, h * .37], [w, h * .47], [w, h * .52]], s.track ? '#b57061' : '#6bafac'); }
    ctx.fillStyle = track.ground; ctx.fillRect(0, h * .5, w, h * .5);
    function bend(z) { return (Math.sin((s.z + z) / 2100) - Math.sin(s.z / 2100) - Math.cos(s.z / 2100) * z / 2100) * 420 * track.curve; }
    // Camera sits behind the player: objects at race distance zero meet its wheels.
    function point(z) { return H.project({ x: bend(z), y: 0, z: z + 1000 }, s.x * 1100, 620, 0, 1, w, h, 1100); }
    for (var z = 10000; z > -550; z -= 150) {
      var far = point(z), near = point(z - 150), stripe = Math.floor((s.z + z) / 300) % 2;
      polygon([[far.x - far.w * 1.10, far.y], [far.x + far.w * 1.10, far.y], [near.x + near.w * 1.10, near.y], [near.x - near.w * 1.10, near.y]], stripe ? '#fff2d1' : '#e37566');
      polygon([[far.x - far.w, far.y], [far.x + far.w, far.y], [near.x + near.w, near.y], [near.x - near.w, near.y]], stripe ? track.road : '#465867');
      if (stripe) [-.33, .33].forEach(function (lane) { polygon([[far.x + far.w * (lane - .008), far.y], [far.x + far.w * (lane + .008), far.y], [near.x + near.w * (lane + .008), near.y], [near.x + near.w * (lane - .008), near.y]], '#f7efdccc'); });
    }
    var objects = s.traffic.map(function (r) { return { z: r.z, x: r.x, color: r.color }; }).concat(s.ramps.filter(function (r) { return !r.used; }).map(function (r) { return { z: r.z, x: r.x, ramp: true }; }));
    objects.sort(function (a, b) { return b.z - a.z; }); objects.forEach(function (r) { var d = r.z - s.z; if (d < -80 || d > 9500) return; var p = point(d), x = p.x + r.x * p.w; if (r.ramp) { var width = p.w * .28; polygon([[x - width, p.y], [x + width, p.y], [x + width * .65, p.y - width * .7], [x - width * .65, p.y - width * .7]], '#ffce65'); ctx.strokeStyle = '#fff8d0'; ctx.lineWidth = Math.max(1, width * .12); ctx.beginPath(); ctx.moveTo(x, p.y - 4); ctx.lineTo(x, p.y - width * .5); ctx.stroke(); } else car(x, p.y, p.w * .32, r.color, false, 0); });
    var lift = s.flight ? Math.sin(Math.PI * s.flight / s.jumpTime) * Math.min(h * .20, 95) : 0;
    car(w / 2, h * .81 - lift, Math.min(155, w * .20), H.cars[s.car].color, s.boosted, ((input.left ? -1 : 0) + (input.right ? 1 : 0)) * .035);
    if (s.cool > 1.1) { ctx.fillStyle = '#ffd37722'; ctx.fillRect(0, 0, w, h); }
    if (s.flight) { ctx.font = 'bold 28px sans-serif'; ctx.fillStyle = '#fff4c3'; ctx.textAlign = 'center'; ctx.fillText('↗ ✨', w / 2, h * .35); }
  }
  function frame(now) { requestAnimationFrame(frame); if (gate) gate.check(); var dt = last ? Math.min(.08, (now - last) / 1000) : 0; last = now;
    if (!document.hidden && running && !paused && !blocked) { accumulator += dt; while (accumulator >= 1 / 120) { var oldBumps = s.bumps, oldJumps = s.jumps; H.step(s, input, 1 / 120); if (s.bumps !== oldBumps) tone(140); if (s.jumps !== oldJumps) tone(790); accumulator -= 1 / 120; } if (s.finished && !shown) { shown = true; tone(880); result(true); } } else accumulator = 0;
    $('speed').textContent = Math.round(s.speed * .18); $('progress').value = s.z / H.tracks[s.track].length; $('energy').value = s.nitro; draw();
  }
  resize();
  if (window.LearningGate) gate = LearningGate.mount({ gameId: 'nitro-highway', onLock: function () { blocked = true; clearInput(); last = 0; accumulator = 0; if (audio) audio.suspend().catch(function () {}); }, onUnlock: function () { blocked = false; last = 0; accumulator = 0; if (sound && audio) audio.resume().catch(function () {}); } });
  else { $('play').disabled = true; $('guide').hidden = false; $('guide').textContent = 'No se pudo cargar el reto. Recarga la página.'; }
  if (location.search.indexOf('test=1') !== -1) Object.defineProperty(window, '__highway', { get: function () { return { running: running, paused: paused, blocked: blocked, sound: sound, z: s.z, x: s.x, speed: s.speed, nitro: s.nitro, jumps: s.jumps, bumps: s.bumps, finished: s.finished, track: s.track, car: s.car, time: s.time, held: Object.keys(input).filter(function (k) { return k !== 'assist' && input[k]; }) }; } });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(function () {});
  requestAnimationFrame(frame);
})();
