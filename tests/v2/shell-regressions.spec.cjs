const {test,expect}=require('@playwright/test');
const {solveGate}=require('../helpers/learning-fixture.cjs');

async function openFixture(page) {
  await page.route('**/v2-shell-regressions.html',route=>route.fulfill({
    contentType:'text/html',
    body:'<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="family-v2/family.css"></head><body><header><span data-family-slot></span></header><button id="play-area" style="display:block;width:200px;height:100px;margin-top:24px">Jugar</button><script defer src="family-v2/family.js" data-game="shell-regressions"></script></body></html>'
  }));
  await page.addInitScript(()=>{
    const realNow=Date.now.bind(Date);
    window.auditClockOffset=0;
    Date.now=()=>realNow()+window.auditClockOffset;
    Math.random=()=>.1;
  });
  await page.goto('v2-shell-regressions.html');
  await expect(page.locator('family-v2-shell')).toBeVisible();
  await page.evaluate(()=>{
    window.auditState={familyPaused:false,learningLocked:false,keys:[]};
    FamilyV2.register({
      pause(){auditState.familyPaused=true;},
      resume(){auditState.familyPaused=false;}
    });
    // Match the native games' editable-target guard and document/window listeners.
    window.addEventListener('keydown',event=>{
      if(auditState.familyPaused||auditState.learningLocked||event.target.closest('input,select,textarea,dialog'))return;
      if(event.key.startsWith('Arrow'))auditState.keys.push('down:'+event.key);
    });
    window.addEventListener('keyup',event=>{
      if(event.key.startsWith('Arrow'))auditState.keys.push('up:'+event.key);
    });
  });
}

test('learning deadline closes Adult modal and leaves the actual challenge usable',async({page})=>{
  await openFixture(page);
  await page.addScriptTag({url:'memory-garden/learning-gate.js'});
  await page.evaluate(()=>{
    window.auditGate=LearningGate.mount({
      gameId:'shell-regressions',
      onLock(){auditState.learningLocked=true;},
      onUnlock(){auditState.learningLocked=false;}
    });
  });
  await solveGate(page);
  await page.locator('family-v2-shell #adults').click();
  await expect(page.locator('family-v2-shell dialog')).toHaveJSProperty('open',true);
  await page.evaluate(()=>{window.auditClockOffset=600001;auditGate.check();});
  await expect(page.locator('family-v2-shell dialog')).toHaveJSProperty('open',false);
  await expect(page.locator('#learning-gate')).toBeVisible();
  await solveGate(page);
  await expect.poll(()=>page.evaluate(()=>auditState)).toMatchObject({familyPaused:false,learningLocked:false});
  // Closing for the learning gate must not grant persistent Adult access.
  await page.locator('family-v2-shell #adults').click();
  await expect(page.locator('family-v2-shell #gate')).toBeVisible();
  await expect(page.locator('family-v2-shell #adult-settings')).not.toBeVisible();
});

test('theme keyboard events stay inside the shell, native controls still receive keys',async({page})=>{
  await openFixture(page);
  await page.locator('#play-area').focus();
  await page.keyboard.press('ArrowLeft');
  expect(await page.evaluate(()=>auditState.keys)).toEqual(['down:ArrowLeft','up:ArrowLeft']);
  await page.evaluate(()=>{auditState.keys=[];});
  await page.locator('family-v2-shell #theme').focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(()=>auditState.keys)).toEqual([]);
  await expect(page.locator('family-v2-shell #theme')).toBeFocused();
  await page.locator('family-v2-shell #theme').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-family-theme','dark');
});

test('cookie remains authoritative when localStorage reads succeed but writes throw',async({page})=>{
  await openFixture(page);
  await page.evaluate(()=>FamilyV2.award('initial',2));
  expect(await page.evaluate(()=>FamilyV2.read().points)).toBe(2);
  await page.evaluate(()=>{
    const originalSetItem=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){
      if(key==='family-v2-session-shell-regressions')throw new DOMException('Audit quota exhausted','QuotaExceededError');
      return originalSetItem.call(this,key,value);
    };
  });
  expect(await page.evaluate(()=>FamilyV2.award('next',3))).toBe(5);
  await expect(page.locator('family-v2-shell #points')).toHaveText('5');
  expect(await page.evaluate(()=>({
    local:JSON.parse(localStorage.getItem('family-v2-session-shell-regressions')).points,
    current:FamilyV2.read().points,
    cookie:JSON.parse(decodeURIComponent(document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith('family-v2-session-shell-regressions=')).split('=').slice(1).join('='))).points
  }))).toEqual({local:2,current:5,cookie:5});
  expect(await page.evaluate(()=>FamilyV2.award('next',3))).toBe(5);
  expect(await page.evaluate(()=>FamilyV2.read().points)).toBe(5);
});

for(const activity of ['keyboard','pointer movement'])test(activity+' extends session activity without disabling genuine expiry',async({page})=>{
  await openFixture(page);
  await page.evaluate(()=>FamilyV2.award('initial',2));
  await page.locator('#play-area').focus();
  const box=await page.locator('#play-area').boundingBox();
  if(activity==='pointer movement'){
    await page.mouse.move(box.x+20,box.y+20);
    await page.mouse.down();
  }
  const initial=await page.evaluate(()=>FamilyV2.read());
  await page.evaluate(()=>{window.auditClockOffset=3599000;});
  if(activity==='keyboard')await page.keyboard.press('ArrowLeft');
  else {
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
    await page.mouse.up();
  }
  const active=await page.evaluate(()=>FamilyV2.read());
  expect(active.id).toBe(initial.id);
  expect(active.lastActive-initial.lastActive).toBeGreaterThanOrEqual(3599000);
  await page.evaluate(()=>{window.auditClockOffset+=3599000;});
  expect(await page.evaluate(()=>FamilyV2.read().points)).toBe(2);
  // A read must not extend activity: >1h since that real input still expires.
  await page.evaluate(()=>{window.auditClockOffset+=2000;});
  const expired=await page.evaluate(()=>FamilyV2.read());
  expect(expired.points).toBe(0);
  expect(expired.id).not.toBe(initial.id);
});
