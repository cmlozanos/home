const {test,expect}=require('../helpers/learning-fixture.cjs');

test('native renderers receive resolved theme and effective decorative motion',async({page})=>{
  await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});
  await page.goto('memory-garden/');
  await page.waitForFunction(()=>window.FamilyV2&&FamilyV2.motionAllowed);
  expect(await page.evaluate(()=>({theme:FamilyV2.theme(),motion:FamilyV2.motionAllowed()}))).toEqual({theme:'light',motion:false});
  await page.evaluate(()=>{window.appearanceEvents=[];addEventListener('familyv2:appearance',e=>appearanceEvents.push(e.detail));});
  await page.locator('family-v2-shell #theme').selectOption('dark');
  expect(await page.evaluate(()=>FamilyV2.theme())).toBe('dark');
  expect(await page.evaluate(()=>appearanceEvents.at(-1))).toEqual({theme:'dark',motion:false});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect.poll(()=>page.evaluate(()=>FamilyV2.motionAllowed())).toBe(true);
  await page.locator('family-v2-shell #adults').click();
  const nums=(await page.locator('family-v2-shell #gate-label').textContent()).match(/\d+/g).map(Number);
  await page.locator('family-v2-shell #answer').fill(String(nums[0]*nums[1]));
  await page.locator('family-v2-shell #gate button').click();
  await page.locator('family-v2-shell #motion').click();
  expect(await page.evaluate(()=>FamilyV2.motionAllowed())).toBe(false);
  await expect(page.locator('family-v2-shell #motion')).toHaveAttribute('aria-pressed','false');
});
