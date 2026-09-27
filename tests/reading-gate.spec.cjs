const {test,expect}=require('@playwright/test');
const COOKIE='family-learning-profile';
const YEAR=31536000000;

async function fixture(page,context,baseURL,profile='advanced') {
  if(profile) await context.addCookies([{name:COOKIE,value:encodeURIComponent(JSON.stringify({version:1,level:profile,reading:profile==='advanced',expiresAt:Date.now()+YEAR})),url:new URL(baseURL).origin}]);
  await page.addInitScript(()=>{window.testNow=Date.now();Date.now=()=>window.testNow;Math.random=()=>.99;});
  await page.route('**/reading-fixture.html',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><button id="outside">outside</button><script src="/learning-gate/profile.js"></script><script src="/learning-gate/reading-words.js"></script><script src="/learning-gate/gate.js"></script><script>window.calls={lock:0,unlock:0,outside:0};document.getElementById('outside').onclick=function(){calls.outside++};document.getElementById('outside').focus();window.gate=LearningGate.mount({onLock:function(){calls.lock++},onUnlock:function(){calls.unlock++;if(window.failOnce&&calls.unlock===1)throw Error('expected callback failure')}});</script></body></html>`}));
  await page.goto('reading-fixture.html');
}
async function ready(page) {
  await expect(page.locator('.gate-pictures button')).toHaveCount(3);
  for(const button of await page.locator('.gate-pictures button').all())await expect(button).toBeEnabled();
}
async function correct(page) {
  const word=await page.locator('#gate-word').textContent();
  await page.getByRole('button',{name:word,exact:true}).click();
  await expect(page.locator('#learning-gate')).toHaveCount(0);
}

test('reading: lowercase word, three local images, full replacement after errors, and focus containment',async({page,context,baseURL},info)=>{
  const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  await fixture(page,context,baseURL);await ready(page);
  const before=await page.locator('.gate-pictures button').evaluateAll(nodes=>nodes.map(n=>n.dataset.readingId));
  const word=await page.locator('#gate-word').textContent();expect(word).toMatch(/^[a-záéíóúüñ]{1,5}$/);
  expect(requests.filter(url=>url.includes('/reading-images/'))).toHaveLength(3);
  expect(requests.some(url=>/arasaac|google|creativecommons/.test(new URL(url).hostname))).toBe(false);
  expect(await page.evaluate(()=>document.getElementById('learning-gate').contains(document.activeElement))).toBe(true);
  await page.locator('#outside').evaluate(node=>node.focus());
  expect(await page.evaluate(()=>document.getElementById('learning-gate').contains(document.activeElement))).toBe(true);
  const menu=await page.locator('.gate-pictures img').first().evaluate(node=>{const e=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});node.dispatchEvent(e);return e.defaultPrevented;});expect(menu).toBe(true);
  await page.locator('.gate-pictures button').filter({hasNot:page.locator('img[alt="'+word+'"]')}).first().click();
  await ready(page);expect(await page.locator('#gate-word').textContent()).not.toBe(word);
  const after=await page.locator('.gate-pictures button').evaluateAll(nodes=>nodes.map(n=>n.dataset.readingId));
  expect(after.every(id=>!before.includes(id))).toBe(true);
  await page.locator('#outside').dispatchEvent('click');expect(await page.evaluate(()=>calls)).toEqual({lock:1,unlock:0,outside:0});
  for(const button of await page.locator('.gate-pictures button').all()){
    const box=await button.boundingBox();expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(page.viewportSize().width);
    expect(box.y+box.height).toBeLessThanOrEqual(page.viewportSize().height);
  }
  expect(await page.locator('#gate-word').evaluate(node=>node.scrollWidth<=node.clientWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('reading.png')});
  await correct(page);expect(await page.evaluate(()=>calls.unlock)).toBe(1);expect(errors).toEqual([]);
});

test('reading: a correct answer gives exactly ten minutes, then rechecks current profile',async({page,context,baseURL})=>{
  await fixture(page,context,baseURL);await ready(page);await correct(page);
  await page.evaluate(()=>{testNow+=599999;gate.check();});await expect(page.locator('#learning-gate')).toHaveCount(0);
  await page.evaluate(()=>{testNow++;gate.check();});await ready(page);
  await correct(page);await page.evaluate(()=>{LearningProfile.clear();testNow+=600000;gate.check();});
  await expect(page.locator('#gate-trace')).toBeVisible();await expect(page.locator('#gate-reading')).toBeHidden();
  expect(await page.evaluate(()=>calls)).toEqual({lock:3,unlock:2,outside:0});
});

test('reading: image failure cannot unlock and retry restores the same question',async({page,context,baseURL})=>{
  await page.route('**/reading-images/*.png',route=>route.abort());
  await fixture(page,context,baseURL);await expect(page.locator('#gate-reading-retry')).toBeVisible();
  const word=await page.locator('#gate-word').textContent();
  for(const button of await page.locator('.gate-pictures button').all())await expect(button).toBeDisabled();
  await page.locator('.gate-pictures img').first().evaluate(node=>window.oldImage=node);
  await page.keyboard.press('1');expect(await page.evaluate(()=>calls.unlock)).toBe(0);
  await page.unroute('**/reading-images/*.png');await page.locator('#gate-reading-retry').click();await ready(page);
  await page.evaluate(()=>oldImage.dispatchEvent(new Event('error')));await ready(page);
  expect(await page.locator('#gate-word').textContent()).toBe(word);await correct(page);
});

test('reading: no profile, invalid profile and expired profile preserve minimum challenges',async({page,context,baseURL})=>{
  await fixture(page,context,baseURL,null);await expect(page.locator('#gate-trace')).toBeVisible();
  for(const value of ['%invalid',JSON.stringify({version:1,level:'advanced',reading:true,expiresAt:Date.now()-1})]){
    await context.addCookies([{name:COOKIE,value:encodeURIComponent(value),url:new URL(baseURL).origin}]);await page.reload();
    await expect(page.locator('#gate-trace')).toBeVisible();await expect(page.locator('#gate-reading')).toBeHidden();
  }
  await context.clearCookies();await page.addInitScript(()=>Object.defineProperty(document,'cookie',{get(){throw Error('blocked')},set(){throw Error('blocked')}}));await page.reload();
  await expect(page.locator('#gate-trace')).toBeVisible();
});

test('reading: keyboard can pick an image and missing dictionary never grants access',async({page,context,baseURL})=>{
  await fixture(page,context,baseURL);await ready(page);
  const position=await page.evaluate(()=>{const word=document.getElementById('gate-word').textContent;return [...document.querySelectorAll('.gate-pictures button')].findIndex(b=>b.getAttribute('aria-label')===word)+1;});
  await page.keyboard.press(String(position));await expect(page.locator('#learning-gate')).toHaveCount(0);
  await page.evaluate(()=>{window.LearningWords=null;testNow+=600000;gate.check();});
  await expect(page.locator('#gate-reading-retry')).toBeVisible();expect(await page.evaluate(()=>gate.isLocked())).toBe(true);
});

test('reading: failed unlock callback keeps the gate locked but permits retry',async({page,context,baseURL})=>{
  await fixture(page,context,baseURL);await ready(page);await page.evaluate(()=>window.failOnce=true);
  const word=await page.locator('#gate-word').textContent();await page.getByRole('button',{name:word,exact:true}).click();
  expect(await page.evaluate(()=>gate.isLocked())).toBe(true);expect(await page.evaluate(()=>calls.unlock)).toBe(1);
  await correct(page);expect(await page.evaluate(()=>calls.unlock)).toBe(2);
});

test('reading in a real game preserves a manual pause and resumes only on request',async({page,context,baseURL})=>{
  await fixture(page,context,baseURL);await page.goto('pulse-path/?test=1');await ready(page);await correct(page);
  await page.locator('#play').click();await page.locator('#pause').click();
  const frozen=await page.evaluate(()=>__pulse.read().state);
  await page.evaluate(()=>{testNow+=600001;window.dispatchEvent(new Event('focus'));});await ready(page);
  await page.waitForTimeout(180);expect(await page.evaluate(()=>__pulse.read().state)).toEqual(frozen);
  await correct(page);expect(await page.evaluate(()=>__pulse.read().paused)).toBe(true);
  await page.waitForTimeout(150);expect(await page.evaluate(()=>__pulse.read().state)).toEqual(frozen);
  await page.locator('#resume').click();await expect.poll(()=>page.evaluate(()=>__pulse.read().state.x)).toBeGreaterThan(frozen.x);
});
