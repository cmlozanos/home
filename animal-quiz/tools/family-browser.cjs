// Bounded real-browser regression for the four owned family activities.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.GAMES_BASE_URL || 'http://127.0.0.1:4177/';
async function gate(page) {
  if (!await page.locator('#learning-gate').count()) return;
  const text = await page.locator('#gate-prompt').textContent(), m = text.match(/(\d)\s*([+−-])\s*(\d)/);
  assert.ok(m, text);
  await page.locator('[data-gate-key="'+(m[2]==='+'?+m[1]+ +m[3]:+m[1]- +m[3])+'"]').click();
}
async function adults(page) {
  await page.locator('family-v2-shell').getByRole('button',{name:'Para adultos',exact:true}).click();
  const text = await page.locator('family-v2-shell').locator('#gate-label').textContent(), n = text.match(/(\d+)\s*×\s*(\d+)/);
  await page.locator('family-v2-shell').getByRole('textbox').fill(String(+n[1]* +n[2]));
  await page.locator('family-v2-shell').getByRole('button',{name:'Entrar',exact:true}).click();
}
async function closeAdults(page) { await page.locator('family-v2-shell').getByRole('button',{name:'Cerrar',exact:true}).click(); }
(async()=>{
  const browser = await chromium.launch(process.env.CHROME95_PATH?{executablePath:process.env.CHROME95_PATH}:{});
  try {
    for(const viewport of [{width:360,height:740},{width:740,height:360},{width:1280,height:800}]) {
      const context = await browser.newContext({viewport});const page = await context.newPage();
      const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>Math.random=()=>.1);
      for(const game of ['animal-quiz','fruit-splash','orbit-lab','rubik-solver']) {
        await page.goto(base+game+'/?test=1');await page.evaluate(()=>FamilyV2.fontReady);await gate(page);
        if(game==='animal-quiz') {
          await page.locator('[data-profile="full"]').click();
          const name=await page.locator('#animal-art').evaluate(n=>AnimalQuiz.animals.find(q=>q.id===n.dataset.animal).name);
          await page.getByRole('button',{name,exact:true}).click();await page.locator('#write-phase').waitFor({state:'visible'});
          const word=await page.locator('#word-model').textContent();for(const letter of word)await page.locator('[data-letter="'+letter+'"]').click();
          await page.locator('#result').waitFor({state:'visible'});assert.equal(await page.locator('#stars').textContent(),'2');
          assert.equal(await page.evaluate(()=>FamilyV2.read().points),2);
          await adults(page);await page.locator('#help-button').click();await page.locator('#help').waitFor({state:'visible'});await page.locator('#close-help').click();
        }
        if(game==='fruit-splash') {
          await page.locator('#play').click();
          for(let i=0;i<160 && await page.evaluate(()=>fruitDebug.snapshot().score)<100;i++) {
            const f=await page.evaluate(()=>fruitDebug.snapshot());const fruit=f.fruits.find(v=>!v.bomb&&v.y>150&&v.y<f.height-90);
            if(fruit){const x=fruit.x/f.width*viewport.width,y=fruit.y/f.height*viewport.height;await page.mouse.move(x-30,y);await page.mouse.down();await page.mouse.move(x+30,y,{steps:3});await page.mouse.up();}
            await page.waitForTimeout(70);
          }
          assert.ok(await page.evaluate(()=>fruitDebug.snapshot().score)>=100,'Reach the garden harvest through real cuts');
          assert.equal(await page.locator('#harvest').textContent(),'✓ Cesta llena');
          await page.locator('#pause').click();await adults(page);await closeAdults(page);assert.equal(await page.evaluate(()=>fruitDebug.snapshot().state),'paused');await page.locator('#resume').click();
          await adults(page);const snap=await page.evaluate(()=>fruitDebug.snapshot());await page.waitForTimeout(150);assert.deepEqual(await page.evaluate(()=>fruitDebug.snapshot()),snap);await closeAdults(page);
        }
        if(game==='orbit-lab') {
          await page.locator('#start').click();
          await page.getByRole('button',{name:'Elegir un nuevo universo',exact:true}).click();await page.locator('[data-template="life"]').click();assert.equal(await page.locator('#habitat').getAttribute('aria-pressed'),'true');
          await page.getByRole('button',{name:'Elegir un nuevo universo',exact:true}).click();await page.locator('[data-template="empty"]').click();assert.equal(await page.locator('#habitat').getAttribute('aria-pressed'),'false');
          await page.locator('#pause').click();
          for(const type of ['rock','comet','nebula']) {
            await page.locator('[data-body="'+type+'"]').click();await page.locator('#space').focus();await page.keyboard.press('Enter');
          }
          assert.ok((await page.locator('#mission').textContent()).startsWith('1/3'),'Three creations complete the discovery');
          await adults(page);await closeAdults(page);assert.equal(await page.evaluate(()=>__orbitDiagnostics.paused),true);
          await page.locator('#pause').click();await adults(page);const bodies=await page.evaluate(()=>__orbitDiagnostics.bodies);await page.waitForTimeout(150);assert.deepEqual(await page.evaluate(()=>__orbitDiagnostics.bodies),bodies);
          await page.locator('#sound').click();assert.equal(await page.evaluate(()=>__orbitDiagnostics.sound),true);await closeAdults(page);
        }
        if(game==='rubik-solver') {
          await page.locator('#solveBtn').click();assert.match(await page.locator('#validationBox').textContent(),/falta|vac|complet|color/i);
          await page.locator('#loadSolvedBtn').click();await page.locator('#solveBtn').click();await page.locator('#solutionPanel').waitFor({state:'visible'});assert.match(await page.locator('#solutionTitle').textContent(),/Sin movimientos/);
          await page.locator('[data-input-mode="camera"]').click();await page.locator('#cameraInputPanel').waitFor({state:'visible'});await page.locator('#switchToManualBtn').click();
          // Both destructive reset and clipboard export require explicit confirmation.
          let confirms=0;page.once('dialog',async d=>{confirms++;await d.dismiss();});await page.locator('#clearBtn').click();assert.equal(confirms,1);
        }
        const url=page.url();const storage=await page.evaluate(()=>Object.keys(localStorage).filter(k=>!k.startsWith('family-v2')).map(k=>[k,localStorage.getItem(k)]));
        await page.locator('family-v2-shell').locator('#home').click();assert.equal(page.url(),url,'Home stays in this game');
        if(game==='animal-quiz')await page.locator('#profiles').waitFor({state:'visible'});
        if(game==='fruit-splash')await page.locator('#menu').waitFor({state:'visible'});
        if(game==='orbit-lab')await page.locator('#welcome').waitFor({state:'visible'});
        if(game==='rubik-solver')await page.locator('#manualInputPanel').waitFor({state:'visible'});
        for(const [key,value] of storage){const actual=await page.evaluate(k=>localStorage.getItem(k),key);if(key==='orbit-lab-universe-v1')assert.deepEqual(JSON.parse(actual).bodies.map(b=>[b.id,b.type]),JSON.parse(value).bodies.map(b=>[b.id,b.type]));else assert.equal(actual,value,'Home preserves save '+key);}
        const fit=await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight}));assert.ok(fit.w<=viewport.width+1&&fit.h<=viewport.height+1,game+' viewport '+JSON.stringify(fit));
        await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await gate(page);
        if(game==='fruit-splash')assert.equal(await page.evaluate(()=>fruitDebug.snapshot().sound),false);
        if(game==='orbit-lab')assert.equal(await page.evaluate(()=>__orbitDiagnostics.sound),false);
        await context.setOffline(true);await page.reload();await gate(page);assert.equal(await page.evaluate(()=>FamilyV2.version),'2.0.0');await context.setOffline(false);
        console.log('PASS',game,viewport.width+'x'+viewport.height,'play, home/save, fit, reload/offline');
      }
      assert.deepEqual(errors,[]);await context.close();
    }
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
