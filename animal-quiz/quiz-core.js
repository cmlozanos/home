/* Local adaptation of the family's animal quiz. No server or personal profiles. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AnimalQuiz = api;
}(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  var animals = [
    { id:'elephant', name:'Elefante', options:['Elefante','Hipopótamo','Rinoceronte','Manatí'] },
    { id:'lion', name:'León', options:['León','Tigre','Leopardo','Guepardo'] },
    { id:'giraffe', name:'Jirafa', options:['Jirafa','Camello','Llama','Avestruz'] },
    { id:'crocodile', name:'Cocodrilo', options:['Cocodrilo','Lagarto','Iguana','Salamandra'] },
    { id:'penguin', name:'Pingüino', options:['Pingüino','Pato','Cuervo','Murciélago'] },
    { id:'bear', name:'Oso', options:['Oso','Castor','Perro','Lobo'] },
    { id:'dolphin', name:'Delfín', options:['Delfín','Tiburón','Ballena','Foca'] },
    { id:'kangaroo', name:'Canguro', options:['Canguro','Koala','Wombat','Wallaby'] },
    { id:'butterfly', name:'Mariposa', options:['Mariposa','Polilla','Libélula','Abeja'] },
    { id:'turtle', name:'Tortuga', options:['Tortuga','Cangrejo','Almeja','Caracol'] },
    { id:'tiger', name:'Tigre', options:['Tigre','León','Puma','Lince'] },
    { id:'monkey', name:'Mono', options:['Mono','Gorila','Chimpancé','Babuino'] },
    { id:'flamingo', name:'Flamenco', options:['Flamenco','Cigüeña','Garza','Ibis'] },
    { id:'horse', name:'Caballo', options:['Caballo','Burro','Cebra','Mula'] },
    { id:'octopus', name:'Pulpo', options:['Pulpo','Calamar','Medusa','Cangrejo'] },
    { id:'owl', name:'Búho', options:['Búho','Águila','Cuervo','Loro'] },
    { id:'fox', name:'Zorro', options:['Zorro','Lobo','Perro','Coyote'] },
    { id:'panda', name:'Panda', options:['Panda','Oso polar','Koala','Oso pardo'] },
    { id:'hippo', name:'Hipopótamo', options:['Hipopótamo','Rinoceronte','Elefante','Manatí'] },
    { id:'bat', name:'Murciélago', options:['Murciélago','Golondrina','Cuervo','Halcón'] }
  ];
  var trophyIds = ['primer_acierto','racha_3','racha_5','escritor_novato','experto_animales'];
  function profile() { return { stars:0, streak:0, trophies:[], answers:{} }; }
  function fresh() { return { version:1, profiles:{ short:profile(), full:profile() } }; }
  function integer(value, maximum) { return typeof value === 'number' && isFinite(value) && value >= 0 ? Math.min(Math.floor(value), maximum) : 0; }
  function restore(raw) {
    var result = fresh(), parsed;
    try { parsed = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (ignore) { return result; }
    if (!parsed || parsed.version !== 1 || !parsed.profiles) return result;
    ['short','full'].forEach(function (key) {
      var stored = parsed.profiles[key], target = result.profiles[key];
      if (!stored || typeof stored !== 'object') return;
      target.stars = integer(stored.stars, 1000000000);
      target.streak = integer(stored.streak, target.stars);
      target.trophies = trophyIds.filter(function (id) { return Array.isArray(stored.trophies) && stored.trophies.indexOf(id) !== -1; });
      animals.forEach(function (animal) {
        var entry = stored.answers && stored.answers[animal.id];
        if (entry && typeof entry === 'object') target.answers[animal.id] = { weight:integer(entry.weight, 1000000) || 1, wordCorrect:entry.wordCorrect === true };
      });
    });
    return result;
  }
  function shuffle(values, random) {
    var result = values.slice(), rng = random || Math.random;
    for (var i = result.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), item = result[i];
      result[i] = result[j]; result[j] = item;
    }
    return result;
  }
  function choose(player, random) {
    var rng = random || Math.random;
    var weights = animals.map(function (animal) { return player.answers[animal.id] && player.answers[animal.id].weight || 1; });
    var remaining = rng() * weights.reduce(function (sum, value) { return sum + value; }, 0);
    for (var i = 0; i < animals.length; i++) { remaining -= weights[i]; if (remaining <= 0) return animals[i]; }
    return animals[animals.length - 1];
  }
  function round(player, mode, random) {
    var question = choose(player, random);
    return { question:question, options:shuffle(question.options, random), mode:mode, phase:'quiz', earned:[] };
  }
  function trophies(player, firstWord) {
    var candidates = [];
    if (player.stars >= 1) candidates.push('primer_acierto');
    if (player.streak >= 3) candidates.push('racha_3');
    if (player.streak >= 5) candidates.push('racha_5');
    if (firstWord) candidates.push('escritor_novato');
    if (player.stars >= 50) candidates.push('experto_animales');
    var earned = candidates.filter(function (id) { return player.trophies.indexOf(id) === -1; });
    player.trophies = player.trophies.concat(earned);
    return earned;
  }
  function answer(player, current, index) {
    if (current.phase !== 'quiz' || index < 0 || index >= current.options.length) return null;
    var correct = current.options[index] === current.question.name;
    var entry = player.answers[current.question.id] || { wordCorrect:false };
    if (correct) { player.stars++; player.streak++; entry.weight = 1; }
    else { player.streak = 0; entry.weight = (entry.weight || 0) + 2; }
    player.answers[current.question.id] = entry;
    current.phase = correct ? 'correct' : 'wrong';
    current.earned = trophies(player, false);
    return correct;
  }
  function target(current) {
    var word = current.question.name.toUpperCase();
    return current.mode === 'short' ? word.slice(0, 3) : word;
  }
  function write(player, current, typed) {
    if (current.phase !== 'write' || String(typed).toUpperCase().trim() !== target(current)) return false;
    var firstWord = !Object.keys(player.answers).some(function (id) { return player.answers[id].wordCorrect; });
    player.stars++;
    var entry = player.answers[current.question.id] || { weight:1 };
    entry.wordCorrect = true;
    player.answers[current.question.id] = entry;
    current.phase = 'win';
    current.earned = current.earned.concat(trophies(player, firstWord));
    return true;
  }
  return { animals:animals, trophyIds:trophyIds, fresh:fresh, restore:restore, round:round, choose:choose, answer:answer, target:target, write:write };
}));
