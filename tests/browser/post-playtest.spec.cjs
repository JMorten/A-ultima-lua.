
const {test,expect}=require('playwright/test');
const path=require('node:path');
async function fresh(page){
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:4179/')&&r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
 await page.goto('/');await page.getByRole('button',{name:'Escolher Mago',exact:true}).click();
 return errors;
}
async function battle(page,id='orc_guerreiro',level=7){
 // Legitimate disposable fixture; outcomes still use the actual game rules.
 await page.evaluate(({id,level})=>{
  player.totalXp=totalXpForLevel(level);recomputeLevelFromXp();recomputeStats();player.hp=player.hpMax;player.mp=player.mpMax;requestCheckpoint();
  const map=2,m=MAPS[map].monsters.find(x=>x.id===id)||MAPS[map].miniBoss;startBattle(map,m,false);
 },{id,level});
 await page.waitForFunction(()=>[...document.querySelectorAll('.battle-arena img')].every(i=>i.complete&&i.naturalWidth>0));
}
for(const [width,height] of [[320,568],[375,667],[390,664],[390,844],[1366,768]]){
 test('Post-playtest: palco e comandos visíveis '+width+'x'+height,async({page})=>{
  await page.setViewportSize({width,height});const errors=await fresh(page);await battle(page);
  const boxes=await page.evaluate(()=>{
   const rect=e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
   return {stage:rect(document.querySelector('.arena-stage')),skills:[...document.querySelectorAll('.skill-btn')].map(rect),attack:rect(document.querySelector('.battle-actions button')),overflow:document.documentElement.scrollWidth>innerWidth,scroll:document.getElementById('content').scrollTop};
  });
  expect(boxes.overflow).toBe(false);expect(boxes.stage.top).toBeGreaterThanOrEqual(0);
  for(const b of [boxes.attack,...boxes.skills]){expect(b.height).toBeGreaterThanOrEqual(44);if(width<=700)expect(b.bottom).toBeLessThanOrEqual(height);}
  expect(boxes.scroll).toBe(0);expect(errors).toEqual([]);
  await page.waitForTimeout(650);await page.screenshot({path:path.join(process.env.AUL_PW_ARTIFACTS,'post-playtest-'+width+'x'+height+'.png')});
 });
}
test('Post-playtest: derrota real informa pontos e CONTINUAR retorna ao mapa com save reconciliado',async({page})=>{
 const errors=await fresh(page);await page.evaluate(()=>{player.totalXp=totalXpForLevel(5);recomputeLevelFromXp();ui.pendingAlloc.vitalidade=20;confirmAlloc();player.hp=1;requestCheckpoint();startBattle(1,MAPS[1].monsters[0],false);});
 for(let i=0;i<10&&!await page.locator('.notif-card.interactive-card').count();i++){
  const attack=page.getByRole('button',{name:'Atacar',exact:true});await attack.click();
  await page.waitForFunction(()=>!ui.inBattle||!ui.locked);
 }
 const card=page.locator('.notif-card.interactive-card');await expect(card).toContainText('pontos de atributos removidos');await expect(card).toContainText('Nível 5 →');
 await card.getByRole('button',{name:'CONTINUAR'}).click();expect(await page.evaluate(()=>ui.tab)).toBe('mapa');
 const snapshot=await page.evaluate(()=>({xp:player.totalXp,allocated:player.allocated,level:player.level}));
 await page.reload();await page.locator('#class-select').getByRole('button',{name:'CONTINUAR',exact:true}).click();
 expect(await page.evaluate(()=>({xp:player.totalXp,allocated:player.allocated,level:player.level}))).toEqual(snapshot);expect(errors).toEqual([]);
 await page.locator('[data-tab="status"]').click();await expect(page.locator('#content')).toContainText('35%');
});
test('Post-playtest: primeira pista Romar resiste a reload e CONTINUAR abre a batalha comum',async({page})=>{
 const errors=await fresh(page);await page.evaluate(()=>{player.defeatedBosses=[0];requestCheckpoint();startBattle(0,MAPS[0].monsters[0],false);});
 await expect(page.locator('.romar-discovery')).toBeVisible();const title=await page.locator('.romar-discovery h2').textContent();
 await page.reload();await page.locator('#class-select').getByRole('button',{name:'CONTINUAR',exact:true}).click();await expect(page.locator('.romar-discovery h2')).toHaveText(title);
 await page.locator('.romar-discovery').getByRole('button',{name:'CONTINUAR'}).click();await expect(page.locator('.battle-arena')).toBeVisible();
 await page.getByRole('button',{name:'Fugir',exact:true}).click();expect(await page.evaluate(()=>ui.tab)).toBe('mapa');
 await page.evaluate(()=>startBattle(0,MAPS[0].monsters[0],false));await expect(page.locator('.romar-discovery')).toHaveCount(0);expect(errors).toEqual([]);
});
test('Post-playtest: vitória real mantém recompensa ao confirmar e recarregar',async({page})=>{
 const errors=await fresh(page);await page.evaluate(()=>{player.totalXp=totalXpForLevel(7);recomputeLevelFromXp();recomputeStats();player.hp=player.hpMax;requestCheckpoint();startBattle(0,MAPS[0].monsters[0],false);});
 for(let i=0;i<15&&!await page.locator('.notif-card.interactive-card').count();i++){
  await page.getByRole('button',{name:'Atacar',exact:true}).click();await page.waitForFunction(()=>!ui.inBattle||!ui.locked);
 }
 await expect(page.locator('.notif-card.interactive-card')).toContainText('VITÓRIA');const coins=await page.evaluate(()=>player.coins);
 await page.reload();await page.locator('#class-select').getByRole('button',{name:'CONTINUAR',exact:true}).click();
 await page.locator('.notif-card.interactive-card').getByRole('button',{name:'CONTINUAR'}).click();expect(await page.evaluate(()=>ui.tab)).toBe('mapa');expect(await page.evaluate(()=>player.coins)).toBe(coins);
 expect(errors).toEqual([]);
});

for(const height of [568,664])test('Post-playtest: palco fixo com ritual, MP insuficiente e comandos em '+height,async({page})=>{
 await page.setViewportSize({width:320,height});const errors=await fresh(page);await battle(page,'orc_xama',21);
 await page.evaluate(()=>{player.mp=0;render();});
 await expect(page.locator('.skill-btn').first()).toContainText('MP insuficiente');
 await page.locator('.battle-arena').evaluate(e=>Promise.all(e.getAnimations().map(a=>a.finished.catch(()=>{}))));
 const stage=await page.locator('.arena-stage').boundingBox();const controls=page.locator('.combat-controls');
 await controls.evaluate(e=>{e.scrollTop=e.scrollHeight;});
 const after=await page.locator('.arena-stage').boundingBox();expect(after.y).toBe(stage.y);expect(after.y+after.height).toBeLessThan(height);
 const panel=await controls.boundingBox();expect(panel.height).toBeGreaterThanOrEqual(88);expect(panel.y+panel.height).toBeLessThanOrEqual(height);
 expect(await page.evaluate(()=>document.getElementById('content').scrollTop)).toBe(0);
 for(const button of await page.locator('.skill-btn').all())expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
 await page.waitForTimeout(650);await page.screenshot({path:path.join(process.env.AUL_PW_ARTIFACTS,'post-playtest-ritual-'+height+'.png')});expect(errors).toEqual([]);
});
