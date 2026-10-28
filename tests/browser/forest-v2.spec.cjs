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
  ['Uivante das Sombras', 'uivante', 'assets/images/enemies/forest/uivante_sombras_combat_v2.png'],
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
        const paintedSpan = (image, rect) => {
          const c = document.createElement('canvas');
          c.width = image.naturalWidth; c.height = image.naturalHeight;
          const cx = c.getContext('2d', {willReadFrequently:true});
          cx.drawImage(image, 0, 0);
          const px = cx.getImageData(0, 0, c.width, c.height).data;
          let minX = c.width, maxX = -1;
          for (let y = 0; y < c.height; y += 2) {
            for (let x = 0; x < c.width; x++) {
              if (px[(y * c.width + x) * 4 + 3] > 8) { if (x < minX) minX = x; if (x > maxX) maxX = x; }
            }
          }
          if (maxX < 0) return {left: rect.right, right: rect.right};
          const aspect = c.width / c.height;
          const pw = Math.min(rect.width, rect.height * aspect);
          const insetX = (rect.width - pw) / 2;
          return {
            left: rect.left + insetX + (minX / c.width) * pw,
            right: rect.left + insetX + ((maxX + 1) / c.width) * pw
          };
        };
        const paintedPlayer = paintedSpan(mage, mage.getBoundingClientRect());
        const paintedEnemy = paintedSpan(wolf, wolf.getBoundingClientRect());
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
          paintedGap:paintedEnemy.left - paintedPlayer.right,
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
      // Sobreposição é medida pelas silhuetas pintadas (alfa), não pelas caixas com padding transparente.
      // O mini-chefe pode encostar até 4% da largura do palco na capa do Mago; os comuns, nada.
      const overlapAllowance = /Uivante/.test(wolfName) ? (result.stage.right - result.stage.left) * 0.04 : 0;
      expect(result.paintedGap, `silhuetas de ${wolfName} em ${width}px`).toBeGreaterThanOrEqual(-overlapAllowance);
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
    ['Lobisomem Feroz', 'assets/images/enemies/forest/lobisomem_feroz.jpg']
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

async function openRomarBattle(page, width) {
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
  await page.evaluate(() => { player.defeatedBosses = [0]; startRomarEncounter(); });
  await expect(page.locator('.arena-stage')).toBeVisible();
  await page.waitForFunction(() => {
    const image = document.querySelector('#portrait-enemy img');
    return image && image.complete && image.naturalWidth > 0;
  });
  return {errors, failedAssets};
}

for (const width of [320, 375, 390]) {
  test(`Romar V2: três estágios reais em ${width}px`, async ({page}) => {
    const diagnostics = await openRomarBattle(page, width);
    for (const stage of [1, 2, 3]) {
      if (stage > 1) {
        await page.evaluate(value => {
          const monster = ui.monster;
          monster.romarStage = value;
          monster.portrait = `assets/images/enemies/forest/romar_v2_estagio${value}.png`;
          monster.hp = Math.round(monster.hpMax * (value === 2 ? 0.6 : 0.3));
          render();
        }, stage);
        await page.waitForFunction(value => {
          const image = document.querySelector('#portrait-enemy img');
          return image && image.complete && image.naturalWidth > 0 && image.getAttribute('src').includes(`estagio${value}`);
        }, stage);
      }
      const result = await page.evaluate(() => {
        const stageRect = document.querySelector('.arena-stage').getBoundingClientRect();
        const player = document.querySelector('.arena-actor.actor-player').getBoundingClientRect();
        const actor = document.querySelector('.arena-actor.actor-enemy').getBoundingClientRect();
        const image = document.querySelector('#portrait-enemy img');
        const mage = document.querySelector('#portrait-player img');
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d', {willReadFrequently:true});
        context.drawImage(image, 0, 0);
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const corners = [[0,0],[canvas.width-1,0],[0,canvas.height-1],[canvas.width-1,canvas.height-1]]
          .map(([x,y]) => data[(y*canvas.width+x)*4+3]);
        const paintedSpan = (img, rect) => {
          const c = document.createElement('canvas');
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          const cx = c.getContext('2d', {willReadFrequently:true});
          cx.drawImage(img, 0, 0);
          const px = cx.getImageData(0, 0, c.width, c.height).data;
          let minX = c.width, maxX = -1;
          for (let y = 0; y < c.height; y += 2) {
            for (let x = 0; x < c.width; x++) {
              if (px[(y * c.width + x) * 4 + 3] > 8) { if (x < minX) minX = x; if (x > maxX) maxX = x; }
            }
          }
          const aspect = c.width / c.height;
          const pw = Math.min(rect.width, rect.height * aspect);
          const insetX = (rect.width - pw) / 2;
          return {
            left: rect.left + insetX + (minX / c.width) * pw,
            right: rect.left + insetX + ((maxX + 1) / c.width) * pw
          };
        };
        const paintedPlayer = paintedSpan(mage, mage.getBoundingClientRect());
        const paintedEnemy = paintedSpan(image, image.getBoundingClientRect());
        return {
          src: image.getAttribute('src'),
          fit: getComputedStyle(image).objectFit,
          position: getComputedStyle(image).objectPosition,
          portraitClass: document.querySelector('#portrait-enemy .romar-avatar') ? 'romar-avatar' : 'plain',
          cornerAlpha: corners,
          paintedGap: paintedEnemy.left - paintedPlayer.right,
          actor: {left:actor.left, right:actor.right, top:actor.top, bottom:actor.bottom},
          stage: {left:stageRect.left, right:stageRect.right, top:stageRect.top, bottom:stageRect.bottom},
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      });
      expect(result.portraitClass, 'wrapper Romar').toBe('romar-avatar');
      expect(result.src).toBe(`assets/images/enemies/forest/romar_v2_estagio${stage}.png`);
      expect(result.fit, 'natural contain').toBe('contain');
      expect(result.position, 'ancoragem inferior').toBe('50% 100%');
      expect(result.cornerAlpha, `cantos alpha do estágio ${stage}`).toEqual([0,0,0,0]);
      expect(result.paintedGap, `silhueta do estágio ${stage} em ${width}px`).toBeGreaterThanOrEqual(0);
      expect(result.actor.left).toBeGreaterThanOrEqual(result.stage.left - 1);
      expect(result.actor.right).toBeLessThanOrEqual(result.stage.right + 1);
      expect(result.actor.top).toBeGreaterThanOrEqual(result.stage.top - 1);
      expect(result.actor.bottom).toBeLessThanOrEqual(result.stage.bottom + 1);
      expect(result.overflow).toBeLessThanOrEqual(0);
      await page.waitForTimeout(700);
      await page.locator('.battle-arena').screenshot({path:`${process.env.AUL_PW_ARTIFACTS}/romar-v2-s${stage}-${width}.png`});
    }
    // Romar também reage ao golpe: o re-render da ação não pode engolir o shake.
    await page.evaluate(() => { ui.monster.hp = ui.monster.hpMax; ui.locked = false; render(); });
    await page.getByRole('button', {name:'Atacar', exact:true}).click();
    await expect(page.locator('#portrait-enemy.shake')).toHaveCount(1);
    await page.waitForTimeout(420);
    expect(diagnostics.errors).toEqual([]);
    expect(diagnostics.failedAssets).toEqual([]);
  });
}

for (const width of [320, 375, 390]) {
  test(`Lobo da Matilha ganha ator e barra próprios em ${width}px`, async ({page}) => {
    const diagnostics = await openForestBattle(page, width, 'Alfa da Matilha');
    // O Alfa revida a cada ataque ao lobo; HP alto evita que o teste termine em derrota.
    await page.evaluate(() => { player.hpMax = 5000; player.hp = 5000; render(); });
    // O combate se redesenha a cada efeito; recorte estatico evita disputar estabilidade.
    const shotArena = async file => {
      const box = await page.evaluate(() => {
        const arena = document.querySelector('.battle-arena');
        arena.scrollIntoView({block:'center'});
        const rect = arena.getBoundingClientRect();
        return {x:Math.max(0, rect.x), y:Math.max(0, rect.y), width:rect.width, height:rect.height};
      });
      await page.screenshot({path:file, clip:box, animations:'disabled'});
    };

    // Caminho real: o primeiro contra-ataque do Alfa convoca a matilha.
    await page.getByRole('button', {name:'Atacar', exact:true}).click();
    await expect(page.locator('.actor-pack-wolf')).toBeVisible();
    // Nome não fica sobre a arte; identidade segue no rótulo acessível e no botão.
    await expect(page.locator('.pack-wolf-name')).toHaveCount(0);
    await expect(page.locator('.actor-pack-wolf')).toHaveAttribute('aria-label', /Lobo da Matilha, \d+ de \d+ pontos de vida/);
    await expect(page.locator('#portrait-pack-wolf img')).toHaveAttribute('src', 'assets/images/enemies/forest/lobo_matilha_combat_v2.png');
    await page.waitForFunction(() => {
      const image = document.querySelector('#portrait-pack-wolf img');
      return image && image.complete && image.naturalWidth > 0;
    });
    await expect(page.locator('.arena-enemy-state')).toHaveText('MATILHA ATIVA · CAÇADA COORDENADA');
    await expect(page.getByRole('button', {name:'🐺 Atacar Lobo da Matilha'})).toBeEnabled();

    const metrics = await page.evaluate(() => {
      const stage = document.querySelector('.arena-stage').getBoundingClientRect();
      const actor = document.querySelector('.actor-pack-wolf').getBoundingClientRect();
      const art = document.querySelector('#portrait-pack-wolf img').getBoundingClientRect();
      const alfa = document.querySelector('.arena-stage .actor-enemy').getBoundingClientRect();
      const tag = document.querySelector('.pack-wolf-tag').getBoundingClientRect();
      return {
        actor: {left: actor.left, right: actor.right, top: actor.top, bottom: actor.bottom},
        stage: {left: stage.left, right: stage.right, top: stage.top, bottom: stage.bottom},
        alfaBottom: alfa.bottom,
        tagAboveArt: tag.bottom <= art.top + 1,
        barWidth: document.querySelector('.pack-wolf-bar i').style.width,
        hp: document.querySelector('.pack-wolf-hp').textContent,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(parseFloat(metrics.barWidth)).toBe(100);
    expect(metrics.tagAboveArt).toBe(true);
    expect(metrics.actor.bottom).toBeGreaterThan(metrics.stage.bottom - 2); // de pé no chão
    expect(metrics.actor.left).toBeGreaterThanOrEqual(metrics.stage.left - 1);
    expect(metrics.actor.right).toBeLessThanOrEqual(metrics.stage.right + 1);
    expect(metrics.actor.top).toBeGreaterThanOrEqual(metrics.stage.top - 1);
    expect(metrics.overflow).toBeLessThanOrEqual(0);
    await page.waitForFunction(() => !ui.locked);
    await page.waitForTimeout(350);
    await shotArena(`${process.env.AUL_PW_ARTIFACTS}/matilha-${width}-invocada.png`);

    // Ferir o lobo: barra e texto andam juntos, e o ator reage ao golpe.
    await page.getByRole('button', {name:'🐺 Atacar Lobo da Matilha'}).click();
    await expect(page.locator('#portrait-pack-wolf.shake')).toHaveCount(1);
    await expect(page.locator('.pack-wolf-hp')).not.toHaveText(metrics.hp);
    const afterHit = await page.evaluate(() => ({
      bar: document.querySelector('.pack-wolf-bar i').style.width,
      hp: document.querySelector('.pack-wolf-hp').textContent,
      sum: document.querySelector('.arena-enemy-state').textContent,
    }));
    expect(parseFloat(afterHit.bar)).toBeLessThan(100);
    expect(afterHit.hp).not.toBe(metrics.hp);
    await page.waitForFunction(() => !ui.locked);
    await page.waitForTimeout(350);
    await shotArena(`${process.env.AUL_PW_ARTIFACTS}/matilha-${width}-ferida.png`);

    // Abater: o ator e o botão somem, mas o Alfa continua.
    await page.evaluate(() => { ui.monster.packWolfHp = 1; ui.locked = false; render(); });
    await page.getByRole('button', {name:'🐺 Atacar Lobo da Matilha'}).click();
    await expect(page.locator('.actor-pack-wolf')).toHaveCount(0);
    await expect(page.getByRole('button', {name:'🐺 Atacar Lobo da Matilha'})).toHaveCount(0);
    await expect(page.locator('.actor-enemy')).toBeVisible();
    expect(diagnostics.errors).toEqual([]);
    expect(diagnostics.failedAssets).toEqual([]);
  });
}

for (const width of [320, 375, 390]) {
  test(`Alfa da Matilha V2: enquadramento real em ${width}px`, async ({page}) => {
    const diagnostics = await openForestBattle(page, width, 'Alfa da Matilha');
    await page.waitForFunction(() => [...document.querySelectorAll('.arena-actor img')].every(image => image.complete && image.naturalWidth > 0));
    const result = await page.evaluate(() => {
      const stage = document.querySelector('.arena-stage').getBoundingClientRect();
      const enemy = document.querySelector('.arena-actor.actor-enemy').getBoundingClientRect();
      const img = document.querySelector('#portrait-enemy img');
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const context = canvas.getContext('2d', {willReadFrequently:true});
      context.drawImage(img, 0, 0);
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const cornerAlpha = [[0,0],[canvas.width-1,0],[0,canvas.height-1],[canvas.width-1,canvas.height-1]].map(([x,y]) => data[(y*canvas.width+x)*4+3]);
      return {
        src: img.getAttribute('src'),
        naturalClass: document.querySelector('#portrait-enemy').classList.contains('portrait-natural'),
        cornerAlpha,
        insideStage: enemy.left >= stage.left - 1 && enemy.right <= stage.right + 1 && enemy.top >= stage.top - 1 && enemy.bottom <= stage.bottom + 1,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(result.src).toBe('assets/images/enemies/forest/alfa_matilha_combat_v2.png');
    expect(result.naturalClass).toBe(true);
    expect(result.insideStage).toBe(true);
    expect(result.overflow).toBeLessThanOrEqual(0);
    expect(diagnostics.errors).toEqual([]);
    expect(diagnostics.failedAssets).toEqual([]);
  });
}
