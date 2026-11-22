const {test,expect}=require('@playwright/test');

test('Cole Aventura aparece una vez con icono y acceso público en pestaña nueva',async({page})=>{
  await page.goto('./');
  const card=page.locator('a.card').filter({has:page.locator('.card-title',{hasText:'Cole Aventura'})});
  await expect(card).toHaveCount(1);
  await expect(card.locator('.card-icon')).toHaveText('📚');
  await expect(card).toHaveAttribute('href','https://cmlozanos.github.io/cole-aventura/');
  await expect(card).toHaveAttribute('target','_blank');
  await expect(card).toHaveAttribute('rel','noopener');
  await expect(card.locator('.badge')).toHaveText('Primaria · PWA');
  await expect(card.locator('.status-label')).toHaveText('Siempre en línea ✓');
  await card.scrollIntoViewIfNeeded();
  await expect(card).toBeVisible();
});
