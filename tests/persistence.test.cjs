const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),{test}=require('node:test');
const root=path.join(__dirname,'..'),gameCode=fs.readFileSync(path.join(root,'src/game.js'),'utf8'),saveCode=fs.readFileSync(path.join(root,'src/persistence.js'),'utf8');
function boot(storage=new Map()){
 const cards=[],elements=new Map(),listeners={},timers=[];
 function element(){
  const events={},children={};
  return {style:{},dataset:{},innerHTML:'',classList:{add(){},remove(){}},isConnected:false,
   addEventListener(type,fn){events[type]=fn},
   insertAdjacentHTML(where,html){this.innerHTML+=html},
   appendChild(child){child.isConnected=true;cards.push(child)},
   remove(){this.isConnected=false;const i=cards.indexOf(this);if(i>=0)cards.splice(i,1)},
   querySelector(sel){if(!children[sel]){children[sel]=element();children[sel].parent=this;}return children[sel]},
   closest(){return this.parent||null},
   click(){if(events.click)events.click();if(listeners.click)listeners.click({target:this})}
  };
 }
 const document={
  getElementById(id){if(id==='forest-event-card'||id==='forest-event-result')return cards.find(x=>x.id===id)||null;if(!elements.has(id))elements.set(id,element());return elements.get(id)},
  querySelectorAll(sel){return sel==='.interactive-card'?cards.filter(x=>(x.className||'').includes('interactive-card')):[]},
  createElement:element,addEventListener(type,fn){listeners[type]=fn}
 };
 const localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
 const context=vm.createContext({console,Date,Math:Object.create(Math),document,localStorage,setTimeout(fn){timers.push(fn)},clearTimeout(){},setInterval(){}});
 vm.runInContext(gameCode,context);
 vm.runInContext('render=()=>{};showToast=()=>{};floatNumber=()=>{};shakeSide=()=>{};Math.random=()=>0.99;isMonsterEventActive=()=>false;isXpEventActive=()=>false;',context);
 vm.runInContext(saveCode,context);
 const run=s=>vm.runInContext(s,context);
 return {run,storage,document,tick(){const fn=timers.shift();if(fn)fn();},close(){for(const card of [...cards])card.querySelector(card.id==='forest-event-result'?'button':'.notif-continue').click();}};
}
function fresh(){const env=boot();env.run('chooseClass("cavaleiro")');return env;}
test('absent/corrupt/unsupported saves do not crash startup or delete stored bytes',()=>{
 for(const raw of [null,'{broken','{"schemaVersion":99}',JSON.stringify({schemaVersion:1,player:{}})]){
  const storage=new Map();if(raw!==null)storage.set('a-ultima-lua.checkpoint',raw);
  const e=boot(storage);assert.equal(e.run('player'),null);assert.equal(e.run('readCheckpoint()'),null);
  assert.equal(storage.get('a-ultima-lua.checkpoint'),raw===null?undefined:raw);
 }
});
test('round trip preserves full player, exact affixes, legacy ring and future containers',()=>{
 const e=fresh();
 e.run('player.level=7;player.totalXp=totalXpForLevel(7);player.statPoints=30;recomputeStats();player.defeatedBosses=[0];player.forestProgress={commonKills:45,miniBossKills:3,miniBossDefeated:true,discoveries:3};player.romarDiscoveries={seen:["runa","massacre","marcas"],pending:null,cooldown:1,clueAttempts:4,encounterAttempts:2};player.romar_first_choice="attacked";player.questItems={fragmento_ferro_runico:{questClue:true}};player.equipment.accessory={uid:"it77",slot:"accessory",name:"Anel legado",rarity:"épico",atk:7,def:3,value:30,statReq:{defesa:2},affixes:[{key:"crit",label:"Crítico",value:0.05324678123}]};requestCheckpoint()');
 const expected=JSON.stringify(JSON.parse(e.run('JSON.stringify(readCheckpoint().player)')));
 const loaded=boot(e.storage);assert.equal(loaded.run('continueSavedGame()'),true);
 assert.equal(loaded.run('JSON.stringify(player)'),expected);
 assert.equal(loaded.run('ui.inBattle'),false);assert.equal(loaded.run('ui.mapIndex'),null);
 assert.equal(loaded.run('ui.itemSeq'),78);
 const uid=loaded.run('generateItem(0,0,false).uid');assert.equal(uid,'it78');
});
test('normalization and schema 0 migration are idempotent without duplicating items',()=>{
 const e=fresh();
 e.run('var old=readCheckpoint();old.schemaVersion=0;delete old.player.materials;delete old.player.knownRecipes;delete old.itemSeq');
 const one=e.run('JSON.stringify(normalizeCheckpoint(old))');
 const two=e.run('JSON.stringify(normalizeCheckpoint(normalizeCheckpoint(old)))');
 assert.equal(two,one);
});
test('full checkpoint refuses unsafe arbitrary mutations; only explicit resource hooks persist combat',()=>{
 const e=fresh();const safe=e.storage.get('a-ultima-lua.checkpoint');
 e.run('startBattle(0,MAPS[0].monsters[0],false);player.hp=1;player.consumables.hp=0;player.coins+=99');
 assert.equal(e.run('requestCheckpoint()'),false);
 assert.equal(e.storage.get('a-ultima-lua.checkpoint'),safe);
 const loaded=boot(e.storage);loaded.run('continueSavedGame()');
 assert.notEqual(loaded.run('player.hp'),1);assert.equal(loaded.run('player.coins'),25);
 assert.equal(loaded.run('ui.monster'),null);
});
test('victory persists exactly once after CONTINUAR, never rewards twice on reload',()=>{
 const e=fresh();e.run('startBattle(0,MAPS[0].monsters[0],false);handleVictory(ui.monster)');
 assert.equal(e.run('readCheckpoint().player.forestProgress.commonKills'),0);
 const earned=e.run('player.coins');e.close();
 assert.equal(e.run('readCheckpoint().player.forestProgress.commonKills'),1);
 const loaded=boot(e.storage);loaded.run('continueSavedGame()');assert.equal(loaded.run('player.coins'),earned);
 assert.equal(loaded.run('player.forestProgress.commonKills'),1);
 loaded.run('requestCheckpoint()');assert.equal(loaded.run('readCheckpoint().player.coins'),earned);
});
test('trap and normal event persist only after their final confirmation',()=>{
 const e=fresh();e.run('Math.random=()=>0;explorarMapa(0)');
 assert.equal(e.run('readCheckpoint().player.hp'),e.run('player.hpMax'));
 const damaged=e.run('player.hp');e.close();assert.equal(e.run('readCheckpoint().player.hp'),damaged);
 e.run('showForestEvent()');assert.equal(e.run('requestCheckpoint()'),false);
 e.run('resolveForestEvent(false)');assert.equal(e.run('requestCheckpoint()'),false);
 e.close();assert.equal(e.run('requestCheckpoint()'),true);
});
test('Romar discoveries and final choices checkpoint on completion only',()=>{
 const e=fresh();e.run('player.defeatedBosses=[0];requestCheckpoint();discoverRomarClue()');
 assert.equal(e.run('requestCheckpoint()'),false);
 assert.equal(e.run('readCheckpoint().player.romarDiscoveries'),undefined);
 e.run('finishRomarDiscovery()');assert.equal(e.run('readCheckpoint().player.romarDiscoveries.seen.length'),1);
 e.run('startRomarEncounter();resolvePlayerHit(99999,false);chooseRomarFirst("attacked")');
 assert.equal(e.run('readCheckpoint().player.romar_first_choice'),undefined);
 e.run('continueRomarResult()');assert.equal(e.run('readCheckpoint().player.romar_first_choice'),'attacked');
 const loaded=boot(e.storage);loaded.run('continueSavedGame()');
 assert.equal(loaded.run('Object.keys(player.questItems).length'),1);
});
test('NEW GAME requires confirmation and preserves old save until class chosen',()=>{
 const e=fresh();const original=e.storage.get('a-ultima-lua.checkpoint');
 const menu=boot(e.storage);assert.ok(menu.document.getElementById('class-select').innerHTML.includes('CONTINUAR'));
 menu.run('chooseClass("mago")');assert.equal(menu.run('player'),null);
 menu.run('requestNewGame()');assert.equal(menu.storage.get('a-ultima-lua.checkpoint'),original);
 menu.run('cancelNewGame();chooseClass("mago")');assert.equal(menu.run('player'),null);
 menu.run('requestNewGame();confirmNewGame()');assert.equal(menu.storage.get('a-ultima-lua.checkpoint'),original);
 menu.run('chooseClass("mago")');assert.equal(menu.run('readCheckpoint().player.classKey'),'mago');
});
test('confirmed allocation, commerce and equipment request save; renders do not',()=>{
 const e=fresh();e.run('player.statPoints=5;requestCheckpoint();ui.pendingAlloc.defesa=5;render()');
 assert.equal(e.run('readCheckpoint().player.allocated.defesa'),0);
 e.run('confirmAlloc()');assert.equal(e.run('readCheckpoint().player.allocated.defesa'),5);
 e.run('player.coins=1000;buyShopItem("hp")');assert.equal(e.run('readCheckpoint().player.consumables.hp'),2);
 e.run('player.inventory.push({uid:"it500",name:"Anel",slot:"accessory",rarity:"comum",value:1,atk:1});equipItem("it500")');
 assert.equal(e.run('readCheckpoint().player.equipment.accessory.uid'),'it500');
 e.run('unequipItem("accessory")');assert.equal(e.run('readCheckpoint().player.inventory[0].uid'),'it500');
});
test('storage errors are handled without destroying last checkpoint',()=>{
 const e=fresh(),raw=e.storage.get('a-ultima-lua.checkpoint');
 e.run('localStorage.setItem=()=>{throw Error("QuotaExceededError")};player.coins++;');
 assert.equal(e.run('requestCheckpoint()'),false);assert.equal(e.storage.get('a-ultima-lua.checkpoint'),raw);
 assert.ok(e.run('saveNotice').includes('Não foi possível salvar'));
});

test('schema 1 bracelet migration preserves exact instance and ring across repeated loads; legacy sells but cannot equip',()=>{
 const e=fresh();
 e.run('var old=readCheckpoint();old.schemaVersion=1;old.player.equipment.bracelet={uid:"it90",slot:"bracelet",name:"Bracelete legado",rarity:"raro",atk:3,agi:2,hp:10,mp:4,value:37,statReq:{defesa:2},affixes:[{key:"crit",value:.057321}],extra:{origin:"legacy"}};old.player.equipment.accessory={uid:"it91",slot:"accessory",name:"Anel legado",rarity:"raro",def:2,value:50};old.player.atk+=3;old.player.agilidade+=2;old.player.hpMax+=10;old.player.hp+=10;old.player.mpMax+=4;old.player.mp+=4;delete old.player.equipment.legs;localStorage.setItem(SAVE_KEY,JSON.stringify(old))');
 const bracelet=JSON.stringify({...JSON.parse(e.run('JSON.stringify(old.player.equipment.bracelet)')),salvageProfile:{id:'hybrid',version:1}}),ring=JSON.stringify({...JSON.parse(e.run('JSON.stringify(old.player.equipment.accessory)')),salvageProfile:{id:'hybrid',version:1}});
 let loaded=boot(e.storage);loaded.run('continueSavedGame()');
 assert.equal(loaded.run('SAVE_SCHEMA_VERSION'),4);
 assert.equal(loaded.run('JSON.stringify(player.inventory[0])'),bracelet);
 assert.equal(loaded.run('JSON.stringify(player.equipment.accessory)'),ring);
 assert.equal(loaded.run('player.equipment.bracelet'),undefined);
 assert.equal(loaded.run('player.equipment.legs'),null);
 assert.equal(loaded.run('player.atk'),e.run('player.atk'));
 assert.equal(loaded.run('player.hpMax'),e.run('player.hpMax'));
 const migrated=loaded.run('JSON.stringify(readCheckpoint())');
 for(let i=0;i<3;i++){loaded=boot(e.storage);loaded.run('continueSavedGame()');assert.equal(loaded.run('JSON.stringify(readCheckpoint())'),migrated);}
 loaded.run('equipItem("it90")');
 assert.equal(loaded.run('JSON.stringify(player.inventory[0])'),bracelet);
 assert.equal(loaded.run('player.equipment.bracelet'),undefined);
 const coins=loaded.run('player.coins');loaded.run('sellItem("it90")');
 assert.equal(loaded.run('player.coins'),coins+37);
 assert.equal(loaded.run('player.inventory.length'),0);
 assert.equal(loaded.run('JSON.stringify(player.equipment.accessory)'),ring);
});

test('ten active slots, no generated bracelet/legs or merchant offer; legs does not change two-handed or class restrictions',()=>{
 const e=fresh();
 assert.equal(e.run('SLOT_ORDER.length'),10);
 assert.equal(e.run('SLOT_ORDER.includes("legs") && !SLOT_ORDER.includes("bracelet")'),true);
 assert.equal(e.run('FERREIRO_BASE_GEAR.some(i=>["bracelet","legs"].includes(i.slot))'),false);
 assert.equal(e.run('DROP_SLOTS.some(s=>["bracelet","legs"].includes(s))'),false);
 e.run('var generated=[];for(var n=0;n<100;n++){Math.random=()=>n/100;generated.push(generateItem(0,0,false).slot)}');
 assert.equal(e.run('generated.some(s=>["bracelet","legs"].includes(s))'),false);
 // Fixture only: no new legs content is added to the game.
 e.run('player.inventory=[{uid:"it501",slot:"legs",name:"Fixture",def:2,value:1},{uid:"it502",slot:"shield",name:"Escudo",def:3,value:1},{uid:"it503",slot:"weapon",name:"Duas mãos",twoHanded:true,atk:3,value:1},{uid:"it504",slot:"shield",name:"Orbe",classReq:"mago",value:1}];equipItem("it501");equipItem("it502");equipItem("it503")');
 assert.equal(e.run('player.equipment.legs.uid'),'it501');
 assert.equal(e.run('player.equipment.shield'),null);
 e.run('equipItem("it502");equipItem("it504")');
 assert.equal(e.run('player.equipment.shield'),null);
 e.run('unequipItem("weapon");equipItem("it504")');
 assert.equal(e.run('player.equipment.shield'),null);
 e.run('equipItem("it502")');
 assert.equal(e.run('player.equipment.shield.uid'),'it502');
});

function resumed(e){const r=boot(e.storage);assert.equal(r.run('continueSavedGame()'),true);assert.equal(r.run('ui.inBattle'),false);return r;}
test('reported 34→27 HP / 6 MP survives an actual enemy attack and reload',()=>{
 const e=boot();e.run('chooseClass("mago");player.hp=34;player.mp=6;requestCheckpoint();startBattle(0,MAPS[0].monsters[0],false);calcDamage=()=>7;resolveEnemyAttack()');
 const r=resumed(e);assert.equal(r.run('player.hp'),27);assert.equal(r.run('player.mp'),6);
 assert.equal(r.run('player.totalXp'),0);assert.equal(r.run('player.coins'),25);
 assert.equal(r.run('player.forestProgress.commonKills'),0);
});
test('skill MP, potion use and healing persist before the asynchronous enemy response',()=>{
 const e=boot();e.run('chooseClass("mago");player.level=3;recomputeStats();player.hp=10;player.mp=40;requestCheckpoint();startBattle(0,MAPS[0].monsters[0],false);usarSkill("toque_sombrio")');
 let r=resumed(e);assert.equal(r.run('player.mp'),30);assert.equal(r.run('player.hp'),e.run('player.hp'));
 e.tick();r=resumed(e);assert.equal(r.run('player.hp'),e.run('player.hp'));
 e.tick();e.run('usarConsumivelBatalha("hp")');
 r=resumed(e);assert.equal(r.run('player.consumables.hp'),0);assert.equal(r.run('player.hp'),e.run('player.hp'));
 e.tick();e.tick();e.run('usarConsumivelBatalha("mp")');
 r=resumed(e);assert.equal(r.run('player.consumables.mp'),0);assert.equal(r.run('player.mp'),e.run('player.mp'));
 assert.ok(r.run('player.hp<=player.hpMax && player.mp<=player.mpMax'));
});
test('common/miniboss/boss interrupted resources do not consolidate rewards, level-up or territorial state',()=>{
 for(const template of ['MAPS[0].monsters[0]','MAPS[0].miniBoss','MAPS[0].boss','MAPS[1].miniBoss']){
  const e=fresh();e.run('player.hp=40;player.mp=15;requestCheckpoint()');
  const baseline=e.run('JSON.stringify(readCheckpoint().player)');
  e.run('startBattle('+ (template.includes('[1]')?1:0) +','+template+',false);calcDamage=()=>7;resolveEnemyAttack()');
  const hp=e.run('player.hp');assert.equal(resumed(e).run('player.hp'),hp);
  e.run('ui.monster.xp=10000;handleVictory(ui.monster)');
  const r=resumed(e),expected=JSON.parse(baseline);expected.hp=hp;
  assert.deepEqual(JSON.parse(r.run('JSON.stringify(player)')),expected);
  e.close();assert.ok(resumed(e).run('player.totalXp')>0);
 }
});
test('lethal callback window retains zero HP without recording defeat; confirmed defeat still works',()=>{
 const e=fresh();e.run('startBattle(0,MAPS[0].monsters[0],false);calcDamage=()=>999;resolveEnemyAttack()');
 let r=resumed(e);assert.equal(r.run('player.hp'),0);assert.equal(r.run('player.totalXp'),0);
 e.run('handleDefeat()');r=resumed(e);assert.equal(r.run('player.hp'),0);
 e.close();assert.equal(resumed(e).run('player.hp'),e.run('player.hp'));
});
test('Romar resources persist through nonlethal defeat and final choice without premature quest reward',()=>{
 const e=fresh();e.run('startRomarEncounter();calcDamage=()=>7;romarStrike(ui.monster,"Ataque",1,0,false)');
 assert.equal(resumed(e).run('player.hp'),e.run('player.hp'));
 e.run('calcDamage=()=>999;romarStrike(ui.monster,"Ataque",1,0,false)');
 let r=resumed(e);assert.equal(r.run('player.hp'),e.run('Math.max(1,Math.round(player.hpMax*.2))'));
 assert.equal(r.run('player.romar_first_choice'),undefined);
 e.run('continueRomarResult();startRomarEncounter();resolvePlayerHit(99999,false);chooseRomarFirst("attacked")');
 r=resumed(e);assert.equal(r.run('player.romar_first_choice'),undefined);assert.equal(r.run('player.questItems.fragmento_ferro_runico'),undefined);
 e.run('continueRomarResult()');assert.equal(resumed(e).run('player.romar_first_choice'),'attacked');
});

test('combat tonic remains consumed with its duration; resource overlay clamps to checkpoint maxima',()=>{
 const e=fresh();e.run('player.consumables.xpbuff=1;requestCheckpoint();startBattle(0,MAPS[0].monsters[0],false);usarTonicoFuria()');
 let r=resumed(e);assert.equal(r.run('player.consumables.xpbuff'),0);assert.equal(r.run('player.xpBuffUntil'),e.run('player.xpBuffUntil'));
 e.run('player.hp=999;player.mp=999;persistCombatResources()');r=resumed(e);
 assert.equal(r.run('player.hp'),r.run('player.hpMax'));assert.equal(r.run('player.mp'),r.run('player.mpMax'));
});

function swampReady(fragment=false){
 const e=fresh();e.run('player.defeatedBosses=[0];player.level=5;recomputeStats();player.swampProgress.commonKills=3;ui.mapIndex=1;requestCheckpoint()');
 if(fragment)e.run('player.questItems={fragmento_ferro_runico:{name:"Fragmento",questClue:true}};requestCheckpoint()');
 return e;
}
function meetLucas(e,fragment=false){
 e.run('explorarMapa(1)');assert.equal(e.run('ui.lucasScene'),'sound');
 e.run('lucasSceneAction("investigate");lucasSceneAction("next")');
 assert.equal(e.run('ui.lucasScene'),fragment?'fragment1':'unknown');
 if(fragment)e.run('lucasSceneAction("next");lucasSceneAction("next")');
 e.run('lucasSceneAction("reply");lucasSceneAction("next")');
 assert.equal(e.run('ui.lucasScene'),'unlock');
 assert.equal(e.run('readCheckpoint().player.forgeProgress.lucas.discovered'),false);
 e.run('lucasSceneAction("finish")');
}
test('Lucas only in swamp after three common kills; trap and miniboss keep priority and RNG',()=>{
 const e=swampReady();e.run('player.swampProgress.commonKills=2;explorarMapa(1)');
 assert.equal(e.run('ui.lucasScene'),undefined);assert.equal(e.run('ui.inBattle'),true);
 e.run('fleeBattle();player.swampProgress.commonKills=3;var rolls=0;Math.random=()=>{rolls++;return 0};explorarMapa(1)');
 assert.equal(e.run('ui.lucasScene'),undefined);assert.equal(e.run('ui.inBattle'),false);
 e.close();e.run('var seq=[.99,0];Math.random=()=>seq.length?seq.shift():.99;explorarMapa(1)');
 assert.equal(e.run('ui.monster.id'),'devorador_charco');assert.equal(e.run('ui.lucasScene'),undefined);
 e.run('fleeBattle();Math.random=()=>{rolls++;return .99};rolls=0;explorarMapa(1)');
 assert.equal(e.run('rolls'),2);assert.equal(e.run('ui.lucasScene'),'sound');
 assert.equal(e.run('player.swampProgress.commonKills'),3);
 assert.equal(e.run('player.swampProgress.miniBossDefeated'),false);
});
test('Lucas refusal repeats after three accepted swamp explorations; blocked clicks never count',()=>{
 const e=swampReady();e.run('explorarMapa(1);lucasSceneAction("leave")');
 assert.equal(resumed(e).run('player.forgeProgress.lucas.waitExplorations'),3);
 for(let cycle=0;cycle<2;cycle++){
  for(let n=2;n>=0;n--){
   e.run('explorarMapa(1)');assert.equal(e.run('getLucasProgress().waitExplorations'),n);
   assert.equal(e.run('ui.inBattle'),true);
   e.run('explorarMapa(1)');assert.equal(e.run('getLucasProgress().waitExplorations'),n);
   e.run('fleeBattle()');
  }
  e.run('explorarMapa(1)');assert.equal(e.run('ui.lucasScene'),'sound');
  e.run('lucasSceneAction("leave")');assert.equal(e.run('getLucasProgress().waitExplorations'),3);
 }
});
for(const fragment of [false,true])test('Lucas first encounter, persistent unlock and no repeats; fragment='+fragment,()=>{
 const e=swampReady(fragment);
 const before=e.run('JSON.stringify([player.swampProgress,player.forestProgress,player.defeatedBosses,player.inventory,player.totalXp,player.coins])');
 meetLucas(e,fragment);
 assert.equal(e.run('JSON.stringify([player.swampProgress,player.forestProgress,player.defeatedBosses,player.inventory,player.totalXp,player.coins])'),before);
 const r=resumed(e);assert.equal(r.run('getLucasProgress().forgeUnlocked'),true);
 assert.equal(r.run('getLucasProgress().fragmentSeen'),fragment);
 assert.equal(r.run('lucasHasFragment()'),fragment);
 r.run('ui.mapIndex=1;visitForge()');assert.equal(r.run('ui.lucasScene'),'workshop');
 r.run('lucasSceneAction("finish");explorarMapa(1)');assert.equal(r.run('ui.lucasScene'),null);
 assert.equal(r.run('ui.inBattle'),true);
});
test('later fragment recognized once, never consumed; reload in scene returns prior checkpoint',()=>{
 const e=swampReady();meetLucas(e);
 e.run('player.questItems={fragmento_ferro_runico:{name:"Fragmento",questClue:true}};requestCheckpoint();visitForge()');
 assert.equal(e.run('ui.lucasScene'),'fragment1');
 assert.equal(e.run('requestCheckpoint()'),false);
 let r=resumed(e);assert.equal(r.run('ui.lucasScene'),null);assert.equal(r.run('getLucasProgress().fragmentSeen'),false);
 r.run('ui.mapIndex=1;visitForge();lucasSceneAction("next");lucasSceneAction("next");lucasSceneAction("finish")');
 r=resumed(r);assert.equal(r.run('getLucasProgress().fragmentSeen'),true);
 r.run('ui.mapIndex=1;visitForge()');assert.equal(r.run('ui.lucasScene'),'workshop');
 assert.equal(r.run('lucasHasFragment()'),true);
});
test('Lucas scene blocks exploration/navigation, has persistent handlers and safe missing art; old save migration idempotent',()=>{
 const e=swampReady();e.run('explorarMapa(1);lucasSceneAction("investigate");lucasSceneAction("next")');
 assert.equal(e.run('ui.lucasScene'),'unknown');
 e.run('switchTab("inventario");explorarMapa(1);startBattle(1,MAPS[1].boss,true)');
 assert.equal(e.run('ui.lucasScene'),'unknown');assert.equal(e.run('ui.inBattle'),false);
 const html=e.run('renderMapaTab()');assert.ok(html.includes('interactive-card'));assert.ok(html.includes('onerror='));
 assert.ok(html.includes("lucasSceneAction('reply')"));
 const r=resumed(e);assert.equal(r.run('getLucasProgress().discovered'),false);
 r.run('var old=readCheckpoint();old.schemaVersion=2;delete old.player.forgeProgress.lucas');
 assert.equal(r.run('normalizeCheckpoint(old).schemaVersion'),4);
 assert.equal(r.run('JSON.stringify(normalizeCheckpoint(old))'),r.run('JSON.stringify(normalizeCheckpoint(normalizeCheckpoint(old)))'));
});

function salvageFixture(){
 const e=swampReady();meetLucas(e);
 // Quantidades artificiais APENAS para testar atomicidade; nunca catálogo do jogo.
 e.run('SALVAGE_PROFILES.fixture={version:1,yieldsByRarity:{comum:{sucata_ferro:2,essencia_arcana:1}}};player.inventory.push({uid:"it700",slot:"bracelet",name:"Fixture legado",rarity:"comum",value:5,atk:1,salvageProfile:{id:"fixture",version:1}});requestCheckpoint();visitForge()');
 return e;
}
test('forge catalogs contain approved profiles and no craft recipes; materials and knowledge migrate idempotently',()=>{
 const e=fresh();assert.equal(e.run('Object.keys(SALVAGE_PROFILES).length'),3);assert.equal(e.run('Object.keys(RECIPE_DEFS).length'),0);
 e.run('var old=readCheckpoint();old.schemaVersion=3;old.player.materials={sucata_ferro:7,essencia_arcana:2};old.player.knownRecipes=["future","future"];old.player.recipePity={future:4}');
 assert.equal(e.run('normalizeCheckpoint(old).schemaVersion'),4);
 assert.equal(e.run('normalizeCheckpoint(old).player.knownRecipes.length'),1);
 assert.equal(e.run('normalizeCheckpoint(old).player.materials.sucata_ferro'),7);
 assert.equal(e.run('JSON.stringify(normalizeCheckpoint(old))'),e.run('JSON.stringify(normalizeCheckpoint(normalizeCheckpoint(old)))'));
 e.run('localStorage.setItem(SAVE_KEY,JSON.stringify(old))');
 const r=resumed(e);assert.equal(r.run('player.recipePity.future'),4);
 assert.equal(r.run('player.knownRecipes[0]'),'future');
});
test('salvage atomic commit, duplicate request and reload never duplicate materials; fragment unchanged',()=>{
 const e=salvageFixture();e.run('player.questItems={fragmento_ferro_runico:{questClue:true}};previewSalvage("it700")');
 const html=e.run('renderForgeWorkshop()');assert.ok(html.includes('ESTE EQUIPAMENTO SERÁ DESTRUÍDO PERMANENTEMENTE.'));assert.ok(html.includes('Sucata de Ferro · 2'));
 assert.equal(e.run('confirmSalvage()'),true);assert.equal(e.run('confirmSalvage()'),false);
 assert.equal(e.run('player.materials.sucata_ferro'),2);assert.equal(e.run('player.inventory.length'),0);
 const r=resumed(e);assert.equal(r.run('player.materials.essencia_arcana'),1);
 assert.equal(r.run('player.questItems.fragmento_ferro_runico.questClue'),true);
 assert.equal(r.run('ui.salvageConfirmation'),null);
});
test('salvage cancel/reload before confirmation preserve item; storage failure rolls back',()=>{
 const e=salvageFixture();e.run('previewSalvage("it700");cancelSalvage()');
 assert.equal(e.run('confirmSalvage()'),false);assert.equal(e.run('player.inventory.length'),1);
 e.run('previewSalvage("it700")');
 assert.equal(resumed(e).run('player.inventory.length'),1);
 const raw=e.storage.get('a-ultima-lua.checkpoint');
 e.run('localStorage.setItem=()=>{throw Error("QuotaExceeded")};');
 assert.equal(e.run('confirmSalvage()'),false);
 assert.equal(e.run('player.inventory.length'),1);assert.equal(e.run('player.materials.sucata_ferro'),undefined);
 assert.equal(e.storage.get('a-ultima-lua.checkpoint'),raw);
});
test('salvage blocks equipped/special/protected/quest/consumable/unknown profiles and absent inventory instances',()=>{
 const e=salvageFixture();
 for(const flag of ['protected','special','isProtected','isSpecial','uniqueEffect','questClue']){
  e.run('player.inventory[0].'+flag+'=true');assert.equal(e.run('salvageQuote("it700")'),null);e.run('delete player.inventory[0].'+flag);
 }
 e.run('player.equipment.bracelet=player.inventory[0]');assert.equal(e.run('salvageQuote("it700")'),null);e.run('delete player.equipment.bracelet');
 e.run('player.inventory[0].slot="consumable"');assert.equal(e.run('salvageQuote("it700")'),null);
 e.run('player.inventory[0].slot="bracelet";player.inventory[0].salvageProfile.id="missing"');assert.equal(e.run('salvageQuote("it700")'),null);
 e.run('player.inventory[0].salvageProfile.id="fixture";previewSalvage("it700");player.inventory=[]');
 assert.equal(e.run('confirmSalvage()'),false);assert.equal(e.run('player.materials.sucata_ferro'),undefined);
});
test('salvage rejects changed instance/yield, duplicate uid, locked forge and integer overflow',()=>{
 const e=salvageFixture();e.run('previewSalvage("it700");player.inventory[0].atk++');
 assert.equal(e.run('confirmSalvage()'),false);
 e.run('previewSalvage("it700");SALVAGE_PROFILES.fixture.yieldsByRarity.comum.sucata_ferro++');
 assert.equal(e.run('confirmSalvage()'),false);
 e.run('player.inventory.push(JSON.parse(JSON.stringify(player.inventory[0])))');assert.equal(e.run('salvageQuote("it700")'),null);
 e.run('player.inventory.pop();previewSalvage("it700");player.forgeProgress.lucas.forgeUnlocked=false');
 assert.equal(e.run('confirmSalvage()'),false);
 e.run('player.forgeProgress.lucas.forgeUnlocked=true;player.materials.sucata_ferro=Number.MAX_SAFE_INTEGER;previewSalvage("it700")');
 assert.equal(e.run('confirmSalvage()'),false);assert.equal(e.run('player.inventory.length'),1);
});
test('workshop shows three areas with official art and separates materials from quest fragment',()=>{
 const e=swampReady(true);meetLucas(e,true);e.run('visitForge();player.materials={fragmento_refinado:3}');
 const html=e.run('renderLucasScene()');
 for(const text of ['FABRICAR','DESMONTAR','MATERIAIS','Nenhuma receita conhecida.','assets/images/npcs/lucas.jpg','Fragmento Refinado · 3'])assert.ok(html.includes(text));
 assert.ok(!e.run('renderForgeMaterials()').includes('Ferro Rúnico'));
 assert.ok(!html.includes('confirmSalvage()'));
});

test('approved yield matrix is exact for every profile and rarity',()=>{
 const e=fresh(),rarities=['comum','raro','épico','lendário'];
 const expected={
 physical:[{sucata_ferro:1},{sucata_ferro:2},{sucata_ferro:4,fragmento_refinado:1},{sucata_ferro:7,fragmento_refinado:2}],
 arcane:[{essencia_arcana:1},{essencia_arcana:2},{essencia_arcana:4,fragmento_refinado:1},{essencia_arcana:7,fragmento_refinado:2}],
 hybrid:[{sucata_ferro:1},{sucata_ferro:1,essencia_arcana:1},{sucata_ferro:2,essencia_arcana:2,fragmento_refinado:1},{sucata_ferro:3,essencia_arcana:3,fragmento_refinado:2}]
 };
 for(const [profile,rows] of Object.entries(expected))rarities.forEach((rarity,i)=>{
  e.run('player.inventory=[{uid:"it900",slot:"weapon",rarity:'+JSON.stringify(rarity)+',salvageProfile:{id:'+JSON.stringify(profile)+',version:1}}]');
  assert.deepEqual(JSON.parse(e.run('JSON.stringify(salvageQuote("it900").yields)')),rows[i]);
 });
});
test('profile mapping uses only approved structural slots/classes, preserves explicit profiles and protects Alfa',()=>{
 const e=fresh();
 for(const slot of ['weapon','shield','helmet','armor','gloves','boots'])for(const cls of ['mago','arqueiro','guerreiro','cavaleiro']){
  assert.equal(e.run('assignSalvageProfile({slot:'+JSON.stringify(slot)+',classReq:'+JSON.stringify(cls)+',name:"nome irrelevante"}).salvageProfile.id'),cls==='mago'?'arcane':'physical');
 }
 for(const slot of ['accessory','necklace','earring','bracelet'])assert.equal(e.run('assignSalvageProfile({slot:'+JSON.stringify(slot)+'}).salvageProfile.id'),'hybrid');
 assert.equal(e.run('assignSalvageProfile({slot:"armor",name:"Armadura Arcana"}).salvageProfile'),undefined);
 assert.equal(e.run('assignSalvageProfile({slot:"legs",classReq:"mago"}).salvageProfile'),undefined);
 assert.equal(e.run('assignSalvageProfile({slot:"accessory",salvageProfile:{id:"future",version:9}}).salvageProfile.id'),'future');
 e.run('player.inventory=[generateBossUnique(0)]');assert.equal(e.run('salvageQuote(player.inventory[0].uid)'),null);
});
test('merchant audit: common gear costs 120–130, yields only one scrap, resale loses gold, consumables excluded',()=>{
 const e=swampReady();meetLucas(e);e.run('player.coins=10000;');
 for(let i=0;i<3;i++){
  e.run('buyBaseGear('+i+')');
  assert.ok(e.run('FERREIRO_BASE_GEAR['+i+'].price')>=120);
  assert.ok(e.run('player.inventory.at(-1).value<FERREIRO_BASE_GEAR['+i+'].price'));
  assert.deepEqual(JSON.parse(e.run('JSON.stringify(salvageQuote(player.inventory.at(-1).uid).yields)')),{sucata_ferro:1});
 }
 assert.equal(e.run('SHOP_ITEMS.every(it=>!it.salvageProfile)'),true);
});
