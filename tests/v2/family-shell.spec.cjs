const {test,expect}=require('@playwright/test');
test('shared2 shell preserves native settings IDs, parent gate, score, theme, audio and pauses',async({page})=>{
 await page.route('**/v2-fixture.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><head></head><body></body></html>'}));
 await page.goto('v2-fixture.html');
 await page.evaluate(()=>{
  document.body.innerHTML='<header><span data-family-slot></span><button id="native-sound" data-family-setting>♪</button></header><p>¡Elige tu aventura!</p>';
  window.calls={pause:0,resume:0,sound:0,home:0};document.getElementById('native-sound').onclick=()=>window.calls.sound++;
  const css=document.createElement('link');css.rel='stylesheet';css.href='family-v2/family.css?v=2.0.0';document.head.appendChild(css);
  const script=document.createElement('script');script.src='family-v2/family.js?v=2.0.0';script.dataset.game='test-game';document.body.appendChild(script);
 });
 await expect(page.locator('family-v2-shell')).toBeVisible();
 await page.evaluate(()=>FamilyV2.register({home(){calls.home++;},pause(){calls.pause++;},resume(){calls.resume++;}}));
 expect(await page.evaluate(()=>document.getElementById('native-sound')!==null)).toBe(true);
 await expect(page.getByRole('button',{name:'♪',exact:true})).not.toBeVisible();
 await page.getByRole('button',{name:'Para adultos',exact:true}).click();
 await expect(page.getByRole('button',{name:'♪',exact:true})).not.toBeVisible();
 const expr=await page.locator('#gate-label').textContent();const [a,b]=expr.match(/\d+/g).map(Number);
 await page.getByRole('textbox',{name:'Resultado de la multiplicación'}).fill('1');await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await expect(page.locator('#gate-error')).toHaveText('↻');
 await page.getByRole('textbox',{name:'Resultado de la multiplicación'}).fill(String(a*b));await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await page.getByRole('button',{name:'♪',exact:true}).click();expect(await page.evaluate(()=>calls.sound)).toBe(1);
 await page.getByRole('button',{name:'Cerrar',exact:true}).click();await expect.poll(()=>page.evaluate(()=>calls)).toMatchObject({pause:1,resume:1});
 await page.getByRole('combobox',{name:'Aspecto'}).selectOption('dark');await expect(page.locator('html')).toHaveAttribute('data-family-theme','dark');
 await page.evaluate(()=>{FamilyV2.award('first',2);FamilyV2.award('first',2);});await expect(page.locator('#points')).toHaveText('2');
 expect(await page.evaluate(()=>document.body.textContent.includes('Elige tu aventura'))).toBe(true);
 const url=page.url();await page.getByRole('button',{name:'Inicio del juego',exact:true}).click();expect(page.url()).toBe(url);expect(await page.evaluate(()=>calls.home)).toBe(1);
});
