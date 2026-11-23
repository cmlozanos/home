const {chromium} = require('playwright');
const Cube = require('../vendor/cubejs/cube.js');
const assert = require('node:assert/strict');
const base = process.env.GAMES_BASE_URL || 'http://127.0.0.1:4177/';
(async()=>{
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const cube = new Cube(); cube.move('R');
    const facelets = cube.asString();
    const state = Object.fromEntries(['U','R','F','D','L','B'].map((face,i)=>[face,facelets.slice(i*9,i*9+9).split('')]));
    await page.addInitScript(value=>localStorage.setItem('rubik-solver-state-v1',JSON.stringify(value)),state);
    await page.goto(base+'rubik-solver/');
    await page.locator('#solveBtn').click();
    await page.locator('#solutionPanel').waitFor({state:'visible',timeout:30000});
    const steps = Number((await page.locator('#solutionTitle').textContent()).match(/\d+/)[0]);
    for(let i=0;i<steps;i++) {
      await page.locator('#nextStepBtn').click();
      await page.waitForFunction(()=>!document.querySelector('.solution-turning-layer'),null,{timeout:10000});
    }
    assert.match(await page.locator('#solutionMoveBadge').textContent(),/completada/);
    assert.equal(await page.evaluate(()=>FamilyV2.read().points),3);
    console.log('PASS Rubik R scramble:',steps,'animated steps, completion and points');
    const blocked = await browser.newPage(), errors=[];
    await blocked.addInitScript(()=>{Storage.prototype.getItem=Storage.prototype.setItem=Storage.prototype.removeItem=function(){throw Error('blocked');};});
    blocked.on('pageerror',error=>errors.push(error.message));
    await blocked.goto(base+'rubik-solver/');
    await blocked.locator('#loadSolvedBtn').click();await blocked.locator('#solveBtn').click();
    assert.match(await blocked.locator('#validationBox').textContent(),/ya está resuelto/);
    assert.deepEqual(errors,[]);
    console.log('PASS Rubik storage denied: editing and solving remain usable');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
