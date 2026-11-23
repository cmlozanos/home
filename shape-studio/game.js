
// Native presentation follows the public API; attributes cover older/offline shells.
(function () {
  var root = document.documentElement, appearance = {};
  var dark = window.matchMedia('(prefers-color-scheme: dark)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function sync(event) {
    if (event && event.detail) appearance = event.detail;
    var api = window.FamilyV2;
    var theme = api && typeof api.theme === 'function' ? api.theme() :
      appearance.theme || root.getAttribute('data-family-theme') || (dark.matches ? 'dark' : 'light');
    var motion = api && typeof api.motionAllowed === 'function' ? api.motionAllowed() :
      appearance.motion !== false && !root.classList.contains('family-no-motion') && !reduced.matches;
    root.setAttribute('data-native-theme', theme);
    root.setAttribute('data-native-motion', String(motion && !reduced.matches));
    root.style.setProperty('--native-font', '"' + (api && api.fontFamily || 'Family School') + '"');
  }
  window.addEventListener('familyv2:appearance', sync);
  new MutationObserver(function () { sync(); }).observe(root, {attributes:true, attributeFilter:['data-family-theme','class']});
  if (dark.addEventListener) { dark.addEventListener('change', sync); reduced.addEventListener('change', sync); }
  else { dark.addListener(sync); reduced.addListener(sync); }
  sync();
}());

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
  if (!window.LearningGate) { document.body.textContent = '↻ Recarga para cargar el reto'; return; }
  var learningLocked = true, learningTimers = LearningGate.createTimers();
  var menuPaused = false, helpPaused = false, familyPaused = false, gamePaused = false, pausedAt = 0, audioWasRunning = false;
  function syncPause() {
    var paused = learningLocked || familyPaused || helpPaused || menuPaused;
    if (paused === gamePaused) return;
    gamePaused = paused;
    if (paused) {
      pausedAt = performance.now();
      learningTimers.pause();
      cancelDrag();
      document.querySelectorAll('.slot').forEach(function (slot) { slot.classList.remove('hover'); });
      audioWasRunning = !!audio && audio.state === 'running';
      if (audioWasRunning) audio.suspend().catch(function () {});
    } else {
      learningTimers.resume();
      if (audioWasRunning && sound) audio.resume().catch(function () {});
    }
  }
  document.getElementById('help').addEventListener('click', function () {
    helpPaused = true; syncPause();
    var shell = document.querySelector('family-v2-shell');
    if (shell && shell.shadowRoot) shell.shadowRoot.querySelector('dialog').close();
  }, true);
  function closeMenu() {
    document.getElementById('game-menu').hidden = true; menuPaused = false; syncPause();
    var shell = document.querySelector('family-v2-shell'); if (shell) shell.shadowRoot.querySelector('#home').focus();
  }
  function openMenu() {
    menuPaused = true; syncPause();
    document.getElementById('game-menu').hidden = false; document.getElementById('menu-continue').focus();
  }
  document.getElementById('menu-continue').addEventListener('click', closeMenu);
  document.querySelectorAll('[data-menu-level]').forEach(function (button) {
    button.addEventListener('click', function () {
      closeMenu();
      var index = Number(button.dataset.menuLevel);
      var choices = document.querySelectorAll('button[data-level],button.level[data-size]');
      if (choices[index]) choices[index].click();
    });
  });
  window.addEventListener('keydown', function (event) {
    var menu = document.getElementById('game-menu'); if (menu.hidden || learningLocked) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); closeMenu(); }
    if (event.key === 'Tab') {
      var buttons = menu.querySelectorAll('button'), first = buttons[0], last = buttons[buttons.length - 1];
      event.stopImmediatePropagation();
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }, true);
  document.addEventListener('DOMContentLoaded', function () {
    if (window.FamilyV2) FamilyV2.register({pause:familyPause,resume:familyResume,home:openMenu});
  });
  function familyPause() { familyPaused = true; syncPause(); }
  function familyResume() { familyPaused = false; syncPause(); }
  document.addEventListener('familyv2:pause', familyPause);
  document.addEventListener('familyv2:resume', familyResume);
  window.addEventListener('familyv2:pause', familyPause);
  window.addEventListener('familyv2:resume', familyResume);
  var roundId = 0;
  var $ = function (id) { return document.getElementById(id); };
  var shapes = [
    { id:'circle', name:'Círculo', color:'#dcaa52', shape:'<circle cx="50" cy="50" r="33"/>', detail:'<path d="M31 51q19-23 38 0M33 57q17 18 34 0"/>' },
    { id:'triangle', name:'Triángulo', color:'#dc8764', shape:'<path d="M50 14 88 83H12Z"/>', detail:'<path d="m37 59 13-25 13 25m-30 13h34"/>' },
    { id:'square', name:'Cuadrado', color:'#779e9e', shape:'<rect x="20" y="20" width="60" height="60" rx="3"/>', detail:'<path d="M35 35h30v30H35ZM50 35v30M35 50h30"/>' },
    { id:'star', name:'Estrella', color:'#a596b2', shape:'<path d="m50 10 12 26 28 4-20 20 5 29-25-14-25 14 5-29L10 40l28-4Z"/>', detail:'<path d="m50 28 8 17 18 3-13 12 3 17-16-8-16 8 3-17-13-12 18-3Z"/>' },
    { id:'oval', name:'Óvalo', color:'#8baa7c', shape:'<ellipse cx="50" cy="50" rx="23" ry="38"/>', detail:'<path d="M50 25v50M50 40l-12-7m12 20 13-9M50 64l-12-8"/>' },
    { id:'rectangle', name:'Rectángulo', color:'#c78080', shape:'<rect x="12" y="30" width="76" height="40" rx="3"/>', detail:'<path d="M25 42h14v16H25Zm23 0h26v16H48Z"/>' },
    { id:'diamond', name:'Rombo', color:'#dbad63', shape:'<path d="m50 8 34 42-34 42L16 50Z"/>', detail:'<path d="m50 27 19 23-19 23-19-23Z"/>' },
    { id:'hexagon', name:'Hexágono', color:'#849fab', shape:'<path d="M30 15h40l20 35-20 35H30L10 50Z"/>', detail:'<path d="M38 30h24l12 20-12 20H38L26 50Z"/>' }
  ];
  var level = 0, selected = null, placed = [], current = [], sound = false, audio, drag = null, ignoreClickUntil = 0, completed = [], installEvent, finishTimer, feedbackTimer, previousFocus;
  try { var saved = JSON.parse(localStorage.getItem('shape-studio-progress') || '[]'); if (Array.isArray(saved)) completed = saved.filter(function (n) { return n === 0 || n === 1 || n === 2; }); } catch (_) {}
  var materialId = 0;
  function art(shape, outline) {
    var color = level === 2 ? '#d8a65c' : shape.color, id = 'inlay-' + (++materialId);
    var finish = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#ffffff" stop-opacity=".48"/><stop offset=".42" stop-color="' + color + '"/><stop offset="1" stop-color="#000000" stop-opacity=".16"/></linearGradient></defs>';
    var body = '<g class="geometry" fill="' + (outline ? '#d6d1c1' : color) + '" stroke="' + (outline ? '#a6ad99' : '#4b514055') + '" stroke-width="' + (outline ? '2' : '1.5') + '"' + (outline ? ' stroke-dasharray="4 4"' : '') + '>' + shape.shape + '</g>';
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' + (outline ? '' : finish) + body + (outline ? '' : '<g fill="url(#' + id + ')" pointer-events="none">' + shape.shape + '</g><g fill="none" stroke="#fff5df" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity=".58">' + shape.detail + '</g>') + '</svg>';
  }
  function chime(frequency) { if (learningLocked || familyPaused || !sound) return; try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); var oscillator = audio.createOscillator(), gain = audio.createGain(); oscillator.connect(gain); gain.connect(audio.destination); oscillator.frequency.setValueAtTime(frequency, audio.currentTime); gain.gain.setValueAtTime(.065, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .18); oscillator.start(); oscillator.stop(audio.currentTime + .2); } catch (_) {} }
  function update() { $('progress').innerHTML = current.map(function (_, i) { return '<span class="' + (i < placed.length ? 'filled' : '') + '" aria-hidden="true">◆</span>'; }).join(''); $('progress').setAttribute('aria-label', placed.length + ' de ' + current.length + ' formas colocadas'); $('saved').textContent = completed.length ? '★ '.repeat(completed.length) : '◇ ◇ ◇'; }
  function cancelDrag() { if (!drag) return; var active = drag; drag = null; active.ghost.remove(); active.button.classList.remove('dragging'); try { active.button.releasePointerCapture(active.pointer); } catch (_) {} }
  function start(nextLevel) {
    roundId++;
    cancelDrag(); learningTimers.clear(finishTimer); learningTimers.clear(feedbackTimer); level = nextLevel; selected = null; placed = []; current = shapes.slice(0, [4,6,8][level]); $('win').hidden = true; $('slots').innerHTML = ''; $('tray').innerHTML = ''; document.body.dataset.level = level; $('scene-name').textContent = ['El jardín', 'La aldea', 'El taller dorado'][level];
    ShapeStudio.shuffle(current).forEach(function (shape) { var slot = document.createElement('button'); slot.className = 'slot'; slot.dataset.shape = shape.id; slot.setAttribute('aria-label', 'Hueco: ' + shape.name); slot.innerHTML = art(shape, true) + '<span class="slot-check" aria-hidden="true">✓</span>'; slot.addEventListener('click', function () { if (selected) attempt(selected, shape.id); else { $('status').textContent = 'Primero elige una pieza.'; $('tray').classList.add('nudge'); learningTimers.set(function () { $('tray').classList.remove('nudge'); }, 400); } }); $('slots').appendChild(slot); });
    ShapeStudio.shuffle(current).forEach(function (shape) { var piece = document.createElement('button'); piece.className = 'piece'; piece.dataset.shape = shape.id; piece.setAttribute('aria-label', 'Pieza: ' + shape.name); piece.setAttribute('aria-pressed', 'false'); piece.innerHTML = art(shape, false); piece.addEventListener('click', function () { if (Date.now() < ignoreClickUntil) return; select(shape.id); }); piece.addEventListener('pointerdown', function (event) { beginDrag(event, piece, shape.id); }); $('tray').appendChild(piece); });
    document.querySelectorAll('.levels [data-level]').forEach(function (button) { button.setAttribute('aria-pressed', Number(button.dataset.level) === level ? 'true' : 'false'); }); $('status').textContent = 'Lleva cada forma a su silueta.'; update();
  }
  function select(id) { if (learningLocked || familyPaused || helpPaused || menuPaused) return; if (placed.indexOf(id) !== -1) return; selected = id; document.querySelectorAll('.piece').forEach(function (piece) { piece.setAttribute('aria-pressed', String(piece.dataset.shape === id)); }); $('slots').classList.add('ready'); }
  function attempt(pieceId, slotId) {
    if (learningLocked || familyPaused || helpPaused || menuPaused) return;
    var slot = $('slots').querySelector('[data-shape="' + slotId + '"]'), piece = $('tray').querySelector('[data-shape="' + pieceId + '"]');
    if (!slot || !piece || placed.indexOf(slotId) !== -1) return;
    if (!ShapeStudio.place(placed, pieceId, slotId)) { slot.classList.remove('wrong'); void slot.offsetWidth; slot.classList.add('wrong'); $('status').textContent = 'Esa forma tiene otro sitio. Prueba otra silueta.'; learningTimers.clear(feedbackTimer); feedbackTimer = learningTimers.set(function () { slot.classList.remove('wrong'); }, 500); return; }
    if (window.FamilyV2) FamilyV2.award(roundId + ':' + pieceId, 1);
    slot.innerHTML = art(current.filter(function (shape) { return shape.id === pieceId; })[0], false) + '<span class="slot-check" aria-hidden="true">✓</span>'; slot.classList.add('placed'); slot.disabled = true; slot.setAttribute('aria-label', piece.getAttribute('aria-label').replace('Pieza: ', '') + ', colocada'); piece.classList.add('placed'); piece.disabled = true; piece.setAttribute('aria-pressed', 'false'); selected = null; $('slots').classList.remove('ready'); $('status').textContent = '¡Encaja!'; update(); chime(620 + placed.length * 50);
    if (placed.length === current.length) finishTimer = learningTimers.set(finish, 450);
  }
  function beginDrag(event, button, id) {
    if (gamePaused || event.isPrimary === false || event.button !== 0 || button.disabled || drag) return;
    select(id); var rect = button.getBoundingClientRect(), ghost = document.createElement('div'); ghost.className = 'drag-ghost'; ghost.innerHTML = button.innerHTML; ghost.style.width = rect.width + 'px'; ghost.style.height = rect.height + 'px'; ghost.hidden = true; document.body.appendChild(ghost);
    drag = { id:id, pointer:event.pointerId, startX:event.clientX, startY:event.clientY, moved:false, ghost:ghost, button:button, width:rect.width, height:rect.height };
    try { button.setPointerCapture(event.pointerId); } catch (_) {}
  }
  document.addEventListener('pointermove', function (event) { if (!drag || drag.pointer !== event.pointerId) return; if (Math.abs(event.clientX - drag.startX) + Math.abs(event.clientY - drag.startY) > 8) drag.moved = true; if (!drag.moved) return; event.preventDefault(); drag.ghost.hidden = false; drag.button.classList.add('dragging'); drag.ghost.style.left = event.clientX - drag.width / 2 + 'px'; drag.ghost.style.top = event.clientY - drag.height / 2 + 'px'; document.querySelectorAll('.slot').forEach(function (slot) { slot.classList.toggle('hover', !slot.disabled && ShapeStudio.contains(slot.getBoundingClientRect(), event.clientX, event.clientY)); }); }, { passive:false });
  document.addEventListener('pointerup', function (event) { if (!drag || drag.pointer !== event.pointerId) return; var moving = drag; cancelDrag(); document.querySelectorAll('.slot').forEach(function (slot) { slot.classList.remove('hover'); if (moving.moved && !slot.disabled && ShapeStudio.contains(slot.getBoundingClientRect(), event.clientX, event.clientY)) attempt(moving.id, slot.dataset.shape); }); if (moving.moved) ignoreClickUntil = Date.now() + 350; });
  document.addEventListener('pointercancel', function (event) { if (!drag || drag.pointer !== event.pointerId) return; cancelDrag(); document.querySelectorAll('.slot').forEach(function (slot) { slot.classList.remove('hover'); }); }); window.addEventListener('blur', cancelDrag);
  function finish() { if (completed.indexOf(level) === -1) completed.push(level); try { localStorage.setItem('shape-studio-progress', JSON.stringify(completed)); } catch (_) {} update(); $('next').setAttribute('aria-label', level < 2 ? 'Siguiente dificultad' : 'Volver al jardín fácil'); $('win').hidden = false; $('next').focus(); chime(950); }
  document.querySelectorAll('.levels [data-level]').forEach(function (button) { button.addEventListener('click', function () { start(Number(button.dataset.level)); }); }); $('restart').addEventListener('click', function () { start(level); }); $('replay').addEventListener('click', function () { start(level); }); $('next').addEventListener('click', function () { start((level + 1) % 3); });
  $('sound').addEventListener('click', function () { sound = !sound; $('sound').setAttribute('aria-pressed', String(sound)); $('sound').setAttribute('aria-label', sound ? 'Desactivar sonido' : 'Activar sonido'); chime(660); });
  function closeHelp() { $('help-panel').hidden = true; helpPaused = false; syncPause(); if (previousFocus && previousFocus.getRootNode() === document) previousFocus.focus(); else { var shell = document.querySelector('family-v2-shell'); if (shell) shell.shadowRoot.querySelector('#adults').focus(); } }
  $('help').addEventListener('click', function () { previousFocus = document.activeElement; $('help-panel').hidden = false; $('close-help').focus(); }); $('close-help').addEventListener('click', closeHelp);
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') { if (!$('help-panel').hidden) closeHelp(); cancelDrag(); selected = null; $('slots').classList.remove('ready'); document.querySelectorAll('.piece').forEach(function (piece) { piece.setAttribute('aria-pressed', 'false'); }); } var overlay = !$('help-panel').hidden ? $('help-panel') : !$('win').hidden ? $('win') : null; if (event.key === 'Tab' && overlay) { var buttons = Array.prototype.filter.call(overlay.querySelectorAll('button,a'), function (node) { return !node.hidden && !node.disabled; }); var first = buttons[0], last = buttons[buttons.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } });
  window.addEventListener('beforeinstallprompt', function (event) { event.preventDefault(); installEvent = event; $('install').hidden = false; }); $('install').addEventListener('click', function () { if (installEvent) { installEvent.prompt(); installEvent = null; $('install').hidden = true; } }); if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {}); start(0);
  LearningGate.mount({gameId:'shape-studio',onLock:function(){
    learningLocked=true;syncPause();
    var shell=document.querySelector('family-v2-shell');
    if(shell&&shell.shadowRoot){var dialog=shell.shadowRoot.querySelector('dialog');if(dialog.open)dialog.close();}
  },onUnlock:function(){
    learningLocked=false;syncPause();
  }});
}());
