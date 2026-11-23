const {test,expect}=require('@playwright/test');
const {solveGate}=require('../helpers/learning-fixture.cjs');
for(const game of ['memory-garden','shape-studio','little-atelier','maze-meadow','nitro-highway','pocket-karts','pulse-path','animal-quiz','fruit-splash','orbit-lab','rubik-solver'])test(game+':V2 shell/native home/parent/settings/offline',async({page,context,browserName})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>Math.random=()=>.1);
 await page.goto(game+'/?test=1');await solveGate(page);await expect(page.locator('family-v2-shell')).toBeVisible();
 await page.evaluate(()=>FamilyV2.fontReady);expect(await page.evaluate(()=>FamilyV2.version)).toBe('2.0.0');
 const before=page.url();await page.getByRole('button',{name:'Inicio del juego',exact:true}).click();expect(page.url()).toBe(before);
 await page.getByRole('button',{name:'Para adultos',exact:true}).click();const label=await page.locator('family-v2-shell #gate-label').textContent();const[a,b]=label.match(/\d+/g).map(Number);
 await page.getByRole('textbox',{name:'Resultado de la multiplicación'}).fill('1');await page.getByRole('button',{name:'Entrar',exact:true}).click();await expect(page.locator('family-v2-shell #adult-settings')).not.toBeVisible();
 await page.getByRole('textbox',{name:'Resultado de la multiplicación'}).fill(String(a*b));await page.getByRole('button',{name:'Entrar',exact:true}).click();await expect(page.locator('family-v2-shell #adult-settings')).toBeVisible();
 await page.getByRole('button',{name:'Cerrar',exact:true}).click();await page.getByRole('combobox',{name:'Aspecto',exact:true}).selectOption('dark');await expect(page.locator('html')).toHaveAttribute('data-family-theme','dark');
 await page.evaluate(()=>navigator.serviceWorker.ready);await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
 if(browserName==='chromium'){await context.setOffline(true);await page.reload();await solveGate(page);await expect(page.locator('family-v2-shell')).toBeVisible();await context.setOffline(false);}
 expect(errors).toEqual([]);
});
