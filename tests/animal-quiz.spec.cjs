const {test,expect} = require('@playwright/test');
const {solveGate} = require('./helpers/learning-fixture.cjs');
const KEY = 'animal-quiz:local:v1';
async function enter(page, mode='short', random=0) {
  await page.goto('animal-quiz/');
  await solveGate(page);
  await page.evaluate(value => { Math.random = () => value; }, random);
  await page.locator('[data-profile="'+mode+'"]').click();
}
async function correct(page) {
  const name = await page.locator('#animal-art').evaluate(node => window.AnimalQuiz.animals.find(q=>q.id===node.dataset.animal).name);
  await page.getByRole('button',{name,exact:true}).click();
  await expect(page.locator('#write-phase')).toBeVisible();
  return page.locator('#word-model').textContent();
}
async function typeWord(page, word) {
  for (const letter of word) await page.locator('[data-letter="'+letter+'"]').click();
}
async function advanceClock(page) {
  await page.evaluate(() => { const now=Date.now;Date.now=()=>now()+600001; });
  await expect(page.locator('#learning-gate')).toBeVisible();
}
test('animal quiz starts gated without personal data, API calls or automatic progress',async({page})=>{
  const requests=[], errors=[];
  page.on('request',request=>requests.push(request.url()));
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('animal-quiz/');
  await expect(page.locator('#learning-gate')).toBeVisible();
  expect(await page.evaluate(key=>localStorage.getItem(key),KEY)).toBeNull();
  await page.locator('[data-profile="short"]').evaluate(button=>button.click());
  await expect(page.locator('#play')).toBeHidden();
  await solveGate(page);
  expect(await page.evaluate(key=>localStorage.getItem(key),KEY)).toBeNull();
  await expect(page.getByRole('link',{name:'Todos los juegos'})).toHaveAttribute('href','https://cmlozanos.github.io/games/');
  expect(requests.filter(url=>/\/api\/|trycloudflare|cdnjs/.test(url))).toEqual([]);
  expect(errors).toEqual([]);
});
test('animal quiz keeps independent local profiles and accepts full accented words',async({page})=>{
  await enter(page,'short',0.075);
  const short = await correct(page);
  expect(short).toBe('LEÓ');
  await typeWord(page,'AAA');
  await expect(page.locator('#word-slots')).toHaveClass(/wrong/);
  await expect(page.locator('#stars')).toHaveText('1');
  await typeWord(page,short);
  await expect(page.locator('#result')).toBeVisible();
  await expect(page.locator('#stars')).toHaveText('2');
  await page.getByRole('button',{name:'Elegir perfil',exact:true}).click();
  await page.locator('[data-profile="full"]').click();
  await expect(page.locator('#stars')).toHaveText('0');
  const full = await correct(page);
  expect(full).toBe('LEÓN');
  await typeWord(page,full);
  await expect(page.locator('#result')).toBeVisible();
  await expect(page.locator('#stars')).toHaveText('2');
  await page.reload();
  await solveGate(page);
  await expect(page.locator('#short-score')).toHaveText('2');
  await expect(page.locator('#full-score')).toHaveText('2');
  await page.getByRole('button',{name:'Estrellas y trofeos',exact:true}).click();
  await expect(page.locator('[data-ranking-profile]')).toHaveCount(2);
  await expect(page.locator('[data-ranking-profile="full"] .trophy-badge')).toHaveCount(2);
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
  expect(Object.keys(saved)).toEqual(['version','profiles']);
  expect(saved.profiles.short.answers.lion.wordCorrect).toBe(true);
  expect(saved.profiles.full.answers.lion.wordCorrect).toBe(true);
  expect(JSON.stringify(saved)).not.toMatch(/"name"|"age"/);
});
test('animal quiz increases repetition after a wrong answer without removing stars',async({page})=>{
  await enter(page,'short',0);
  await expect(page.locator('#animal-art')).toHaveAttribute('data-animal','elephant');
  await page.getByRole('button',{name:'Hipopótamo',exact:true}).click();
  await expect(page.locator('#stars')).toHaveText('0');
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).profiles.short.answers.elephant.weight,KEY)).toBe(2);
  await expect(page.getByRole('button',{name:'Elefante',exact:true})).toBeEnabled();
  await correct(page);
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).profiles.short.answers.elephant.weight,KEY)).toBe(1);
  await expect(page.locator('#stars')).toHaveText('1');
});
test('animal quiz pauses feedback timers and preserves writing through timed gates and help',async({page})=>{
  await enter(page,'full',0.075);
  await page.getByRole('button',{name:'León',exact:true}).click();
  await advanceClock(page);
  await page.waitForTimeout(1400);
  await expect(page.locator('#write-phase')).toBeHidden();
  await solveGate(page);
  await expect(page.locator('#write-phase')).toBeVisible();
  await page.locator('[data-letter="L"]').click();
  await page.getByRole('button',{name:'Ayuda',exact:true}).click();
  await expect(page.locator('#close-help')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#help a')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#close-help')).toBeFocused();
  await advanceClock(page); await solveGate(page);
  await expect(page.locator('#help')).toBeVisible();
  await expect(page.locator('#word-slots')).toHaveAttribute('aria-label','Letras escritas: L');
  await page.keyboard.press('Escape');
  await expect(page.locator('#help')).toBeHidden();
  await expect(page.locator('#help-button')).toBeFocused();
  await typeWord(page,'EÓN');
  await expect(page.locator('#result')).toBeVisible();
  await expect(page.locator('#stars')).toHaveText('2');
});
test('animal quiz works offline with the gate and saved progress',async({page,context,browserName})=>{
  test.skip(browserName==='webkit','WebKit cannot reload with emulated offline networking');
  await enter(page,'short',0);
  await typeWord(page,await correct(page));
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#learning-gate')).toBeVisible();
  await solveGate(page);
  await expect(page.locator('#short-score')).toHaveText('2');
  await page.locator('[data-profile="short"]').click();
  await typeWord(page,await correct(page));
  await expect(page.locator('#stars')).toHaveText('4');
});
test('animal quiz remains playable when local storage is blocked',async({page})=>{
  await page.addInitScript(()=>{
    Storage.prototype.getItem=function(){throw new DOMException('Blocked','SecurityError');};
    Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError');};
  });
  await enter(page);
  await expect(page.locator('#storage-status')).toBeVisible();
  await typeWord(page,await correct(page));
  await expect(page.locator('#result')).toBeVisible();
  await expect(page.locator('#stars')).toHaveText('2');
});
test('animal quiz has readable responsive profiles, answers and writing controls',async({page},testInfo)=>{
  await page.goto('animal-quiz/'); await solveGate(page);
  await page.screenshot({path:testInfo.outputPath('profiles.png')});
  await page.evaluate(()=>{Math.random=()=>0.925;});
  await page.locator('[data-profile="full"]').click();
  await expect(page.locator('#animal-art')).toHaveAttribute('data-animal','hippo');
  for(const button of await page.locator('.option').all()) await expect(button).toBeInViewport();
  await page.screenshot({path:testInfo.outputPath('question.png')});
  const word=await correct(page);expect(word).toBe('HIPOPÓTAMO');
  for(const button of await page.locator('.letter-key').all()) {
    await expect(button).toBeInViewport();
    const box=await button.boundingBox();expect(box.width).toBeGreaterThanOrEqual(43);expect(box.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  const clipped=await page.locator('.option,.word-slot,.profile-mark').evaluateAll(elements=>elements.filter(el=>el.clientWidth&&el.scrollWidth>el.clientWidth+1).map(el=>el.textContent));
  expect(clipped).toEqual([]);
  await page.screenshot({path:testInfo.outputPath('writing.png')});
  await typeWord(page,word); await expect(page.locator('#result')).toBeVisible();
});
