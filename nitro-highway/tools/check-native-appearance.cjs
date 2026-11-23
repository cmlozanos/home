// Native-only render regression. Uses the repo's installed Playwright and running preview.
const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { solveGate } = require('../../tests/helpers/learning-fixture.cjs');
(async () => {
  const browser = await chromium.launch();
  const evidence = path.resolve('docs/v2/refinement/evidence/racing');
  fs.mkdirSync(evidence, { recursive: true });
  try {
    for (const [slug, id, debug] of [['nitro-highway','road','__highway'],['pocket-karts','circuit','__karts'],['pulse-path','world','__pulse']]) {
      const page = await browser.newPage({ viewport:{width:1280,height:800}, hasTouch:true, deviceScaleFactor:1, serviceWorkers:'block' });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(() => { Math.random = () => .18; });
      await page.goto((process.env.GAMES_BASE_URL || 'http://127.0.0.1:4177/') + slug + '/?test=1');
      await solveGate(page);
      await page.evaluate(async () => {
        await FamilyV2.fontReady;
        await document.fonts.ready;
        window.renderTheme = 'light'; window.renderMotion = true;
        FamilyV2.theme = () => window.renderTheme;
        FamilyV2.motionAllowed = () => window.renderMotion;
        // Capture actual text operations, not just source declarations.
        window.nativeFonts = [];
        const fillText = CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText = function (...args) { window.nativeFonts.push(this.font); return fillText.apply(this,args); };
      });
      await page.locator('#play').click();
      const read = () => page.evaluate(key => key === '__pulse' ? window[key].read().state.t : window[key].time, debug);
      await page.waitForTimeout(160);
      await page.evaluate(() => { window.renderMotion = false; window.dispatchEvent(new CustomEvent('familyv2:appearance',{detail:{theme:'light',motion:false}})); });
      const time = await read(); await page.waitForTimeout(140); assert(await read() > time, slug+' motion-off preserves gameplay');
      await page.locator('#pause').click();
      const frozen = await read();
      if (slug === 'pocket-karts') {
        const motionImages = await page.evaluate(id => {
          const images=[];
          for(const motion of [true,false]) { window.renderMotion=motion; window.dispatchEvent(new CustomEvent('familyv2:appearance',{detail:{theme:'light',motion}})); images.push(document.getElementById(id).toDataURL()); }
          return images;
        },id);
        assert.notEqual(motionImages[0],motionImages[1],'decorative ghosts removed, player retained');
      }
      for (const viewport of [{width:1280,height:800},{width:740,height:360}]) {
        await page.setViewportSize(viewport);
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        const hashes = [];
        for (const theme of ['light','dark']) {
          hashes.push(await page.evaluate(({theme,id}) => {
            window.renderTheme=theme;
            // Deliberately disagree with DOM: getter is authoritative.
            document.documentElement.setAttribute('data-family-theme',theme==='dark'?'light':'dark');
            window.dispatchEvent(new CustomEvent('familyv2:appearance',{detail:{theme,motion:false}}));
            const c=document.getElementById(id);
            if(c.width>innerWidth || c.height>innerHeight) throw Error('native DPR budget exceeded');
            return c.toDataURL();
          },{theme,id}));
          await page.evaluate(theme => { document.documentElement.setAttribute('data-family-theme',theme); },theme);
          await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
          await page.locator('#'+id).screenshot({style:'#result, #pause-panel { visibility:hidden !important; }',path:path.join(evidence,slug+'-'+viewport.width+'-'+theme+'.png')});
        }
        assert.notEqual(hashes[0],hashes[1],slug+' native day/night pixels');
      }
      assert.equal(await read(),frozen,slug+' appearance preserves pause');
      const fonts=await page.evaluate(()=>window.nativeFonts);
      assert(fonts.every(f=>f.includes('Family School')),slug+' native handwritten text');
      const source=fs.readFileSync(path.join(slug,'game.js'),'utf8');
      assert(!/ctx\.font\s*=\s*['"]/.test(source),slug+' canvas text must use sceneFont');
      assert(source.includes('FamilyV2.fontFamily') && source.includes('FamilyV2.fontReady'),slug+' shared font contract');
      // Without getters use native theme + reduced-motion, without throwing.
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.evaluate(()=>{delete FamilyV2.theme;delete FamilyV2.motionAllowed;window.dispatchEvent(new CustomEvent('familyv2:appearance',{detail:{theme:'dark',motion:false}}));});
      assert.deepEqual(errors,[],slug+' browser errors');
      console.log('PASS '+slug+': native light/dark getter+event, fallback, motion-off gameplay, pause, 1x, typography, tablet+short landscape');
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
