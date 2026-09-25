(function () {
  'use strict';
  if (!window.LearningGate) { document.body.textContent = '↻ Recarga para cargar el reto'; return; }
  var learningLocked = true, learningTimers = LearningGate.createTimers(), learningAudioWasRunning = false;
  var $ = function (id) { return document.getElementById(id); };
  var animals = [
    ['fox', 'Zorro', '#ed8a51', '<path fill="#de7141" d="m20 32 2-25 24 18h10L80 7l1 28 7 20-18 31H34L13 57Z"/><path fill="#fff0cc" d="M17 43 50 59 83 43 71 78 50 90 29 78Z"/><path fill="#f9bd81" d="m27 18 1 19 15-7m30-12-1 19-15-7"/><path fill="#273b39" d="m43 62 7 10 7-10Z"/><circle cx="34" cy="48" r="3"/><circle cx="65" cy="48" r="3"/>'],
    ['owl', 'Búho', '#b4a0ce', '<path fill="#8f76ab" d="m21 37-2-23 23 10h17l22-10-3 26 8 24q-6 28-36 28T14 62Z"/><path fill="#dbcee9" d="M50 44q-31-28-30 9t30 30q31-2 31-28T50 44Z"/><circle fill="#fff8db" cx="34" cy="46" r="16"/><circle fill="#fff8db" cx="66" cy="46" r="16"/><circle cx="35" cy="46" r="6"/><circle cx="65" cy="46" r="6"/><path fill="#ffc461" d="m44 63 6 9 6-9Z"/><path stroke="#ae92c6" stroke-width="3" fill="none" d="m35 75 5 5 5-5m10 0 5 5 5-5"/>'],
    ['frog', 'Rana', '#8fc684', '<ellipse fill="#78b976" cx="50" cy="59" rx="36" ry="29"/><circle fill="#78b976" cx="29" cy="32" r="17"/><circle fill="#78b976" cx="71" cy="32" r="17"/><circle fill="#fffae7" cx="29" cy="31" r="11"/><circle fill="#fffae7" cx="71" cy="31" r="11"/><circle cx="30" cy="31" r="5"/><circle cx="70" cy="31" r="5"/><path stroke="#315541" stroke-width="3" fill="none" d="M33 58q17 19 34 0"/><ellipse fill="#eeab9b" cx="26" cy="56" rx="6" ry="4"/><ellipse fill="#eeab9b" cx="75" cy="56" rx="6" ry="4"/>'],
    ['rabbit', 'Conejo', '#e9b5bb', '<ellipse fill="#e9b5bb" cx="34" cy="29" rx="11" ry="26" transform="rotate(-12 34 29)"/><ellipse fill="#e9b5bb" cx="66" cy="29" rx="11" ry="26" transform="rotate(12 66 29)"/><path stroke="#ce7f90" stroke-width="7" stroke-linecap="round" d="m31 12 5 24m33-24-5 24"/><ellipse fill="#f6d6d3" cx="50" cy="63" rx="33" ry="29"/><circle cx="36" cy="59" r="3"/><circle cx="65" cy="59" r="3"/><path fill="#b56780" d="m45 68 5 6 5-6Z"/><path stroke="#b56780" stroke-width="2" fill="none" d="M40 77q5 5 10-3 5 8 10 3"/>'],
    ['bird', 'Pájaro', '#81b9cf', '<path fill="#72abc6" d="M17 61Q10 23 47 20t39 38q-5 30-37 29l-32 2 9-13Z"/><path fill="#b7e1e8" d="M23 56q35-17 40 8T36 79Z"/><path fill="#f6bb53" d="m80 43 17 8-18 8Z"/><circle cx="67" cy="41" r="4"/><path stroke="#df9e44" stroke-width="4" stroke-linecap="round" d="m41 84-3 10m16-10-1 10"/><path stroke="#4e8fae" stroke-width="4" fill="none" d="m31 63 17 4"/>'],
    ['cat', 'Gato', '#e9be66', '<path fill="#edc66f" d="m20 44-2-31 27 16h10l28-16-3 33q14 42-29 45T20 44Z"/><path fill="#d49360" d="m25 24 2 17 13-8m34-9-2 17-13-8"/><path stroke="#bf9455" stroke-width="5" d="m42 31 3 13m13-13-3 13"/><circle cx="34" cy="53" r="3"/><circle cx="67" cy="53" r="3"/><path fill="#b6736e" d="m45 65 6 6 6-6Z"/><path stroke="#755c40" stroke-width="2" d="m20 63 15 3m-16 6 16-1m32-5 15-3m-15 8 15 1"/>'],
    ['beetle', 'Mariquita', '#df7880', '<path stroke="#30473e" stroke-width="4" stroke-linecap="round" d="m26 43-10-5m10 19-11 4m13 12-9 8m55-38 10-5M74 57l11 4M72 73l9 8M40 20l-5-8m25 8 5-8"/><circle fill="#30473e" cx="50" cy="30" r="19"/><ellipse fill="#dc6a70" cx="50" cy="60" rx="31" ry="32"/><path stroke="#30473e" stroke-width="3" d="M50 29v62"/><g fill="#703b44"><circle cx="35" cy="48" r="7"/><circle cx="66" cy="48" r="7"/><circle cx="34" cy="71" r="6"/><circle cx="65" cy="71" r="6"/></g><g fill="#fff5dc"><circle cx="41" cy="24" r="3"/><circle cx="58" cy="24" r="3"/></g>'],
    ['fish', 'Pez', '#eea266', '<path fill="#e89a55" d="m27 50-17-20v42Z"/><ellipse fill="#f2af67" cx="57" cy="51" rx="32" ry="25"/><path fill="#e58956" d="m45 29 15-16 13 17m-28 44 16 15 11-16"/><path fill="#f9d69d" d="M51 33Q33 51 52 69l12-18Z"/><circle cx="75" cy="46" r="4"/><g fill="none" stroke="#8cbeca" stroke-width="2"><circle cx="91" cy="28" r="5"/><circle cx="83" cy="12" r="3"/></g>']
  ];
  var level = 0, round, busy = false, previewing = false, timer, previewTimer, sound = false, audio, best = {}, installEvent, previousFocus;
  try { var saved = JSON.parse(localStorage.getItem('memory-garden-progress') || '{}'); if (saved && typeof saved === 'object') best = saved; } catch (_) {}
  function picture(animal) { return '<svg viewBox="0 0 100 100" aria-hidden="true" fill="#293c37">' + animal[3] + '</svg>'; }
  function say(message) { $('status').textContent = message; }
  function chime(frequency) {
    if (learningLocked) return;
    if (!sound) return;
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); var oscillator = audio.createOscillator(), gain = audio.createGain(); oscillator.connect(gain); gain.connect(audio.destination); oscillator.frequency.setValueAtTime(frequency, audio.currentTime); gain.gain.setValueAtTime(.07, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .18); oscillator.start(); oscillator.stop(audio.currentTime + .2); } catch (_) {}
  }
  function update() {
    var count = round.matched.length / 2;
    $('progress').innerHTML = round.cards.slice(0, round.cards.length / 2).map(function (_, i) { return '<span class="' + (i < count ? 'found' : '') + '" aria-hidden="true">✿</span>'; }).join('');
    $('progress').setAttribute('aria-label', count + ' de ' + round.cards.length / 2 + ' parejas');
    $('moves').textContent = round.moves;
    $('best').textContent = best[level] ? '★ ' + best[level] : '';
  }
  function hidePreview() {
    previewing = false; $('board').classList.remove('preview'); $('preview').disabled = false;
    Array.prototype.forEach.call($('board').children, function (card, index) { card.setAttribute('aria-label', round.matched.indexOf(index) !== -1 ? animals[round.cards[index]][1] + ', pareja encontrada' : 'Carta ' + (index + 1)); });
    say('Busca dos animales iguales.');
  }
  function preview() {
    if (busy || !$('win').hidden) return;
    learningTimers.clear(previewTimer); previewing = true; $('board').classList.add('preview'); $('preview').disabled = true;
    Array.prototype.forEach.call($('board').children, function (card, index) { card.setAttribute('aria-label', animals[round.cards[index]][1]); });
    say('Mira los animales.'); previewTimer = learningTimers.set(hidePreview, 2200);
  }
  function start(nextLevel) {
    learningTimers.clear(timer); learningTimers.clear(previewTimer); level = nextLevel; busy = false; previewing = false;
    $('win').hidden = true; $('board').classList.remove('preview');
    var keys = MemoryGarden.shuffle(animals.map(function (_, i) { return i; })).slice(0, [4, 6, 8][level]);
    round = MemoryGarden.createRound(keys); $('board').innerHTML = ''; $('board').dataset.level = level;
    round.cards.forEach(function (key, index) {
      var card = document.createElement('button'); card.className = 'card'; card.dataset.card = index; card.dataset.animal = animals[key][0]; card.setAttribute('aria-label', 'Carta ' + (index + 1)); card.style.setProperty('--animal', animals[key][2]);
      card.innerHTML = '<span class="card-inner"><span class="back" aria-hidden="true"><svg viewBox="0 0 100 100"><path d="M50 75V35M50 55q-27 4-26-18 23-2 26 18m0-12q27 3 25-18-22 0-25 18" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="25" r="7" fill="currentColor"/></svg></span><span class="face">' + picture(animals[key]) + '</span></span><span class="match-mark" aria-hidden="true">✓</span>';
      card.addEventListener('click', function () { select(index); }); $('board').appendChild(card);
    });
    document.querySelectorAll('.levels [data-level]').forEach(function (button) { button.setAttribute('aria-pressed', Number(button.dataset.level) === level ? 'true' : 'false'); });
    update(); preview();
  }
  function select(index) {
    if (busy || previewing) return;
    var result = MemoryGarden.choose(round, index); if (result === 'ignored') return;
    var card = $('board').children[index]; card.classList.add('open'); card.setAttribute('aria-label', animals[round.cards[index]][1]); chime(420);
    if (result === 'first') return;
    busy = true; update();
    timer = learningTimers.set(function () {
      round.selected.forEach(function (selected) {
        var item = $('board').children[selected];
        if (result === 'match') { item.classList.add('matched'); item.disabled = true; item.setAttribute('aria-label', animals[round.cards[selected]][1] + ', pareja encontrada'); }
        else { item.classList.remove('open'); item.setAttribute('aria-label', 'Carta ' + (selected + 1)); }
      });
      MemoryGarden.release(round); busy = false; update();
      if (result === 'match') { chime(740); say('¡Pareja encontrada!'); } else say('Prueba otra pareja.');
      if (round.matched.length === round.cards.length) finish();
    }, result === 'match' ? 380 : 950);
  }
  function finish() {
    if (!Number.isFinite(best[level]) || round.moves < best[level]) best[level] = round.moves;
    try { localStorage.setItem('memory-garden-progress', JSON.stringify(best)); } catch (_) {}
    update(); $('win-score').textContent = round.cards.length / 2 + ' parejas · ' + round.moves + ' intentos'; $('next').setAttribute('aria-label', level < 2 ? 'Siguiente dificultad' : 'Volver al jardín fácil'); $('win').hidden = false; $('next').focus(); chime(880);
  }
  document.querySelectorAll('.levels [data-level]').forEach(function (button) { button.addEventListener('click', function () { start(Number(button.dataset.level)); }); });
  $('preview').addEventListener('click', preview); $('restart').addEventListener('click', function () { start(level); }); $('replay').addEventListener('click', function () { start(level); }); $('next').addEventListener('click', function () { start((level + 1) % 3); });
  $('sound').addEventListener('click', function () { sound = !sound; $('sound').setAttribute('aria-pressed', String(sound)); $('sound').setAttribute('aria-label', sound ? 'Desactivar sonido' : 'Activar sonido'); chime(660); });
  function closeHelp() { $('help-panel').hidden = true; if (previousFocus) previousFocus.focus(); }
  $('help').addEventListener('click', function () { previousFocus = document.activeElement; $('help-panel').hidden = false; $('close-help').focus(); }); $('close-help').addEventListener('click', closeHelp);
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !$('help-panel').hidden) closeHelp(); var overlay = !$('help-panel').hidden ? $('help-panel') : !$('win').hidden ? $('win') : null; if (event.key === 'Tab' && overlay) { var buttons = Array.prototype.filter.call(overlay.querySelectorAll('button,a'), function (node) { return !node.hidden && !node.disabled; }); var first = buttons[0], last = buttons[buttons.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } });
  window.addEventListener('beforeinstallprompt', function (event) { event.preventDefault(); installEvent = event; $('install').hidden = false; }); $('install').addEventListener('click', function () { if (installEvent) { installEvent.prompt(); installEvent = null; $('install').hidden = true; } });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
  start(0);
  LearningGate.mount({gameId:'memory-garden',onLock:function(){
    learningLocked=true;learningTimers.pause();
    learningAudioWasRunning=!!audio&&audio.state==='running';
    if(learningAudioWasRunning)audio.suspend().catch(function(){});
  },onUnlock:function(){
    learningLocked=false;learningTimers.resume();
    if(learningAudioWasRunning&&sound)audio.resume().catch(function(){});
  }});
}());
