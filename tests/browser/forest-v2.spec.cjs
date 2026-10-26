const {test, expect} = require('playwright/test');

async function openForestBattle(page, width, enemyName = 'Lobo Comum') {
  const errors = [];
  const failedAssets = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400) failedAssets.push(`${response.status()} ${response.url()}`);
  });
  await page.setViewportSize({width, height: width === 320 ? 568 : width === 375 ? 667 : 844});
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({status:200, contentType:'text/css', body:''}));
  await page.goto('/');
  await page.locator('#qa-panel summary').click();
  await page.locator('#qa-class').selectOption('mago');
  await page.locator('#qa-new').click();
  await page.locator('#qa-confirm-new').click();
  await page.locator('#class-select button', {hasText:'CONTINUAR'}).click();
  if (!await page.locator('#qa-panel details').evaluate(element => element.open)) await page.locator('#qa-panel summary').click();
  await page.locator('#qa-map').selectOption('0');
  const enemy = page.locator('#qa-enemy option').filter({hasText:enemyName});
  await page.locator('#qa-enemy').selectOption(await enemy.getAttribute('value'));
  await page.locator('#qa-battle').click();
  await expect(page.locator('.arena-stage')).toBeVisible();
  await page.waitForFunction(() => [...document.querySelectorAll('.arena-actor img')].every(image => image.complete && image.naturalWidth > 0));
  return {errors, failedAssets};
}

for (const [wolfName, slug, expectedAsset] of [
  ['Lobo Comum', 'comum', 'assets/images/enemies/forest/lobo_comum_combat_v2.png'],
  ['Lobo Cinzento', 'cinzento', 'assets/images/enemies/forest/lobo_cinzento_combat_v2.png'],
  ['Lobisomem Jovem', 'jovem', 'assets/images/enemies/forest/lobisomem_jovem_combat_v2.png'],
]) {
  for (const width of [320, 375, 390]) {
    test(`${wolfName} V2: enquadramento real em ${width}px`, async ({page}) => {
      const diagnostics = await openForestBattle(page, width, wolfName);
      const result = await page.evaluate(async () => {
        const stage = document.querySelector('.arena-stage').getBoundingClientRect();
        const player = document.querySelector('.arena-actor.actor-player').getBoundingClientRect();
        const enemy = document.querySelector('.arena-actor.actor-enemy').getBoundingClientRect();
        const wolf = document.querySelector('#portrait-enemy img');
        const mage = document.querySelector('#portrait-player img');
        const background = getComputedStyle(document.querySelector('.battlefield-background')).backgroundImage;
        const canvas = document.createElement('canvas');
        canvas.width = wolf.naturalWidth; canvas.height = wolf.naturalHeight;
        const context = canvas.getContext('2d', {willReadFrequently:true});
        context.drawImage(wolf, 0, 0);
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const cornerAlpha = [[0,0],[canvas.width-1,0],[0,canvas.height-1],[canvas.width-1,canvas.height-1]].map(([x,y]) => data[(y*canvas.width+x)*4+3]);
        const controls = [...document.querySelectorAll('.combat-controls button')].filter(button => getComputedStyle(button).display !== 'none');
        return {
          stage:{left:stage.left,right:stage.right,top:stage.top,bottom:stage.bottom},
          player:{left:player.left,right:player.right,top:player.top,bottom:player.bottom},
          enemy:{left:enemy.left,right:enemy.right,top:enemy.top,bottom:enemy.bottom},
          enemySrc:wolf.getAttribute('src'),
          wolfFit:getComputedStyle(wolf).objectFit,
          wolfPosition:getComputedStyle(wolf).objectPosition,
          mageFit:getComputedStyle(mage).objectFit,
          background,
          cornerAlpha,
          horizontalOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          visibleControls:controls.length,
          minimumControlHeight:Math.min(...controls.map(button => button.getBoundingClientRect().height))
        };
      });
      expect(result.enemySrc).toBe(expectedAsset);
      expect(result.background).toContain('floresta_uivante_arena_v2.jpeg');
      expect(result.wolfFit).toBe('contain');
      expect(result.wolfPosition).toBe('50% 100%');
      expect(result.mageFit).toBe('contain');
      expect(result.player.right).toBeLessThan(result.enemy.left + 1);
      for (const actor of [result.player, result.enemy]) {
        expect(actor.left).toBeGreaterThanOrEqual(result.stage.left - 1);
        expect(actor.right).toBeLessThanOrEqual(result.stage.right + 1);
        expect(actor.top).toBeGreaterThanOrEqual(result.stage.top - 1);
        expect(actor.bottom).toBeLessThanOrEqual(result.stage.bottom + 1);
      }
      expect(result.cornerAlpha).toEqual([0,0,0,0]);
      expect(result.horizontalOverflow).toBeLessThanOrEqual(0);
      expect(result.visibleControls).toBeGreaterThan(0);
      expect(result.minimumControlHeight).toBeGreaterThanOrEqual(44);
      await page.getByRole('button', {name:'Atacar', exact:true}).click();
      await expect(page.getByRole('button', {name:'Atacar', exact:true})).toBeEnabled();
      await page.locator('.battle-arena').screenshot({path:`${process.env.AUL_PW_ARTIFACTS}/${slug}-v2-${width}.png`});
      await page.locator('#qa-panel details').evaluate(element => { element.open = false; });
      await page.screenshot({path:`${process.env.AUL_PW_ARTIFACTS}/${slug}-v2-${width}-combate.png`, fullPage:false});
      expect(diagnostics.errors).toEqual([]);
      expect(diagnostics.failedAssets).toEqual([]);
    });
  }
}

test('Floresta V2 não altera os assets dos outros encontros', async ({page}) => {
  await openForestBattle(page, 390);
  for (const [name, expectedPath] of [
    ['Lobisomem Feroz', 'assets/images/enemies/forest/lobisomem_feroz.jpg'],
    ['Alfa da Matilha', 'assets/images/enemies/forest/alfa_matilha.jpg']
  ]) {
    await page.reload();
    await page.locator('#class-select button', {hasText:'CONTINUAR'}).click();
    await page.locator('#qa-panel summary').click();
    await page.locator('#qa-map').selectOption('0');
    const option = page.locator('#qa-enemy option').filter({hasText:name});
    await page.locator('#qa-enemy').selectOption(await option.getAttribute('value'));
    await page.locator('#qa-battle').click();
    await expect(page.locator('#portrait-enemy img')).toHaveAttribute('src', expectedPath);
  }
});
