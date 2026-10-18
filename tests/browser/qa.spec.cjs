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

async function setQaStats(page, { level, forca = 0, magia = 0, espirito = 0, vitalidade = 0 }) {
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
  await page.locator('#qa-vitalidade').fill(String(vitalidade));
  await page.locator('#qa-defesa').fill('0');
  await expect(page.locator('#qa-level')).toHaveValue(String(level));
  await expect(page.locator('#qa-forca')).toHaveValue(String(forca));
  await expect(page.locator('#qa-vitalidade')).toHaveValue(String(vitalidade));
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

async function startGorthak(page, errors, stats = { level: 1, forca: 500, vitalidade: 10000 }) {
  await openQa(page, errors);
  await createCharacter(page, 'mago');
  await setQaStats(page, stats);
  await page.locator('#qa-restore').click();
  await page.locator('#qa-map').selectOption('2');
  const gorthakOption = page.locator('#qa-enemy option').filter({ hasText: 'Warlord Gorthak' });
  await expect(gorthakOption).toHaveCount(1);
  await page.locator('#qa-enemy').selectOption(await gorthakOption.getAttribute('value'));
  await page.locator('#qa-battle').click();
  await expect(page.locator('.battle-arena.arena-battlefield')).toBeVisible();
  await expect(page.locator('.combatant-enemy h4')).toContainText('Warlord Gorthak');
  await expect(page.locator('.arena-enemy-chip')).toContainText('COMANDANTE');
  await page.waitForFunction(() => {
    const image = document.querySelector('#portrait-enemy img');
    return image && image.complete && image.naturalWidth > 0;
  }, null, { timeout: 20_000 });
}

async function gorthakAttack(page) {
  await (await attackButton(page)).click();
  await expect(await attackButton(page)).toBeEnabled({ timeout: 10_000 });
}

async function hpRatio(page) {
  const hp = currentHp(await page.locator('#arena-hp-enemy-text').innerText());
  return { ...hp, ratio: hp.current / hp.max };
}

test('Gorthak percorre Comandante, Fúria de Guerra e Último Avanço sem estados acumulados', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = [];
  await startGorthak(page, errors);
  await page.locator('#game-screen').screenshot({ path: `${process.env.AUL_PW_ARTIFACTS}/gorthak-comandante.png` });
  expect((await hpRatio(page)).ratio).toBeGreaterThan(0.65);

  // Fase I: dois contra-ataques normais, preparação inofensiva, depois resolução.
  for (let turn = 0; turn < 2; turn++) {
    await gorthakAttack(page);
    await expect(page.locator('.arena-enemy-chip')).toContainText('COMANDANTE');
    expect(await page.locator('.status-card[role="status"] h3').allInnerTexts()).not.toContain('GOLPE DEMOLIDOR');
  }
  const hpBeforeTelegraph = currentHp(await page.locator('#arena-hp-player-text').innerText()).current;
  await gorthakAttack(page);
  await expect(page.locator('.arena-enemy-chip')).toContainText('GOLPE DEMOLIDOR · PREPARANDO');
  await expect(page.locator('.status-card[role="status"] h3')).toContainText('GOLPE DEMOLIDOR');
  expect(currentHp(await page.locator('#arena-hp-player-text').innerText()).current).toBe(hpBeforeTelegraph);
  await gorthakAttack(page);
  const commanderResolution = await page.locator('#battle-log').innerText();
  expect(commanderResolution).toMatch(/GOLPE DEMOLIDOR! Warlord Gorthak causa \d+ de dano em você\.|Você esquiva do ataque de Warlord Gorthak/);
  await expect(page.locator('.arena-enemy-chip')).not.toContainText('PREPARANDO');

  // Thresholds are checked against current HP rendered by the game, not assumed HP.
  let phase = await page.locator('.arena-enemy-chip').innerText();
  for (let turn = 0; !phase.includes('FÚRIA DE GUERRA') && turn < 30; turn++) {
    await gorthakAttack(page);
    phase = await page.locator('.arena-enemy-chip').innerText();
    if (phase.includes('ÚLTIMO AVANÇO')) break;
  }
  await expect(page.locator('.arena-enemy-chip')).toContainText('FÚRIA DE GUERRA');
  const phaseTwoHp = await hpRatio(page);
  expect(phaseTwoHp.ratio).toBeLessThanOrEqual(0.65);
  expect(phaseTwoHp.ratio).toBeGreaterThan(0.30);
  await page.locator('#game-screen').screenshot({ path: `${process.env.AUL_PW_ARTIFACTS}/gorthak-furia-de-guerra.png` });
  const phaseTwoLog = await page.locator('#battle-log').innerText();
  expect(phaseTwoLog.match(/FÚRIA DE GUERRA/g) || []).toHaveLength(1);

  // Fase II: o golpe pesado é anunciado no registro; o Demolidor também telegrapha
  // uma ação sem dano antes da resolução, como descrito pela implementação real.
  let log = await page.locator('#battle-log').innerText();
  for (let turn = 0; !log.includes('GOLPE PESADO!') && turn < 4; turn++) {
    await gorthakAttack(page);
    log = await page.locator('#battle-log').innerText();
    if ((await page.locator('.arena-enemy-chip').innerText()).includes('ÚLTIMO AVANÇO')) break;
  }
  expect(log).toMatch(/GOLPE PESADO! Warlord Gorthak causa \d+ de dano em você\.|Você esquiva do ataque de Warlord Gorthak/);
  const hpBeforePhaseTwoTelegraph = currentHp(await page.locator('#arena-hp-player-text').innerText()).current;
  let prepared = (await page.locator('.arena-enemy-chip').innerText()).includes('PREPARANDO');
  for (let turn = 0; !prepared && turn < 4; turn++) {
    await gorthakAttack(page);
    prepared = (await page.locator('.arena-enemy-chip').innerText()).includes('PREPARANDO');
    if ((await page.locator('.arena-enemy-chip').innerText()).includes('ÚLTIMO AVANÇO')) break;
  }
  expect(prepared, await page.locator('#battle-log').innerText()).toBe(true);
  expect(currentHp(await page.locator('#arena-hp-player-text').innerText()).current).toBe(hpBeforePhaseTwoTelegraph);
  await gorthakAttack(page);
  log = await page.locator('#battle-log').innerText();
  expect(log).toMatch(/GOLPE DEMOLIDOR! Warlord Gorthak causa \d+ de dano em você\.|Você esquiva do ataque de Warlord Gorthak/);

  phase = await page.locator('.arena-enemy-chip').innerText();
  for (let turn = 0; !phase.includes('ÚLTIMO AVANÇO') && turn < 30; turn++) {
    await gorthakAttack(page);
    phase = await page.locator('.arena-enemy-chip').innerText();
  }
  await expect(page.locator('.arena-enemy-chip')).toContainText('ÚLTIMO AVANÇO · ATQ +25% · DEF −30%');
  const phaseThreeHp = await hpRatio(page);
  expect(phaseThreeHp.ratio).toBeLessThanOrEqual(0.30);
  await page.locator('#game-screen').screenshot({ path: `${process.env.AUL_PW_ARTIFACTS}/gorthak-ultimo-avanco.png` });
  const finalLog = await page.locator('#battle-log').innerText();
  expect(finalLog.match(/ÚLTIMO AVANÇO Ferido e encurralado/g) || []).toHaveLength(1);
  expect(finalLog.match(/FÚRIA DE GUERRA Gorthak abandona a disciplina/g) || []).toHaveLength(1);
  await expect(page.locator('.status-card[role="status"] h3')).toHaveCount(0);
  await expect(page.locator('.arena-enemy-chip')).not.toContainText('PREPARANDO');

  await gorthakAttack(page);
  log = await page.locator('#battle-log').innerText();
  expect(log).toMatch(/Último Avanço! Warlord Gorthak causa \d+ de dano em você\.|Você esquiva do ataque de Warlord Gorthak/);
  await assertNoClientErrors(errors);
});

test('reload durante Gorthak preserva apenas os recursos do checkpoint, sem restaurar combate', async ({ page }) => {
  const errors = [];
  await startGorthak(page, errors, { level: 1, forca: 0, vitalidade: 100 });
  await gorthakAttack(page);
  const checkpointDuringFight = await page.evaluate(() => JSON.parse(localStorage.getItem('a-ultima-lua.checkpoint')));
  expect(checkpointDuringFight.schemaVersion).toBe(5);
  const savedHp = checkpointDuringFight.player.hp;
  await page.reload();
  await expect(page.locator('#title-screen')).toBeVisible();
  await page.locator('#class-select button', { hasText: 'CONTINUAR' }).click();
  await expect(page.locator('#game-screen')).toBeVisible();
  await expect(page.locator('.battle-arena')).toHaveCount(0);
  expect(currentHp(await page.locator('#hud-hp-text').innerText()).current).toBe(savedHp);
  const resumed = await page.evaluate(() => JSON.parse(localStorage.getItem('a-ultima-lua.checkpoint')));
  expect(resumed.player.hp).toBe(savedHp);
  expect(resumed).not.toHaveProperty('pendingVictory');
  await assertNoClientErrors(errors);
});

test('vitória pendente de Gorthak sobrevive ao reload e confirma recompensas uma única vez', async ({ page }) => {
  const errors = [];
  await startGorthak(page, errors, { level: 100, forca: 10000, vitalidade: 10000 });
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('a-ultima-lua.checkpoint')));
  const savedXpBefore = before.player.totalXp;
  const savedCoinsBefore = before.player.coins;

  // A vitória é obtida por ataques reais do jogador no combate, não por mutação
  // de estado: os atributos elevados são aplicados pelo painel QA descartável.
  for (let turn = 0; turn < 3; turn++) {
    const action = page.locator('.battle-actions button.action-btn').filter({ hasText: /^Atacar$/ });
    if (!await action.count()) break;
    await expect(action).toBeEnabled({ timeout: 10_000 });
    await action.click();
    await page.waitForFunction(() => {
      const checkpoint = JSON.parse(localStorage.getItem('a-ultima-lua.checkpoint') || 'null');
      const attack = [...document.querySelectorAll('.battle-actions button.action-btn')].find(button => button.textContent.trim() === 'Atacar');
      return Boolean(checkpoint?.pendingVictory) || Boolean(attack && !attack.disabled);
    }, null, { timeout: 10_000 });
    const afterTurn = await page.evaluate(() => JSON.parse(localStorage.getItem('a-ultima-lua.checkpoint')));
    if (afterTurn.pendingVictory) break;
  }
  const pending = await page.evaluate(() => JSON.parse(localStorage.getItem('a-ultima-lua.checkpoint')));
  expect(pending).toHaveProperty('pendingVictory');
  expect(pending.schemaVersion).toBe(5);
  expect(pending.player.totalXp).toBeGreaterThan(savedXpBefore);
  expect(pending.player.coins).toBeGreaterThan(savedCoinsBefore);
  const rewardedXp = pending.player.totalXp;
  const rewardedCoins = pending.player.coins;

  await page.reload();
  await expect(page.locator('#title-screen')).toBeVisible();
  await page.locator('#class-select button', { hasText: 'CONTINUAR' }).click();
  await expect(page.locator('.notif-card.interactive-card .notif-continue')).toBeVisible();
  const reloadedPending = await page.evaluate(() => JSON.parse(localStorage.getItem('a-ultima-lua.checkpoint')));
  expect(reloadedPending.pendingVictory).toEqual(pending.pendingVictory);
  expect(reloadedPending.player.totalXp).toBe(rewardedXp);
  expect(reloadedPending.player.coins).toBe(rewardedCoins);

  await page.locator('.notif-card.interactive-card .notif-continue').click();
  await expect(page.locator('.notif-card.interactive-card')).toHaveCount(0);
  const settled = await page.evaluate(() => JSON.parse(localStorage.getItem('a-ultima-lua.checkpoint')));
  expect(settled).not.toHaveProperty('pendingVictory');
  expect(settled.player.totalXp).toBe(rewardedXp);
  expect(settled.player.coins).toBe(rewardedCoins);
  await page.reload();
  await expect(page.locator('#title-screen')).toBeVisible();
  await page.locator('#class-select button', { hasText: 'CONTINUAR' }).click();
  await expect(page.locator('.notif-card.interactive-card')).toHaveCount(0);
  const afterSecondReload = await page.evaluate(() => JSON.parse(localStorage.getItem('a-ultima-lua.checkpoint')));
  expect(afterSecondReload.player.totalXp).toBe(rewardedXp);
  expect(afterSecondReload.player.coins).toBe(rewardedCoins);
  expect(afterSecondReload).not.toHaveProperty('pendingVictory');
  await assertNoClientErrors(errors);
});


test('Xamã V2: orientação, corpo inteiro e pé ancorado antes/depois do despertar em larguras mobile e desktop', async ({ page }) => {
  const errors=[];
  await page.addInitScript(()=>{window.__shamanReactions=[];document.addEventListener('DOMContentLoaded',()=>new MutationObserver(records=>{for(const r of records)if(r.target.id==='portrait-enemy'&&r.target.dataset.reaction)window.__shamanReactions.push(r.target.dataset.reaction);}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['data-reaction']}));});
  await startShaman(page,errors,{level:100,forca:10000,vitalidade:10000});
  await expect(page.locator('#portrait-enemy')).not.toHaveClass(/shaman-reaction-surface/);
  await expect(page.locator('#portrait-enemy img')).toHaveAttribute('src',/orc_xama_transe\.png/);
  await page.locator('#game-screen').screenshot({path:process.env.AUL_PW_ARTIFACTS+'/orc-xama-v2-antes-despertar-390.png'});
  await destroySelectedTotem(page,'Totem de Sangue');
  await destroySelectedTotem(page,'Totem da Essência');
  await expect(page.locator('.ritual-target-actions')).toHaveCount(0);
  await expect(page.locator('#portrait-enemy img')).toHaveAttribute('src',/orc_xama_combat\.png/);
  await expect(page.locator('#portrait-enemy')).toHaveClass(/shaman-reaction-surface/);
  await page.waitForFunction(()=>{const i=document.querySelector('#portrait-enemy img');return i?.complete&&i.naturalWidth===1024&&i.naturalHeight===1536;});
  for(const width of [320,375,390,1366]){
    await page.setViewportSize({width,height:width>1000?768:844});
    const frame=await page.locator('.arena-actor[data-actor="orc_xama"]').evaluate(actor=>{const stage=actor.closest('.arena-stage').getBoundingClientRect(),r=actor.getBoundingClientRect(),img=actor.querySelector('img'),style=getComputedStyle(img),matrix=new DOMMatrix(style.transform);return{width:innerWidth,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,fit:style.objectFit,position:style.objectPosition,scaleX:matrix.a,scaleY:matrix.d,boxWidthRatio:r.width/stage.width,boxHeightRatio:r.height/stage.height,centerError:r.x+r.width/2-stage.x-stage.width*.72,groundError:r.bottom-stage.bottom,overflow:document.documentElement.scrollWidth-innerWidth};});
    expect(frame.naturalWidth).toBe(1024);expect(frame.naturalHeight).toBe(1536);expect(frame.fit).toBe('contain');expect(frame.position).toBe('50% 100%');expect(frame.scaleX).toBe(-1);expect(frame.scaleY).toBe(1);expect(frame.boxWidthRatio).toBeCloseTo(.44,3);expect(frame.boxHeightRatio).toBeCloseTo(.70,3);expect(Math.abs(frame.centerError)).toBeLessThan(1);expect(Math.abs(frame.groundError)).toBeLessThan(1);expect(frame.overflow).toBeLessThanOrEqual(1);
    await page.locator('#game-screen').screenshot({path:process.env.AUL_PW_ARTIFACTS+'/orc-xama-v2-desperto-'+width+'.png'});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>EnemyCombatVisual.hit(ui.monster,true));
  expect(await page.locator('#portrait-enemy').getAttribute('data-reaction-static')).toBe('true');
  expect(await page.locator('#portrait-enemy').evaluate(e=>e.getAnimations().length)).toBe(0);
  expect(errors).toEqual([]);
});

test('Xamã V2: ataques reais acionam dano e crítico após o despertar, sem resíduos ao sair',async({page})=>{
  test.setTimeout(120000);const errors=[];
  await page.addInitScript(()=>{window.__shamanReactions=[];document.addEventListener('DOMContentLoaded',()=>new MutationObserver(records=>{for(const r of records)if(r.target.id==='portrait-enemy'&&r.target.dataset.reaction)window.__shamanReactions.push(r.target.dataset.reaction);}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['data-reaction']}));});
  await startShaman(page,errors,{level:3,forca:10,vitalidade:10000});
  await destroySelectedTotem(page,'Totem de Sangue');await destroySelectedTotem(page,'Totem da Essência');
  await expect(page.locator('.shaman-reaction-surface')).toBeVisible();
  for(let n=0;n<60;n++){
    await attackButton(page).then(b=>b.click());
    await page.waitForFunction(()=>{const b=[...document.querySelectorAll('.battle-actions button.action-btn')].find(x=>x.textContent.trim()==='Atacar');return !b||!b.disabled||document.querySelector('.notif-card.interactive-card');},null,{timeout:10000});
    const seen=await page.evaluate(()=>window.__shamanReactions||[]);
    if(seen.includes('damage')&&seen.includes('critical'))break;
    if(await page.locator('.battle-arena').count()===0)break;
  }
  const seen=await page.evaluate(()=>window.__shamanReactions||[]);expect(seen).toContain('damage');expect(seen).toContain('critical');
  await expect(page.locator('#portrait-enemy')).not.toHaveAttribute('data-reaction',/./);
  expect(await page.locator('#portrait-enemy').evaluate(e=>getComputedStyle(e).transform)).toBe('none');
  await page.evaluate(()=>{EnemyCombatVisual.hit(ui.monster,true);window.__oldShaman=document.getElementById('portrait-enemy');});
  await page.locator('.tab-btn[data-tab="mapa"]').click();
  expect(await page.evaluate(()=>window.__oldShaman.getAnimations().length)).toBe(0);
  await expect(page.locator('.shaman-impact-glow')).toHaveCount(0);
  expect(errors).toEqual([]);
});
