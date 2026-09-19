(function () {
  'use strict';
  var P = window.OrbitPhysics;
  var canvas = document.getElementById('space');
  var ctx = canvas.getContext('2d', { alpha: false });
  var $ = function (id) { return document.getElementById(id); };
  var SAVE_KEY = 'orbit-lab-universe-v1';
  var MAX_BODIES = 24;
  var bodies = [], particles = [], pointers = {};
  var started = false, paused = false, speed = 1, selected = 'ocean', trails = true, sound = false;
  var width = 1, height = 1, scale = 1, centerX = 0, centerY = 0, cameraX = 0, cameraY = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 1.5), background = document.createElement('canvas');
  var bg = background.getContext('2d'), lastTime = 0, accumulator = 0, trailClock = 0, elapsed = 0;
  var orbitCount = 0, created = 0, toastTimer, saveClock = 0, audioContext, previousFocus;
  var milestones = { created: false, orbit: false, family: false };
  var saveAvailable = false, installPrompt;
  try { saveAvailable = !!localStorage.getItem(SAVE_KEY); } catch (e) { /* Private browsing still permits play. */ }
  $('resume').hidden = !saveAvailable;

  function notify(message) {
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $('toast').classList.remove('visible'); }, 2500);
  }
  function tone(frequency) {
    if (!sound) return;
    try {
      if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      var osc = audioContext.createOscillator(), gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, audioContext.currentTime + 0.15);
      gain.gain.setValueAtTime(0.045, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.35);
      osc.connect(gain); gain.connect(audioContext.destination); osc.start(); osc.stop(audioContext.currentTime + 0.4);
    } catch (e) { sound = false; }
  }
  function spark(x, y, color, count) {
    for (var i = 0; i < count && particles.length < 90; i++) {
      var angle = Math.random() * Math.PI * 2, velocity = 20 + Math.random() * 50;
      particles.push({ x: x, y: y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, life: 1, color: color });
    }
  }
  function makeUniverse(kind) {
    bodies = [P.body('star', 0, 0)];
    if (kind === 'solar') {
      bodies.push(P.orbit('rock', 100, -40, bodies[0]));
      bodies.push(P.orbit('ocean', -110, 150, bodies[0]));
      bodies.push(P.orbit('giant', 200, 190, bodies[0]));
    }
    if (kind === 'binary') {
      bodies[0].x = -90;
      bodies.push(P.body('star', 90, 0));
      var v = Math.sqrt(P.G * bodies[0].mass / 360);
      bodies[0].vy = -v; bodies[1].vy = v;
      bodies.push(P.orbit('ocean', 0, 290, { x: 0, y: 0, vx: 0, vy: 0, radius: 100, mass: 60 }));
    }
    particles = []; pointers = {}; orbitCount = 0; created = 0;
    milestones = { created: false, orbit: false, family: false };
    cameraX = 0; cameraY = 0; accumulator = 0; saveClock = 0;
    updateStatus();
  }
  function start(restore) {
    makeUniverse('solar');
    if (restore) load();
    started = true; paused = false;
    $('welcome').hidden = true; $('game-ui').hidden = false;
    updatePause(); resize(); canvas.focus();
  }
  function updateStatus() {
    $('count').textContent = bodies.length;
    $('orbit-count').textContent = orbitCount;
    $('count').setAttribute('aria-label', bodies.length + ' cuerpos celestes');
  }
  function updatePause() {
    $('pause').setAttribute('aria-pressed', String(paused));
    $('pause').setAttribute('aria-label', paused ? 'Continuar universo' : 'Pausar universo');
    $('pause').innerHTML = paused ? '<svg viewBox="0 0 24 24"><path d="m8 4 12 8-12 8z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>';
  }
  function save(manual) {
    if (!started) return;
    try {
      var saved = bodies.map(function (b) { return { type: b.type, x: b.x, y: b.y, vx: b.vx, vy: b.vy, mass: b.mass, radius: b.radius }; });
      localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, bodies: saved, orbitCount: orbitCount }));
      if (manual) { notify('✓ Universo guardado'); tone(660); }
    } catch (e) { if (manual) notify('No se puede guardar en este navegador'); }
  }
  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!data || data.version !== 1 || !Array.isArray(data.bodies) || !data.bodies.length || data.bodies.length > MAX_BODIES) return;
      var valid = data.bodies.every(function (b) {
        return P.types[b.type] && ['x', 'y', 'vx', 'vy', 'mass', 'radius'].every(function (key) { return typeof b[key] === 'number' && isFinite(b[key]); }) && Math.abs(b.x) < 2400 && Math.abs(b.y) < 2400 && Math.abs(b.vx) < 2000 && Math.abs(b.vy) < 2000 && b.mass > 0 && b.mass < 1000 && b.radius > 0 && b.radius <= 65;
      });
      if (!valid) return;
      bodies = data.bodies.map(function (b) { var restored = P.body(b.type, b.x, b.y, b.vx, b.vy); restored.mass = b.mass; restored.radius = b.radius; return restored; });
      orbitCount = Math.max(0, Math.min(100000, Number(data.orbitCount) || 0));
      updateStatus();
    } catch (e) { /* Invalid save falls back to a fresh solar system. */ }
  }
  function resize() {
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    background.width = canvas.width; background.height = canvas.height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); bg.setTransform(dpr, 0, 0, dpr, 0, 0);
    bg.fillStyle = '#080e22'; bg.fillRect(0, 0, width, height);
    var nebula = bg.createRadialGradient(width * 0.8, height * 0.55, 0, width * 0.8, height * 0.55, width * 0.65);
    nebula.addColorStop(0, '#162740'); nebula.addColorStop(0.48, '#10192f'); nebula.addColorStop(1, '#080e22');
    bg.fillStyle = nebula; bg.fillRect(0, 0, width, height);
    var seed = 187;
    function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    for (var i = 0; i < Math.min(230, width * height / 2800); i++) {
      var x = rand() * width, y = rand() * height, radius = rand() > 0.95 ? 1.6 : rand() * 0.8 + 0.3;
      bg.globalAlpha = 0.18 + rand() * 0.65; bg.fillStyle = '#bccfe9'; bg.beginPath(); bg.arc(x, y, radius, 0, Math.PI * 2); bg.fill();
    }
    bg.globalAlpha = 1;
  }
  function primary() {
    return bodies.reduce(function (a, b) { return !a || b.mass > a.mass ? b : a; }, null);
  }
  function project(x, y) { return { x: centerX + (x - cameraX) * scale, y: centerY + (y - cameraY) * scale }; }
  function world(x, y) { return { x: (x - centerX) / scale + cameraX, y: (y - centerY) / scale + cameraY }; }
  function select(type) {
    selected = type;
    document.querySelectorAll('[data-body]').forEach(function (button) {
      var chosen = button.getAttribute('data-body') === type;
      button.classList.toggle('selected', chosen); button.setAttribute('aria-pressed', String(chosen));
    });
  }
  function create(pointer) {
    if (bodies.length >= MAX_BODIES) { notify('✦ 24 cuerpos · empieza otro universo con ↺'); return; }
    var p = pointer.palette ? pointer.end : pointer.start;
    if (p.y < 70 || p.y > height - (height < 520 && width > height ? 82 : 115)) return;
    var pos = world(p.x, p.y), anchor = primary();
    var b = anchor ? P.orbit(pointer.type, pos.x, pos.y, anchor) : P.body(pointer.type, pos.x, pos.y);
    var dx = pointer.end.x - pointer.start.x, dy = pointer.end.y - pointer.start.y;
    if (!pointer.palette && dx * dx + dy * dy > 24 * 24) {
      b.x = pos.x; b.y = pos.y;
      var strength = Math.min(2, 210 / Math.sqrt(dx * dx + dy * dy));
      b.vx = dx * strength; b.vy = dy * strength;
    }
    bodies.push(b); created++;
    spark(b.x, b.y, P.types[b.type].color, 15); tone(290 + bodies.length * 28); updateStatus();
    if (created === 1) $('hint-text').textContent = 'Arrastra y suelta · lanza un planeta';
    if (created >= 3 && !milestones.created) { milestones.created = true; notify('✦ ¡Ya eres un creador de mundos!'); }
    if (created >= 5) $('hint').style.opacity = '0';
    var types = {};
    bodies.forEach(function (body) { types[body.type] = true; });
    if (Object.keys(types).length >= 5 && !milestones.family) { milestones.family = true; notify('✦ ¡Una familia de cinco mundos!'); }
    save(false);
  }
  function pointerDown(e, paletteType) {
    if (!started || !$('templates').hidden || !$('help-dialog').hidden || e.button > 0) return;
    if (paletteType) select(paletteType);
    var point = { x: e.clientX, y: e.clientY };
    pointers[e.pointerId] = { start: point, end: point, type: paletteType || selected, palette: !!paletteType };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (error) { /* A contact may already have ended during event delivery. */ }
    if (!paletteType) e.preventDefault();
  }
  function pointerMove(e) {
    if (pointers[e.pointerId]) { pointers[e.pointerId].end = { x: e.clientX, y: e.clientY }; e.preventDefault(); }
  }
  function pointerUp(e) {
    var pointer = pointers[e.pointerId];
    if (!pointer) return;
    pointer.end = { x: e.clientX, y: e.clientY };
    if (!pointer.palette || Math.abs(pointer.start.y - pointer.end.y) > 25) create(pointer);
    delete pointers[e.pointerId];
  }
  canvas.addEventListener('pointerdown', function (e) { pointerDown(e); });
  window.addEventListener('pointermove', pointerMove, { passive: false });
  window.addEventListener('pointerup', pointerUp);
  window.addEventListener('pointercancel', function (e) { delete pointers[e.pointerId]; });
  document.querySelectorAll('[data-body]').forEach(function (button) {
    button.style.touchAction = 'none';
    button.addEventListener('pointerdown', function (e) { pointerDown(e, button.getAttribute('data-body')); });
    button.addEventListener('click', function () { select(button.getAttribute('data-body')); });
  });
  canvas.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && started) {
      var angle = created * 2.4, radius = 130 + (created % 4) * 43;
      var p = project(cameraX + Math.cos(angle) * radius, cameraY + Math.sin(angle) * radius);
      create({ start: p, end: p, type: selected, palette: false }); e.preventDefault();
    }
    if (e.key === ' ' && started) { paused = !paused; updatePause(); e.preventDefault(); }
  });
  $('start').addEventListener('click', function () { start(false); });
  $('resume').addEventListener('click', function () { start(true); });
  $('pause').addEventListener('click', function () { paused = !paused; updatePause(); });
  $('speed').addEventListener('click', function () { speed = speed === 1 ? 2 : speed === 2 ? 0.5 : 1; $('speed').textContent = speed + '×'; $('speed').setAttribute('aria-label', 'Velocidad ' + speed + '. Cambiar velocidad'); });
  $('trails').addEventListener('click', function () { trails = !trails; $('trails').setAttribute('aria-pressed', String(trails)); $('trails').setAttribute('aria-label', trails ? 'Ocultar trayectorias' : 'Mostrar trayectorias'); });
  $('sound').addEventListener('click', function () {
    sound = !sound; $('sound').setAttribute('aria-pressed', String(sound)); $('sound').setAttribute('aria-label', sound ? 'Silenciar sonido' : 'Activar sonido');
    $('sound').innerHTML = sound ? '<svg viewBox="0 0 24 24"><path d="m11 4-5 5H3v6h3l5 5zM16 8a6 6 0 0 1 0 8M19 4a11 11 0 0 1 0 16"/></svg>' : '<svg viewBox="0 0 24 24"><path d="m11 4-5 5H3v6h3l5 5zM16 9l6 6m0-6-6 6"/></svg>';
    if (sound) tone(520);
  });
  $('save').addEventListener('click', function () { save(true); });
  $('reset').addEventListener('click', function () { previousFocus = document.activeElement; $('templates').hidden = false; $('close-templates').focus(); });
  function closeTemplates() { $('templates').hidden = true; if (previousFocus) previousFocus.focus(); }
  $('close-templates').addEventListener('click', closeTemplates);
  $('help').addEventListener('click', function () { previousFocus = document.activeElement; $('help-dialog').hidden = false; $('close-help').focus(); });
  function closeHelp() { $('help-dialog').hidden = true; if (previousFocus) previousFocus.focus(); }
  $('close-help').addEventListener('click', closeHelp);
  $('help-dialog').addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeHelp();
    if (e.key === 'Tab') {
      var focusable = Array.prototype.filter.call($('help-dialog').querySelectorAll('button, summary, a'), function (el) { return el.getClientRects().length > 0; });
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installPrompt = e; $('install').hidden = false; });
  $('install').addEventListener('click', function () { if (installPrompt) { installPrompt.prompt(); installPrompt.userChoice.then(function () { installPrompt = null; $('install').hidden = true; }); } });
  $('templates').addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeTemplates();
    if (e.key === 'Tab') {
      var buttons = $('templates').querySelectorAll('button'), first = buttons[0], last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  document.querySelectorAll('[data-template]').forEach(function (button) {
    button.addEventListener('click', function () { makeUniverse(button.getAttribute('data-template')); paused = false; updatePause(); closeTemplates(); save(false); });
  });
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () { accumulator = 0; lastTime = 0; if (document.hidden) save(false); });
  window.addEventListener('pagehide', function () { save(false); });

  function drawPlanet(b, screen, radius, time) {
    var color = P.types[b.type].color;
    if (b.type === 'star') {
      var halo = ctx.createRadialGradient(screen.x, screen.y, radius * 0.6, screen.x, screen.y, radius * 4);
      halo.addColorStop(0, '#ffc16c39'); halo.addColorStop(0.45, '#fb9d3c12'); halo.addColorStop(1, '#fb9d3c00');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(screen.x, screen.y, radius * 4, 0, Math.PI * 2); ctx.fill();
    }
    if (b.type === 'comet') {
      var angle = Math.atan2(b.vy, b.vx);
      ctx.save(); ctx.translate(screen.x, screen.y); ctx.rotate(angle);
      var tail = ctx.createLinearGradient(-radius * 9, 0, 0, 0); tail.addColorStop(0, '#9bdcff00'); tail.addColorStop(1, '#9bdcff88');
      ctx.fillStyle = tail; ctx.beginPath(); ctx.moveTo(-radius * 9, 0); ctx.lineTo(0, -radius); ctx.lineTo(0, radius); ctx.fill(); ctx.restore();
    }
    ctx.save(); ctx.translate(screen.x, screen.y);
    if (b.type === 'giant') {
      ctx.save(); ctx.rotate(-0.45); ctx.strokeStyle = '#c7a8e87c'; ctx.lineWidth = radius * 0.29;
      ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.9, radius * 0.51, 0, Math.PI, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.clip();
    var globe = ctx.createRadialGradient(-radius * 0.35, -radius * 0.4, radius * 0.1, radius * 0.3, radius * 0.35, radius * 1.4);
    globe.addColorStop(0, b.type === 'star' ? '#ffedbb' : color); globe.addColorStop(0.6, color); globe.addColorStop(1, b.type === 'star' ? '#ec704d' : '#142331');
    ctx.fillStyle = globe; ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    if (b.type === 'ocean') {
      ctx.fillStyle = '#9ceabc';
      ctx.beginPath(); ctx.moveTo(-radius * 0.65, -radius); ctx.bezierCurveTo(radius * 0.4, -radius * 0.7, -radius * 0.6, -radius * 0.2, radius * 0.2, radius * 0.2); ctx.bezierCurveTo(radius * 0.7, radius * 0.6, -radius * 0.4, radius * 0.9, -radius * 0.2, radius * 0.3); ctx.bezierCurveTo(-radius * 0.5, 0, -radius, -radius * 0.1, -radius * 0.65, -radius); ctx.fill();
      ctx.fillStyle = '#ffffff30'; ctx.fillRect(-radius, -radius * 0.45, radius * 2, radius * 0.13);
    }
    if (b.type === 'giant') {
      ctx.fillStyle = '#f1d6ff45';
      for (var band = -0.65; band < 1; band += 0.45) ctx.fillRect(-radius, radius * band, radius * 2, radius * 0.15);
    }
    if (b.type === 'rock') {
      ctx.fillStyle = '#673c342e'; [[-0.35, -0.2, 0.2], [0.4, 0.2, 0.3], [-0.3, 0.6, 0.18]].forEach(function (crater) { ctx.beginPath(); ctx.arc(crater[0] * radius, crater[1] * radius, crater[2] * radius, 0, Math.PI * 2); ctx.fill(); });
    }
    ctx.restore();
    if (b.type === 'giant') {
      ctx.save(); ctx.rotate(-0.45); ctx.strokeStyle = '#d8c0ee'; ctx.lineWidth = radius * 0.24;
      ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.9, radius * 0.51, 0, 0, Math.PI); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  }
  function render(time) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(background, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var anchor = primary();
    if (anchor) { cameraX += (anchor.x - cameraX) * 0.035; cameraY += (anchor.y - cameraY) * 0.035; }
    var extent = 340;
    bodies.forEach(function (b) { extent = Math.max(extent, Math.min(900, Math.sqrt(Math.pow(b.x - cameraX, 2) + Math.pow(b.y - cameraY, 2)) + 45)); });
    var areaHeight = height - (height < 520 && width > height ? 153 : 235);
    centerX = started ? (width - (width < 500 ? 40 : 30)) / 2 : width > 650 ? width * 0.76 : width * 0.62;
    centerY = started ? 76 + areaHeight / 2 : height * 0.57;
    var targetScale = Math.min((width - (width < 500 ? 65 : 160)) / (extent * 2), areaHeight / (extent * 2));
    if (!started) targetScale = Math.min(width > 650 ? width * 0.65 / 680 : width / 440, height / 620);
    scale += (Math.max(0.09, targetScale) - scale) * 0.1;
    var origin = project(anchor ? anchor.x : 0, anchor ? anchor.y : 0);
    ctx.strokeStyle = '#829cc514'; ctx.lineWidth = 1;
    [110, 190, 280].forEach(function (r) { ctx.beginPath(); ctx.arc(origin.x, origin.y, r * scale, 0, Math.PI * 2); ctx.stroke(); });
    bodies.forEach(function (b) {
      var screen = project(b.x, b.y);
      if (trails && b.trail.length > 1) {
        ctx.strokeStyle = P.types[b.type].color + '55'; ctx.lineWidth = 1.2;
        ctx.beginPath(); b.trail.forEach(function (p, index) { var s = project(p.x, p.y); if (!index) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y); }); ctx.stroke();
      }
      drawPlanet(b, screen, Math.max(b.type === 'star' ? 18 : b.type === 'giant' ? 11 : 6, b.radius * scale), time);
    });
    particles.forEach(function (p) { var s = project(p.x, p.y); ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(s.x, s.y, Math.max(1, 3 * p.life), 0, Math.PI * 2); ctx.fill(); }); ctx.globalAlpha = 1;
    Object.keys(pointers).forEach(function (key) {
      var p = pointers[key], preview = p.palette ? p.end : p.start;
      ctx.strokeStyle = '#b9fff0'; ctx.lineWidth = 2; ctx.setLineDash([5, 7]); ctx.beginPath(); ctx.moveTo(p.start.x, p.start.y); ctx.lineTo(p.end.x, p.end.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 0.7; drawPlanet({ type: p.type, vx: 1, vy: -1 }, preview, p.type === 'star' ? 20 : 12, time); ctx.globalAlpha = 1;
      if (!p.palette) {
        var dx = p.end.x - p.start.x, dy = p.end.y - p.start.y;
        if (dx * dx + dy * dy > 576) { var angle = Math.atan2(dy, dx); ctx.beginPath(); ctx.moveTo(p.end.x - 12 * Math.cos(angle - 0.5), p.end.y - 12 * Math.sin(angle - 0.5)); ctx.lineTo(p.end.x, p.end.y); ctx.lineTo(p.end.x - 12 * Math.cos(angle + 0.5), p.end.y - 12 * Math.sin(angle + 0.5)); ctx.stroke(); }
      }
    });
    if (!started) {
      var veil = ctx.createLinearGradient(0, 0, width, 0); veil.addColorStop(0, '#080e22ee'); veil.addColorStop(width > 650 ? 0.44 : 0.15, '#080e22bb'); veil.addColorStop(1, '#080e2200');
      ctx.fillStyle = veil; ctx.fillRect(0, 0, width, height);
    }
  }
  function tick(time) {
    requestAnimationFrame(tick);
    if (document.hidden) return;
    var dt = lastTime ? Math.min((time - lastTime) / 1000, 0.08) : 0;
    lastTime = time; elapsed += dt;
    if ((!started || !paused) && $('templates').hidden && $('help-dialog').hidden) {
      accumulator += dt * (started ? speed : 0.6);
      var steps = 0;
      while (accumulator >= 1 / 120 && steps < 20) {
        P.step(bodies, 1 / 120, function (b) { spark(b.x, b.y, P.types[b.type].color, 25); if (started) { tone(180); updateStatus(); } });
        accumulator -= 1 / 120; steps++;
      }
      if (steps === 20) accumulator = 0;
      trailClock += dt;
      var sun = primary();
      if (trailClock >= 0.075) {
        trailClock = 0;
        bodies.forEach(function (b) {
          b.trail.push({ x: b.x, y: b.y }); if (b.trail.length > 100) b.trail.shift();
          if (sun && b !== sun) {
            var angle = Math.atan2(b.y - sun.y, b.x - sun.x);
            if (b.lastAngle !== null) { var delta = angle - b.lastAngle; if (delta > Math.PI) delta -= Math.PI * 2; if (delta < -Math.PI) delta += Math.PI * 2; b.angleTravel += delta; }
            b.lastAngle = angle;
            if (Math.abs(b.angleTravel) >= Math.PI * 2) {
              b.angleTravel = 0; b.orbits++; orbitCount++; updateStatus();
              if (started && !milestones.orbit) { milestones.orbit = true; notify('↻ ¡Tu primera vuelta al sol!'); tone(800); }
            }
          }
        });
      }
      bodies = bodies.filter(function (b) {
        if (sun && b !== sun && Math.hypot(b.x - sun.x, b.y - sun.y) > 1700) { if (started) notify('☄ ¡Un viajero hacia las estrellas!'); return false; }
        return true;
      });
      updateStatus();
    }
    particles.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 0.8; });
    particles = particles.filter(function (p) { return p.life > 0; });
    saveClock += dt; if (saveClock > 15) { saveClock = 0; save(false); }
    render(time / 1000);
  }
  if (location.search.indexOf('test=1') !== -1) {
    Object.defineProperty(window, '__orbitDiagnostics', { get: function () { return { started: started, paused: paused, speed: speed, sound: sound, bodyCount: bodies.length, particles: particles.length, orbitCount: orbitCount, pointers: Object.keys(pointers).length, bodies: bodies.map(function (b) { return { type: b.type, x: b.x, y: b.y, vx: b.vx, vy: b.vy, mass: b.mass }; }) }; } });
  }
  makeUniverse('solar'); resize(); scale = Math.min(width, height) / 680; requestAnimationFrame(tick);
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('./sw.js').catch(function () { /* Online play also works without offline installation. */ }); });
  }
}());
