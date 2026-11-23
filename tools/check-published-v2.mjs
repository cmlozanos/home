import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const bases=process.argv.slice(2);
if(!bases.length)throw Error('Provide published HTTPS game URLs');
const browser=await chromium.launch();
try{for(const base of bases){const page=await browser.newPage({viewport:{width:1024,height:768},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>Math.random=()=>.1);await page.goto(base);await page.waitForSelector('family-v2-shell');
if(await page.locator('#learning-gate').count()){const text=await page.locator('#gate-prompt').textContent();const m=text.match(/(\d)\s*([+−-])\s*(\d)/);if(!m)throw Error('expected math gate '+base);await page.locator('[data-gate-key="'+(m[2]==='+'?+m[1]+ +m[3]:+m[1]- +m[3])+'"]').click();}
assert.equal(await page.evaluate(()=>FamilyV2.version),'2.0.0');const url=page.url();await page.getByRole('button',{name:'Inicio del juego',exact:true}).click();assert.equal(page.url(),url);
await page.getByRole('button',{name:'Para adultos',exact:true}).click();const[a,b]=(await page.locator('family-v2-shell #gate-label').textContent()).match(/\d+/g).map(Number);await page.getByRole('textbox',{name:'Resultado de la multiplicación'}).fill(String(a*b));await page.getByRole('button',{name:'Entrar',exact:true}).click();assert(await page.locator('family-v2-shell #adult-settings').isVisible());await page.getByRole('button',{name:'Cerrar',exact:true}).click();assert.deepEqual(errors,[]);console.log('PUBLISHED V2',base,'native home, parent gate, font/shell loaded, no page errors');await page.close();}}
finally{await browser.close();}
