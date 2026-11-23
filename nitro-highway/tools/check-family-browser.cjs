// Focal integration check: run from home with node nitro-highway/tools/check-family-browser.cjs.
const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const { solveGate } = require('../../tests/helpers/learning-fixture.cjs');
(async () => {
  const browser = await chromium.launch(process.env.CHROME95_PATH?{executablePath:process.env.CHROME95_PATH}:{});
  try {
    for (const [slug, debug] of [['nitro-highway','__highway'],['pocket-karts','__karts'],['pulse-path','__pulse']]) {
      const page = await browser.newPage({ viewport:{width:320,height:568}, hasTouch:true });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(() => { Math.random = () => .18; });
      await page.goto((process.env.GAMES_BASE_URL || 'http://127.0.0.1:4177/') + slug + '/?test=1');
      await solveGate(page);
      await page.evaluate(() => FamilyV2.fontReady);
      const read = () => page.evaluate(key => key === '__pulse' ? window[key].read() : window[key], debug);
      const time = async () => { const s = await read(); return s.state ? s.state.t : s.time; };
      const shell = page.locator('family-v2-shell');
      async function adults() {
        await shell.locator('#adults').click();
        const q = (await shell.locator('#gate-label').textContent()).match(/(\d+) × (\d+)/);
        await shell.locator('#answer').fill(String(Number(q[1])*Number(q[2])));
        await shell.getByRole('button',{name:'Entrar',exact:true}).click();
      }
      for (const viewport of [{width:320,height:568},{width:740,height:360},{width:1280,height:800}]) {
        await page.setViewportSize(viewport);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        assert.deepEqual(await page.locator('button:visible,select:visible').evaluateAll(nodes => nodes.filter(n => {const r=n.getBoundingClientRect();return r.width<44||r.height<44||r.left<0||r.top<0||r.right>innerWidth+.5||r.bottom>innerHeight+.5;}).map(n=>n.id)),[],slug+' touch bounds');
        assert(await page.evaluate(() => document.documentElement.scrollHeight<=innerHeight && document.documentElement.scrollWidth<=innerWidth),slug+' no page scroll '+JSON.stringify(viewport)+' '+JSON.stringify(await page.evaluate(()=>[document.documentElement.scrollHeight,innerHeight,document.documentElement.scrollWidth,innerWidth])));
      }
      await page.locator('#play').click(); await page.waitForTimeout(150);
      if(slug!=='pulse-path') {
        const right=page.locator('[data-input="right"]');
        await right.dispatchEvent('pointerdown',{pointerId:31,pointerType:'touch',buttons:1});
        await right.dispatchEvent('pointerdown',{pointerId:32,pointerType:'touch',buttons:1});
        await right.dispatchEvent('pointerup',{pointerId:31,pointerType:'touch'});
        assert((await read()).held.includes('right'),'second touch keeps steering');
        await page.keyboard.down('ArrowRight');
        await right.dispatchEvent('pointercancel',{pointerId:32,pointerType:'touch'});
        assert((await read()).held.includes('right'),'keyboard keeps steering after touch cancel');
        await page.keyboard.up('ArrowRight'); assert(!(await read()).held.includes('right'));
        await page.locator('#pause').click(); await page.locator('#retry').click(); assert((await read()).time<.15,'restart clock resets');
      }
      await adults(); const frozen = await time(); await page.waitForTimeout(120); assert.equal(await time(),frozen);
      await page.locator('#sound').click(); assert.equal((await read()).sound,true);
      await page.locator('#help').click();
      assert(await page.locator(slug==='pulse-path'?'#help-panel':'#guide').isVisible(),slug+' help content');
      if(slug==='pulse-path')await page.locator('#close-help').click();
      await shell.locator('#close').click(); await page.waitForTimeout(150); assert((await time())>frozen);
      await page.locator('#pause').click(); await adults(); const manual=await time(); await shell.locator('#close').click(); await page.waitForTimeout(120);
      assert.equal(await time(),manual); assert.equal((await read()).paused,true);
      await shell.locator('#theme').selectOption('dark'); assert.equal(await page.locator('html').getAttribute('data-family-theme'),'dark');
      const url=page.url(); await shell.locator('#home').click(); assert.equal(page.url(),url,slug+' home stays in game'); assert(await page.locator('#menu').isVisible(),slug+' native home menu');
      await page.reload(); await solveGate(page); assert.equal((await read()).sound,false);
      assert.deepEqual(errors,[],slug+' browser errors');
      console.log('PASS '+slug+': 44px, viewport, adult settings/listeners, pause/resume/manual pause, theme, audio OFF');
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
