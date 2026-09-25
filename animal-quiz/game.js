(function () {
  'use strict';
  if (!window.LearningGate || !window.AnimalQuiz) { document.body.textContent = 'No se pudo cargar el reto. Recarga para jugar.'; return; }
  var Q = window.AnimalQuiz, KEY = 'animal-quiz:local:v1', VERSION = '20260925-static1';
  var state, mode = null, current = null, typed = '', locked = true, hidden = document.hidden, helping = false;
  var timers = LearningGate.createTimers(), transition = null, feedbackTimer = null;
  var trophyNames = { primer_acierto:'Primer acierto', racha_3:'Tres aciertos seguidos', racha_5:'Cinco aciertos seguidos', escritor_novato:'Primera palabra', experto_animales:'Experto: cincuenta estrellas' };
  function $(id) { return document.getElementById(id); }
  function icon(id) { return '<svg aria-hidden="true"><use href="#' + id + '-icon"/></svg>'; }
  function warning() { $('storage-status').hidden = false; }
  try { state = Q.restore(localStorage.getItem(KEY)); } catch (ignore) { state = Q.fresh(); warning(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (ignore) { warning(); } }
  function canPlay() { return !locked && !hidden && !helping; }
  function syncTimers() { if (canPlay()) timers.resume(); else timers.pause(); }
  function clearTimers() { if (transition !== null) timers.clear(transition); if (feedbackTimer !== null) timers.clear(feedbackTimer); transition = feedbackTimer = null; }
  function player() { return state.profiles[mode]; }
  function score() {
    ['short','full'].forEach(function (id) { $(id + '-score').innerHTML = icon('star') + '<span>' + state.profiles[id].stars + '</span>'; });
    if (mode) {
      $('stars').textContent = player().stars;
      $('profile-badge').textContent = mode === 'short' ? 'A B C' : 'A … Z';
      $('streak').textContent = player().streak ? '×' + player().streak : '';
      $('streak').setAttribute('aria-label', player().streak + ' aciertos seguidos');
    }
  }
  function screen(id) { ['profiles','play','ranking'].forEach(function (item) { $(item).hidden = item !== id; }); }
  function profiles() { if (!canPlay()) return; clearTimers(); current = null; screen('profiles'); score(); }
  function setAnimal(id) {
    var url = 'assets/animals.svg?v=' + VERSION + '#' + id;
    $('animal-use').setAttribute('href', url);
    $('animal-use').setAttributeNS('http://www.w3.org/1999/xlink', 'href', url);
    $('animal-art').setAttribute('data-animal', id);
  }
  function next() {
    if (!canPlay() || !mode) return;
    clearTimers(); typed = ''; current = Q.round(player(), mode);
    screen('play'); $('play-layout').className = 'play-layout';
    $('quiz-phase').hidden = false; $('write-phase').hidden = true; $('result').hidden = true;
    $('feedback').textContent = ''; setAnimal(current.question.id); score();
    var options = $('options'); options.textContent = '';
    current.options.forEach(function (name, index) {
      var button = document.createElement('button'); button.className = 'option'; button.dataset.option = index;
      button.setAttribute('aria-label', name);
      var number = document.createElement('span'); number.className = 'option-number'; number.textContent = index + 1; number.setAttribute('aria-hidden','true');
      var label = document.createElement('span'); label.textContent = name;
      button.appendChild(number); button.appendChild(label);
      button.addEventListener('click', function () { answer(index, button); }); options.appendChild(button);
    });
  }
  function answer(index, button) {
    if (!canPlay() || !current) return;
    var correct = Q.answer(player(), current, index);
    if (correct === null) return;
    save(); score();
    Array.prototype.forEach.call($('options').children, function (option) {
      option.disabled = true;
      if (option.getAttribute('aria-label') === current.question.name) option.classList.add('correct');
    });
    button.classList.add(correct ? 'correct' : 'wrong');
    $('feedback').innerHTML = icon(correct ? 'check' : 'retry');
    var label = document.createElement('span'); label.textContent = correct ? current.question.name : 'Era: ' + current.question.name; $('feedback').appendChild(label);
    transition = timers.set(correct ? writing : next, correct ? 1200 : 2000);
  }
  function writing() {
    transition = null;
    if (!current || current.phase !== 'correct') return;
    current.phase = 'write'; typed = ''; $('feedback').textContent = '';
    $('quiz-phase').hidden = true; $('write-phase').hidden = false;
    $('play-layout').className = 'play-layout phase-writing';
    $('word-model').textContent = Q.target(current);
    var letters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
    'ÁÉÍÓÚÜ'.split('').forEach(function (letter) { if (Q.target(current).indexOf(letter) !== -1) letters.push(letter); });
    $('keyboard').textContent = '';
    letters.forEach(function (letter) {
      var button = document.createElement('button'); button.className = 'letter-key' + ('ÁÉÍÓÚÜ'.indexOf(letter) !== -1 ? ' accent' : '');
      button.textContent = letter; button.dataset.letter = letter; button.setAttribute('aria-label', 'Letra ' + letter);
      button.addEventListener('click', function () { press(letter); }); $('keyboard').appendChild(button);
    });
    renderWord();
  }
  function renderWord() {
    var slots = $('word-slots'), target = Q.target(current); slots.textContent = '';
    slots.style.gridTemplateColumns = 'repeat(' + target.length + ', minmax(0, 1fr))';
    target.split('').forEach(function (_, index) {
      var slot = document.createElement('span'); slot.className = 'word-slot'; slot.textContent = typed[index] || '_'; slots.appendChild(slot);
    });
    slots.setAttribute('aria-label', 'Letras escritas: ' + (typed || 'ninguna'));
  }
  function press(letter) {
    if (!canPlay() || !current || current.phase !== 'write' || typed.length >= Q.target(current).length) return;
    if (feedbackTimer !== null) timers.clear(feedbackTimer); feedbackTimer = null;
    $('word-slots').classList.remove('wrong'); $('feedback').textContent = '';
    typed += letter; renderWord();
    if (typed.length !== Q.target(current).length) return;
    if (Q.write(player(), current, typed)) {
      save(); score(); $('write-phase').hidden = true; $('result').hidden = false; $('play-layout').className = 'play-layout';
      $('new-trophies').innerHTML = current.earned.map(trophy).join(''); $('feedback').innerHTML = icon('check');
    } else {
      typed = ''; $('word-slots').classList.add('wrong'); $('feedback').innerHTML = icon('retry');
      feedbackTimer = timers.set(function () { feedbackTimer = null; $('word-slots').classList.remove('wrong'); renderWord(); }, 400);
    }
  }
  function erase() {
    if (!canPlay() || !current || current.phase !== 'write') return;
    typed = typed.slice(0, -1); renderWord();
  }
  function trophy(id) { return '<span class="trophy-badge" role="img" aria-label="' + trophyNames[id] + '" title="' + trophyNames[id] + '">' + icon(id === 'escritor_novato' ? 'pencil' : id === 'primer_acierto' ? 'star' : 'trophy') + (id === 'racha_3' ? '3' : id === 'racha_5' ? '5' : id === 'experto_animales' ? '50' : '') + '</span>'; }
  function ranking() {
    if (!canPlay()) return;
    clearTimers(); current = null; screen('ranking');
    var keys = ['short','full'].sort(function (a,b) { return state.profiles[b].stars - state.profiles[a].stars; });
    $('ranking-cards').innerHTML = keys.map(function (key, index) {
      var p = state.profiles[key];
      return '<article class="ranking-card" data-ranking-profile="' + key + '"><span class="rank-position">' + (index + 1) + '</span><h3>' + (key === 'short' ? 'A B C' : 'A … Z') + '</h3><div class="score">' + icon('star') + '<strong>' + p.stars + '</strong></div><div class="trophy-row">' + p.trophies.map(trophy).join('') + '</div></article>';
    }).join('');
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-profile]'), function (button) {
    button.addEventListener('click', function () { if (!canPlay()) return; mode = button.dataset.profile; next(); });
  });
  $('profiles-button').addEventListener('click', profiles); $('ranking-back').addEventListener('click', profiles);
  $('ranking-button').addEventListener('click', ranking); $('next').addEventListener('click', next); $('erase').addEventListener('click', erase);
  $('help-button').addEventListener('click', function () { if (locked) return; helping = true; $('help').hidden = false; syncTimers(); $('close-help').focus(); });
  function closeHelp() { if (locked) return; helping = false; $('help').hidden = true; syncTimers(); $('help-button').focus(); }
  $('close-help').addEventListener('click', closeHelp);
  $('help').addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { event.preventDefault(); closeHelp(); }
    if (event.key !== 'Tab') return;
    var focusable = $('help').querySelectorAll('button,a[href]'), first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  window.addEventListener('keydown', function (event) {
    if (!canPlay() || !current || current.phase !== 'write' || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Backspace') { event.preventDefault(); erase(); return; }
    var letter = event.key.toUpperCase();
    if (/^[A-ZÑÁÉÍÓÚÜ]$/.test(letter)) { event.preventDefault(); press(letter); }
  });
  document.addEventListener('visibilitychange', function () { hidden = document.hidden; syncTimers(); });
  score();
  LearningGate.mount({ gameId:'animal-quiz', onLock:function () { locked = true; syncTimers(); }, onUnlock:function () { locked = false; hidden = document.hidden; syncTimers(); } });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js?v=' + VERSION).catch(function () {});
}());
