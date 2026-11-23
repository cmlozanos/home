const {test,expect}=require('@playwright/test');
const {readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const {solveGate}=require('../helpers/learning-fixture.cjs');
const kit=resolve(__dirname,'../../family-v2');

async function canonicalKit(page) {
  // Native samples still load the canonical kit before main propagates its copies.
  for(const file of ['family.js','family.css'])await page.route('**/family-v2/'+file+'*',route=>route.fulfill({
    contentType:file.endsWith('.js')?'text/javascript; charset=utf-8':'text/css; charset=utf-8',body:readFileSync(resolve(kit,file),'utf8')
  }));
}
async function fixture(page) {
  await canonicalKit(page);
  await page.route('**/navigation-controls.html',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="family-v2/family.css">
    </head><body><span data-family-slot></span><button id="native-home" data-family-home>Inicio</button>
    <button id="native-pause" style="width:60px;height:60px">Pausa</button><button id="native-setting" data-family-setting>Sonido</button>
    <script>window.nativeClicks=0;document.querySelector('#native-home').addEventListener('click',()=>nativeClicks++);</script>
    </body></html>`}));
  await page.goto('navigation-controls.html');
}
async function mount(page) {
  await page.addScriptTag({url:'family-v2/family.js'});
  await expect(page.locator('family-v2-shell')).toBeVisible();
}

test('one Home replaces duplicates only while mounted, preserving native nodes and listeners',async({page})=>{
  await fixture(page);
  await expect(page.locator('[data-family-home]')).toBeVisible();
  await page.evaluate(()=>{window.originalHome=document.querySelector('#native-home');});
  await mount(page);
  await expect(page.locator('[data-family-home]')).toBeHidden();
  await page.evaluate(()=>{window.homeCalls=0;FamilyV2.register({home(){homeCalls++;}});});
  await page.locator('family-v2-shell #home').click();
  expect(await page.evaluate(()=>homeCalls)).toBe(1);
  await page.evaluate(()=>document.querySelector('#native-home').click());
  expect(await page.evaluate(()=>({same:originalHome===document.querySelector('#native-home'),nativeClicks,homeCalls}))).toEqual({same:true,nativeClicks:1,homeCalls:2});
  await page.evaluate(()=>{const home=document.createElement('button');home.dataset.familyHome='';home.id='late-home';home.textContent='Inicio';document.body.appendChild(home);});
  await expect(page.locator('#late-home')).toBeHidden();
  await expect(page.locator('#native-pause')).toHaveCSS('height','60px');
  await page.evaluate(()=>document.querySelector('family-v2-shell').remove());
  await expect(page.locator('#native-home')).toBeVisible();
  await expect(page.locator('#late-home')).toBeVisible();
});

test('native Pulse sample exposes only the shared Home and keeps native settings',async({page})=>{
  await canonicalKit(page);
  await page.goto('pulse-path/');
  await solveGate(page);
  await expect(page.locator('body > header > #home[data-family-home]')).toBeHidden();
  await expect(page.locator('family-v2-shell #home')).toBeVisible();
  await page.locator('family-v2-shell #home').click();
  await expect(page.locator('family-v2-shell #adults')).toBeVisible();
  await expect(page.locator('#help')).toHaveAttribute('slot','family-settings');
});

for(const viewport of [{width:320,height:740},{width:740,height:360},{width:800,height:1280},{width:1280,height:800}])test(`shell proportional bounds and 44px targets at ${viewport.width}x${viewport.height}`,async({page})=>{
  await page.setViewportSize(viewport);
  await fixture(page);await mount(page);
  const shell=page.locator('family-v2-shell');
  for(const id of ['home','theme','adults']) {
    const box=await shell.locator('#'+id).boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeLessThanOrEqual(56);expect(box.height).toBeLessThanOrEqual(56);
    const proportional=Math.max(44,Math.min(viewport.width*.07,viewport.height*.12,56));
    expect(box.height).toBeCloseTo(proportional,1);
  }
  const bar=await shell.locator('.bar').boundingBox();
  expect(bar.height).toBeLessThanOrEqual(64);expect(bar.width).toBeLessThanOrEqual(viewport.width-16);
  await page.evaluate(()=>{Object.defineProperty(visualViewport,'height',{configurable:true,value:280});visualViewport.dispatchEvent(new Event('resize'));});
  const compact=await shell.locator('#home').boundingBox();
  expect(compact.height).toBe(44);
  await page.evaluate(()=>{Object.defineProperty(visualViewport,'height',{configurable:true,value:innerHeight});Object.defineProperty(visualViewport,'width',{configurable:true,value:300});visualViewport.dispatchEvent(new Event('resize'));});
  expect((await shell.locator('#theme').boundingBox()).width).toBe(44);
  await shell.locator('#theme').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-family-theme','dark');
  await page.evaluate(()=>FamilyV2.award('navigation',3));
  await expect(shell.locator('#points')).toHaveText('3');
  await shell.locator('#adults').click();
  const numbers=(await shell.locator('#gate-label').textContent()).match(/\d+/g).map(Number);
  await shell.locator('#answer').fill(String(numbers[0]*numbers[1]));await shell.locator('#gate button').click();
  await expect(page.locator('#native-setting')).toBeVisible();
});
