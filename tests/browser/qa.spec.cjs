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

async function ensureQaOpen(page) {
  const details = page.locator('#qa-panel details');
  if (!await details.evaluate(element => element.open)) await page.locator('#qa-panel summary').click();
  await expect(details).toHaveJSProperty('open', true);
}

async function createCharacter(page, classKey = 'mago') {
  await ensureQaOpen(page);
  await page.locator('#qa-class').selectOption(classKey);
  await page.locator('#qa-new').click();
  await expect(page.locator('#qa-confirm')).toBeVisible();
  await page.locator('#qa-confirm-new').click();
  await expect(page.locator('#title-screen')).toBeVisible();
  await page.locator('#class-select button', { hasText: 'CONTINUAR' }).click();
  await expect(page.locator('#game-screen')).toBeVisible();
  await ensureQaOpen(page);
}

async function setQaStats(page, { level, forca = 0, magia = 0, espirito = 0 }) {
  await ensureQaOpen(page);
  await expect(page.locator('#qa-state')).toContainText('Mago · nível 1');
  // QA Debug observes the continued character on its 500 ms timer; let that
  // initial read finish before filling the form so it cannot overwrite edits.
  await page.waitForTimeout(600);
  await page.locator('#qa-level').fill(String(level));
  await page.locator('#qa-statPoints').fill('0');
  await page.locator('#qa-forca').fill(String(forca));
  await page.locator('#qa-agilidade').fill('0');
  await page.locator('#qa-magia').fill(String(magia));
  await page.locator('#qa-espirito').fill(String(espirito));
  await page.locator('#qa-vitalidade').fill('0');
  await page.locator('#qa-defesa').fill('0');
  await expect(page.locator('#qa-level')).toHaveValue(String(level));
  await expect(page.locator('#qa-forca')).toHaveValue(String(forca));
  await page.locator('#qa-apply').click();
  await expect(page.locator('#qa-apply-message')).toContainText('Checkpoint gravado');
  await expect(page.locator('#qa-apply-message')).toContainText(`Nível ${level}`);
}

async function startShaman(page, errors, stats = null) {
  await openQa(page, errors);
  await createCharacter(page, 'mago');
  if (stats) await setQaStats(page, stats);
  await page.locator('#qa-restore').click();
  await page.locator('#qa-map').selectOption('2');
  await page.locator('#qa-enemy').selectOption('4');
  await page.locator('#qa-battle').click();
  await expect(page.locator('.battle-arena.arena-battlefield')).toBeVisible();
  await expect(page.locator('.ritual-target-actions button')).toHaveCount(2);
  await page.waitForFunction(() => [...document.querySelectorAll('.arena-battlefield img')].every(img => img.complete && img.naturalWidth > 0), null, { timeout: 20_000 });
}

function currentHp(text) {
  const match = /(\d+)\/(\d+)/.exec(text.trim());
  if (!match) throw new Error(`Unexpected HP text: ${text}`);
  return { current: Number(match[1]), max: Number(match[2]) };
}

function damageFromLog(text, target) {
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`Você atinge ${escaped} e causa (\\d+) de dano efetivo\\.`).exec(text);
  if (!match) throw new Error(`No effective damage entry for ${target}: ${text}`);
  return Number(match[1]);
}

async function attackButton(page) {
  const button = page.locator('.battle-actions button.action-btn').filter({ hasText: /^Atacar$/ });
  await expect(button).toBeEnabled();
  return button;
}

async function hitSelectedTotem(page) {
  await (await attackButton(page)).click();
  await expect(await attackButton(page)).toBeEnabled();
}

async function destroySelectedTotem(page, targetName) {
  const target = page.locator('.ritual-target-actions button').filter({ hasText: targetName });
  for (let turn = 0; turn < 20; turn++) {
    if (await page.locator('.ritual-target-actions').count() === 0) return;
    if (await target.count() === 0) return;
    const label = await target.innerText();
    if (label.includes('DESTRUÍDO')) return;
    const before = currentHp(label).current;
    await hitSelectedTotem(page);
    const result = await page.waitForFunction(({ targetName, previous }) => {
      const controls = document.querySelector('.ritual-target-actions');
      if (!controls) return 'AWAKE';
      const button = [...controls.querySelectorAll('button')].find(item => item.innerText.includes(targetName));
      if (!button) return 'REMOVED';
      return button.innerText === previous ? false : button.innerText;
    }, { targetName, previous: label }, { timeout: 8_000 }).then(handle => handle.jsonValue());
    if (result === 'AWAKE' || result === 'REMOVED' || result.includes('DESTRUÍDO')) return;
    const afterLabel = result;
    expect(currentHp(afterLabel).current).toBeLessThan(before);
  }
  throw new Error(`${targetName} não foi destruído após 20 ataques pela interface.`);
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

test('QA inicia Xamã pelo fluxo real; totem selecionado recebe ataque e Xamã permanece intocado', async ({ page }) => {
  const errors = [];
  await startShaman(page, errors, { level: 3, forca: 100 });
  const xamaBefore = currentHp(await page.locator('#arena-hp-enemy-text').innerText()).current;
  await expect(page.locator('.ritual-target-actions button')).toHaveCount(2);
  await expect(page.getByRole('button', { name: /Orc Xamã/ })).toHaveCount(0);
  await expect(page.locator('.ritual-target-actions button').filter({ hasText: 'Totem de Sangue' })).toHaveClass(/selected/);
  await page.locator('#game-screen').screenshot({ path: `${process.env.AUL_PW_ARTIFACTS}/ritual-xama-totens-ativos.png` });

  await hitSelectedTotem(page);
  const log = await page.locator('#battle-log').innerText();
  expect(log).toContain('Você atinge Totem de Sangue e causa');
  expect(currentHp(await page.locator('#arena-hp-enemy-text').innerText()).current).toBe(xamaBefore);
  await expect(page.locator('.ritual-target-actions button').filter({ hasText: 'Totem de Sangue' })).toBeVisible();
  await assertNoClientErrors(errors);
});

test('Essência sofre retaliação de 20% efetivo e reload não restaura combate nem duplica perda', async ({ page }) => {
  const errors = [];
  await startShaman(page, errors, { level: 3, forca: 100 });
  const xamaBefore = currentHp(await page.locator('#arena-hp-enemy-text').innerText()).current;
  await page.locator('.ritual-target-actions button').filter({ hasText: 'Totem da Essência' }).click();
  const hpBefore = currentHp(await page.locator('#hud-hp-text').innerText()).current;
  await hitSelectedTotem(page);

  const log = await page.locator('#battle-log').innerText();
  const effective = damageFromLog(log, 'Totem da Essência');
  const reflectedMatch = /RETALIAÇÃO DO SANGUE\s+(\d+) de dano retorna para você\./.exec(log);
  expect(reflectedMatch, log).not.toBeNull();
  const reflected = Number(reflectedMatch[1]);
  expect(reflected).toBe(Math.max(1, Math.floor(effective * 0.20)));
  const hpAfter = currentHp(await page.locator('#hud-hp-text').innerText()).current;
  expect(hpBefore - hpAfter).toBe(reflected);
  expect(currentHp(await page.locator('#arena-hp-enemy-text').innerText()).current).toBe(xamaBefore);

  const savedBeforeReload = await page.evaluate(() => JSON.parse(localStorage.getItem('a-ultima-lua.checkpoint')));
  expect(savedBeforeReload.schemaVersion).toBe(5);
  expect(savedBeforeReload.player.hp).toBe(hpAfter);
  await page.reload();
  await expect(page.locator('#title-screen')).toBeVisible();
  const savedAfterReload = await page.evaluate(() => JSON.parse(localStorage.getItem('a-ultima-lua.checkpoint')));
  expect(savedAfterReload.schemaVersion).toBe(5);
  expect(savedAfterReload.player.hp).toBe(hpAfter);
  expect(savedAfterReload).not.toHaveProperty('pendingVictory');
  await page.locator('#class-select button', { hasText: 'CONTINUAR' }).click();
  await expect(page.locator('#game-screen')).toBeVisible();
  await expect(page.locator('.battle-arena')).toHaveCount(0);
  expect(currentHp(await page.locator('#hud-hp-text').innerText()).current).toBe(hpAfter);
  const afterContinue = await page.evaluate(() => JSON.parse(localStorage.getItem('a-ultima-lua.checkpoint')));
  expect(afterContinue.player.hp).toBe(hpAfter);
  await assertNoClientErrors(errors);
});

test('Essência ativa armazena energia ao destruir Sangue; destruir ambos desperta Xamã com bônus armazenado', async ({ page }) => {
  const errors = [];
  await startShaman(page, errors, { level: 100, forca: 10000 });
  const xamaHpBefore = currentHp(await page.locator('#arena-hp-enemy-text').innerText()).current;
  await page.locator('.ritual-target-actions button').filter({ hasText: 'Totem de Sangue' }).click();
  await destroySelectedTotem(page, 'Totem de Sangue');

  const bloodLog = await page.locator('#battle-log').innerText();
  const bloodHits = [...bloodLog.matchAll(/Você atinge Totem de Sangue e causa (\d+) de dano efetivo\./g)].map(match => Number(match[1]));
  expect(bloodHits.length).toBeGreaterThan(0);
  const stored = Math.min(54, bloodHits.reduce((total, effective) => total + Math.floor(effective * 0.20), 0));
  expect(stored).toBeGreaterThan(0);
  await expect(page.locator('.arena-enemy-chip')).toContainText(`ESSÊNCIA ABSORVIDA ${stored}/54`);
  const destroyedBlood = page.locator('.ritual-target-actions button').filter({ hasText: 'Totem de Sangue' });
  await expect(destroyedBlood).toContainText('DESTRUÍDO');
  await expect(destroyedBlood).toBeDisabled();
  await expect(page.locator('.ritual-target-actions button').filter({ hasText: 'Totem da Essência' })).toBeVisible();
  expect(bloodLog).not.toContain('RETALIAÇÃO DO SANGUE');

  await destroySelectedTotem(page, 'Totem da Essência');
  await expect(page.locator('.battle-log')).toContainText('O RITUAL FOI ROMPIDO');
  await expect(page.locator('.battle-log')).toContainText(`+${stored} HP temporário`);
  await expect(page.locator('.ritual-target-actions')).toHaveCount(0);
  await expect(page.locator('.arena-enemy-chip')).toContainText('RITUAL ROMPIDO · combate direto');
  const xamaHpAfter = currentHp(await page.locator('#arena-hp-enemy-text').innerText()).current;
  expect(xamaHpAfter - xamaHpBefore).toBe(stored);
  await expect(page.locator('#portrait-enemy img')).toHaveAttribute('src', /orc_xama_combat\.png/);
  await page.waitForFunction(() => { const image = document.querySelector('#portrait-enemy img'); return image && image.complete && image.naturalWidth > 0; });
  await assertNoClientErrors(errors);
});

test('ação de cura não aciona retaliação nem danifica Totem da Essência', async ({ page }) => {
  const errors = [];
  await startShaman(page, errors, { level: 3, forca: 100, magia: 100, espirito: 100 });
  await page.locator('.ritual-target-actions button').filter({ hasText: 'Totem da Essência' }).click();
  await hitSelectedTotem(page);

  const beforeLog = await page.locator('#battle-log').innerText();
  const retaliationsBefore = (beforeLog.match(/RETALIAÇÃO DO SANGUE/g) || []).length;
  const hpBeforeHeal = currentHp(await page.locator('#hud-hp-text').innerText()).current;
  const essenceButton = page.locator('.ritual-target-actions button').filter({ hasText: 'Totem da Essência' });
  const essenceBefore = Number(/(\d+)\/150 HP/.exec(await essenceButton.innerText())[1]);

  const heal = page.locator('.skill-btn').filter({ hasText: 'Toque Sombrio' });
  await expect(heal).toBeEnabled();
  await heal.click();
  await expect(page.locator('#battle-log')).toContainText('Você usa');
  await expect(page.locator('#battle-log')).toContainText('recupera');
  const hpAfterHeal = currentHp(await page.locator('#hud-hp-text').innerText()).current;
  expect(hpAfterHeal).toBeGreaterThan(hpBeforeHeal);
  const afterLog = await page.locator('#battle-log').innerText();
  expect((afterLog.match(/RETALIAÇÃO DO SANGUE/g) || []).length).toBe(retaliationsBefore);
  const essenceAfter = Number(/(\d+)\/150 HP/.exec(await essenceButton.innerText())[1]);
  expect(essenceAfter).toBe(essenceBefore);
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
