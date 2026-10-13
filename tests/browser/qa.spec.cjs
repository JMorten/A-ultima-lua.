const { test, expect } = require('playwright/test');

async function openQa(page, errors) {
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('requestfailed', request => {
    if (new URL(request.url()).origin === 'http://127.0.0.1:4179') errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`);
  });
  page.on('response', response => {
    if (new URL(response.url()).origin === 'http://127.0.0.1:4179' && response.status() >= 400) errors.push(`http ${response.status()}: ${response.url()}`);
  });
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await page.goto('/');
  await expect(page.locator('#title-screen')).toBeVisible();
}

async function assertNoOverflow(page, width) {
  const dimensions = await page.evaluate(() => ({ inner: window.innerWidth, body: document.body.scrollWidth, doc: document.documentElement.scrollWidth }));
  expect(dimensions.inner).toBe(width);
  expect(Math.max(dimensions.body, dimensions.doc)).toBeLessThanOrEqual(width + 1);
}

async function assertNoClientErrors(errors) {
  expect(errors, errors.join('\n')).toEqual([]);
}

async function createCharacter(page, classKey = 'mago') {
  await page.locator('#qa-panel summary').click();
  await page.locator('#qa-class').selectOption(classKey);
  await page.locator('#qa-new').click();
  await expect(page.locator('#qa-confirm')).toBeVisible();
  await page.locator('#qa-confirm-new').click();
  await expect(page.locator('#title-screen')).toBeVisible(); // real confirmation reloads the disposable origin
  await page.locator('#class-select button', { hasText: 'CONTINUAR' }).click();
  await expect(page.locator('#game-screen')).toBeVisible();
  // Browser reload closes <details>; reopen the QA panel before its controls are used.
  await page.locator('#qa-panel summary').click();
}

test('inicializa, carrega seleção de classes e assets sem erro JS', async ({ page }) => {
  const errors = [];
  await openQa(page, errors);
  await expect(page.locator('#class-select .class-card')).toHaveCount(4);
  const brokenImages = await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src));
  expect(brokenImages, `broken images: ${brokenImages.join(', ')}`).toEqual([]);
  await assertNoOverflow(page, 390);
  await assertNoClientErrors(errors);
});

test('seleção de classe cria personagem e salva no armazenamento descartável', async ({ page }) => {
  const errors = [];
  await openQa(page, errors);
  await page.getByRole('button', { name: 'Escolher Mago' }).click();
  await expect(page.locator('#game-screen')).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('a-ultima-lua.checkpoint')));
  expect(saved.schemaVersion).toBe(5);
  expect(saved.player.classKey).toBe('mago');
  await assertNoClientErrors(errors);
});

test('QA cria personagem isolado e o personagem persiste após recarregar', async ({ page }) => {
  const errors = [];
  await openQa(page, errors);
  expect(await page.evaluate(() => localStorage.getItem('a-ultima-lua.checkpoint'))).toBeNull();
  await createCharacter(page);
  const afterReload = await page.evaluate(() => JSON.parse(localStorage.getItem('a-ultima-lua.checkpoint')));
  expect(afterReload.schemaVersion).toBe(5);
  expect(afterReload.player.classKey).toBe('mago');
  expect(afterReload.player.hp).toBeGreaterThan(0);
  await assertNoClientErrors(errors);
});

test('QA abre combate real e carrega Arena V2.4 com assets visuais', async ({ page }) => {
  const errors = [];
  await openQa(page, errors);
  await createCharacter(page);
  await page.locator('#qa-map').selectOption('2');
  await expect(page.locator('#qa-enemy option')).toHaveCount(6);
  await page.locator('#qa-enemy').selectOption('4');
  await page.locator('#qa-battle').click();
  await expect(page.locator('.battle-arena.arena-battlefield')).toBeVisible();
  await expect(page.locator('#portrait-player img')).toBeVisible();
  await expect(page.locator('#portrait-enemy img')).toBeVisible();
  await expect(page.locator('#portrait-target-blood img')).toBeVisible();
  await expect(page.locator('#portrait-target-siphon img')).toBeVisible();
  await page.waitForFunction(() => [...document.querySelectorAll('.arena-battlefield img')].every(img => img.complete && img.naturalWidth > 0), null, { timeout: 20_000 });
  const visual = await page.evaluate(() => ({
    background: getComputedStyle(document.querySelector('.battlefield-background')).backgroundImage,
    portraits: [...document.querySelectorAll('.arena-battlefield img')].map(img => ({ src: img.currentSrc, loaded: img.complete && img.naturalWidth > 0 }))
  }));
  expect(visual.background).not.toBe('none');
  expect(visual.portraits.length).toBeGreaterThanOrEqual(4);
  expect(visual.portraits.every(image => image.loaded), JSON.stringify(visual.portraits)).toBe(true);
  await page.locator('#qa-panel summary').click();
  await page.locator('#game-screen').screenshot({ path: `${process.env.AUL_PW_ARTIFACTS}/arena-v24-xama.png` });
  await assertNoClientErrors(errors);
});

for (const width of [320, 375, 390]) {
  test(`viewport ${width}px sem overflow horizontal`, async ({ page }) => {
    const errors = [];
    await page.setViewportSize({ width, height: 844 });
    await openQa(page, errors);
    await assertNoOverflow(page, width);
    await createCharacter(page, 'mago');
    await assertNoOverflow(page, width);
    await page.locator('#qa-map').selectOption('2');
    await page.locator('#qa-enemy').selectOption('4');
    await page.locator('#qa-battle').click();
    await expect(page.locator('.battle-arena.arena-battlefield')).toBeVisible();
    await assertNoOverflow(page, width);
    await assertNoClientErrors(errors);
  });
}
