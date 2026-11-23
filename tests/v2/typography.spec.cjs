const {test,expect}=require('../helpers/learning-fixture.cjs');
const games=['animal-quiz','nitro-highway','pocket-karts','pulse-path','fruit-splash','orbit-lab','memory-garden','shape-studio','little-atelier','maze-meadow','rubik-solver'];
for(const game of games)test(game+': every visible native text uses the linked school font',async({page})=>{
  await page.goto(game+'/');
  await page.evaluate(()=>FamilyV2.fontReady);
  const result=await page.evaluate(()=>{
    const elements=[...document.body.querySelectorAll('*')].filter(e=>!e.closest('svg,script,style,family-v2-shell')&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&[...e.childNodes].some(n=>n.nodeType===3&&/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/.test(n.textContent)));
    return {loaded:document.fonts.check('20px "Family School"'),count:elements.length,bad:elements.filter(e=>!getComputedStyle(e).fontFamily.includes('Family School')).map(e=>({tag:e.tagName,id:e.id,font:getComputedStyle(e).fontFamily}))};
  });
  expect(result.loaded).toBe(true);expect(result.count).toBeGreaterThan(0);expect(result.bad).toEqual([]);
});
