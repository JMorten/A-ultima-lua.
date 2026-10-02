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
 assert.equal(e.run('readCheckpoint().player.forestProgress.commonKills'),1);
 assert.ok(e.run('readCheckpoint().pendingVictory'));
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
 assert.equal(loaded.run('SAVE_SCHEMA_VERSION'),5);
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
  const r=resumed(e);
  assert.ok(r.run('ui.pendingVictory'));
  assert.equal(r.run('player.totalXp'),e.run('player.totalXp'));
  assert.equal(r.run('player.hp'),e.run('player.hp'));
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
 assert.equal(r.run('normalizeCheckpoint(old).schemaVersion'),5);
 assert.equal(r.run('JSON.stringify(normalizeCheckpoint(old))'),r.run('JSON.stringify(normalizeCheckpoint(normalizeCheckpoint(old)))'));
});

function salvageFixture(){
 const e=swampReady();meetLucas(e);
 // Quantidades artificiais APENAS para testar atomicidade; nunca catálogo do jogo.
 e.run('SALVAGE_PROFILES.fixture={version:1,yieldsByRarity:{comum:{sucata_ferro:2,essencia_arcana:1}}};player.inventory.push({uid:"it700",slot:"bracelet",name:"Fixture legado",rarity:"comum",value:5,atk:1,salvageProfile:{id:"fixture",version:1}});requestCheckpoint();visitForge()');
 return e;
}
test('forge catalogs contain approved profiles and no craft recipes; materials and knowledge migrate idempotently',()=>{
 const e=fresh();assert.equal(e.run('Object.keys(SALVAGE_PROFILES).length'),3);assert.equal(e.run('Object.keys(RECIPE_DEFS).length'),1);
 e.run('var old=readCheckpoint();old.schemaVersion=3;old.player.materials={sucata_ferro:7,essencia_arcana:2};old.player.knownRecipes=["future","future"];old.player.recipePity={future:4}');
 assert.equal(e.run('normalizeCheckpoint(old).schemaVersion'),5);
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

test('swamp common sludge chance is 35%, excludes forest, bosses and minibosses, regardless of forge unlock',()=>{
 const e=fresh();assert.equal(e.run('SWAMP_SLUDGE_CHANCE'),.35);
 for(const chance of [.349999,.35,.99]){
  e.run('player.materials={};ui.mapIndex=1;Math.random=()=>'+chance+';grantSwampForgeRewards(MAPS[1].monsters[0])');
  assert.equal(e.run('player.materials.lodo_viscoso||0'),chance<.35?1:0);
 }
 e.run('player.materials={};Math.random=()=>0;ui.mapIndex=0;grantSwampForgeRewards(MAPS[0].monsters[0]);ui.mapIndex=1;grantSwampForgeRewards(MAPS[1].boss);grantSwampForgeRewards(MAPS[1].miniBoss)');
 assert.equal(e.run('player.materials.lodo_viscoso||0'),0);
 assert.equal(e.run('player.materials.escamas_grande_mae'),1);
});
test('recipe pity exact boundaries 20/30/45/65/100, fifth guaranteed, stops permanently after discovery',()=>{
 const chances=[.2,.3,.45,.65,1],id='anel_grande_mae_lua';
 for(let i=0;i<5;i++)for(const success of [true,false]){
  if(i===4 && !success)continue;
  const e=fresh();
  e.run('ui.mapIndex=1;player.recipePity.'+id+'='+i+';Math.random=()=>'+(success?chances[i]-.000001:chances[i])+';grantSwampForgeRewards(MAPS[1].miniBoss)');
  assert.equal(e.run('player.knownRecipes.includes("'+id+'")'),success);
 }
 const e=fresh();e.run('ui.mapIndex=1;Math.random=()=>.999999');
 for(let i=1;i<=5;i++){
  e.run('grantSwampForgeRewards(MAPS[1].miniBoss)');
  assert.equal(e.run('player.materials.escamas_grande_mae'),i);
  assert.equal(e.run('player.knownRecipes.length'),i===5?1:0);
 }
 assert.equal(e.run('player.recipePity.'+id),undefined);
 e.run('Math.random=()=>{throw Error("no more recipe rolls")};grantSwampForgeRewards(MAPS[1].miniBoss)');
 assert.equal(e.run('player.knownRecipes.length'),1);assert.equal(e.run('player.materials.escamas_grande_mae'),6);
});
test('pending Devorador victory reload replays complete result, never rerolls or advances pity twice',()=>{
 const e=fresh();e.run('player.swampProgress.commonKills=14;requestCheckpoint();startBattle(1,MAPS[1].miniBoss,false);handleVictory(ui.monster)');
 const snapshot=e.run('JSON.stringify(readCheckpoint().player)');
 assert.equal(e.run('player.materials.escamas_grande_mae'),1);
 assert.equal(e.run('player.recipePity.anel_grande_mae_lua'),1);
 assert.equal(e.run('getSwampMiniBossTarget()'),21);
 for(let i=0;i<3;i++){
  const r=boot(e.storage);r.run('Math.random=()=>{throw Error("reroll")};continueSavedGame()');
  assert.ok(r.run('ui.pendingVictory'));
  assert.equal(r.run('JSON.stringify(player)'),snapshot);
  assert.equal(r.run('requestCheckpoint()'),false);
 }
 const r=resumed(e);assert.equal(r.run('confirmPendingVictory()'),true);assert.equal(r.run('confirmPendingVictory()'),false);
 assert.equal(r.run('readCheckpoint().pendingVictory'),undefined);
 assert.equal(resumed(r).run('JSON.stringify(player)'),snapshot);
});
test('recipe discovery and all drops survive pending reload; blessing never doubles scale or recipe chance',()=>{
 for(const blessing of [false,true]){
  const e=fresh();e.run('isXpEventActive=()=>'+blessing+';Math.random=()=>0;startBattle(1,MAPS[1].miniBoss,false);var won=ui.monster;handleVictory(won)');
  assert.equal(e.run('player.materials.escamas_grande_mae'),1);
  assert.equal(e.run('player.knownRecipes.length'),1);
  assert.equal(e.run('readCheckpoint().pendingVictory.notices.some(n=>n.eyebrow==="RECEITA DESCOBERTA")'),true);
  const snapshot=e.run('JSON.stringify(player)');e.run('handleVictory(won)');assert.equal(e.run('JSON.stringify(player)'),snapshot);
  const r=resumed(e);r.run('confirmPendingVictory()');assert.equal(r.run('player.knownRecipes[0]'),'anel_grande_mae_lua');
  assert.equal(r.run('player.inventory.length'),e.run('player.inventory.length'));
 }
});
test('flee/defeat grant no scale, old kills do not seed pity; failed confirmation retains pending result',()=>{
 const e=fresh();e.run('player.swampProgress.miniBossKills=20;requestCheckpoint();startBattle(1,MAPS[1].miniBoss,false);fleeBattle()');
 assert.equal(e.run('player.materials.escamas_grande_mae'),undefined);assert.equal(e.run('player.recipePity.anel_grande_mae_lua'),undefined);
 e.run('startBattle(1,MAPS[1].miniBoss,false);handleDefeat()');e.close();
 assert.equal(e.run('player.materials.escamas_grande_mae'),undefined);
 e.run('startBattle(1,MAPS[1].miniBoss,false);handleVictory(ui.monster)');
 const saved=e.storage.get('a-ultima-lua.checkpoint');
 e.run('localStorage.setItem=()=>{throw Error("quota")};');
 assert.equal(e.run('confirmPendingVictory()'),false);assert.ok(e.run('ui.pendingVictory'));
 assert.equal(e.storage.get('a-ultima-lua.checkpoint'),saved);
 assert.equal(resumed(e).run('player.materials.escamas_grande_mae'),1);
});

test('sludge victory survives reload and repeated confirmation without duplication',()=>{
 const e=fresh();e.run('Math.random=()=>0;startBattle(1,MAPS[1].monsters[0],false);handleVictory(ui.monster)');
 assert.equal(e.run('player.materials.lodo_viscoso'),1);
 const r=resumed(e);r.close();r.close();
 assert.equal(resumed(r).run('player.materials.lodo_viscoso'),1);
 assert.equal(resumed(r).run('player.swampProgress.commonKills'),1);
});
test('blessing keeps recipe boundary at 20% and sludge at 35%; known recipe is visible without craft action',()=>{
 for(const blessing of [false,true]){
  const e=fresh();e.run('isXpEventActive=()=>'+blessing+';Math.random=()=>.2;startBattle(1,MAPS[1].miniBoss,false);handleVictory(ui.monster)');
  assert.equal(e.run('player.knownRecipes.length'),0);assert.equal(e.run('player.materials.escamas_grande_mae'),1);
  e.close();e.run('Math.random=()=>.35;startBattle(1,MAPS[1].monsters[0],false);handleVictory(ui.monster)');
  assert.equal(e.run('player.materials.lodo_viscoso||0'),0);
 }
 const e=fresh();e.run('player.knownRecipes=["anel_grande_mae_lua"]');
 const html=e.run('renderForgeWorkshop()');
 assert.ok(html.includes('Anel da Grande Mãe Lua — Receita descoberta. Fabricação ainda indisponível.'));
 assert.equal(e.run('RECIPE_DEFS.anel_grande_mae_lua.craftable'),false);
});

function lordBattle(){
 const e=fresh();e.run('isMonsterEventActive=()=>false;startBattle(1,MAPS[1].boss,true);player.hp=10000;player.hpMax=10000;calcDamage=()=>20;');
 return e;
}
function lordTurn(e){const out=e.run('resolveEnemyAttack()');e.run('tickCooldowns()');return out;}
test('Senhor base stats unchanged; Domain after three normal actions, telegraph no damage, Atolado two actions x0.75',()=>{
 const e=lordBattle();assert.equal(e.run('ui.monster.hpMax'),793);assert.equal(e.run('ui.monster.atk'),81);assert.equal(e.run('ui.monster.def'),30);
 const dodge=e.run('getDodgeChance()');
 for(let n=0;n<3;n++)assert.equal(lordTurn(e).damage,20);
 const hp=e.run('player.hp');assert.equal(lordTurn(e).damage,0);
 assert.equal(e.run('ui.monster.swampPrepared'),'domain');assert.equal(e.run('player.hp'),hp);
 lordTurn(e);assert.equal(e.run('ui.buffs.atolado.turnsLeft'),2);assert.equal(e.run('getDodgeChance()'),dodge*.75);
 lordTurn(e);assert.equal(e.run('ui.buffs.atolado.turnsLeft'),1);
 lordTurn(e);assert.equal(e.run('ui.buffs.atolado'),undefined);assert.equal(e.run('getDodgeChance()'),dodge);
 assert.ok(e.run('battleLog.join(" ")').includes('ATOLADO terminou'));
});
test('Senhor thresholds are monotonic, do not add actions, and exact 30% remains phase II',()=>{
 const e=lordBattle();e.run('ui.monster.hp=ui.monster.hpMax*.65');
 assert.equal(lordTurn(e).damage,20);assert.equal(e.run('ui.monster.swampPhase'),2);
 e.run('ui.monster.hp=ui.monster.hpMax*.30');lordTurn(e);assert.equal(e.run('ui.monster.swampPhase'),2);
 e.run('ui.monster.hp=ui.monster.hpMax*.29');lordTurn(e);assert.equal(e.run('ui.monster.swampPhase'),3);
 e.run('ui.monster.hp=ui.monster.hpMax');lordTurn(e);
 assert.equal(e.run('ui.monster.swampPhase'),3);
 assert.equal(e.run('battleLog.filter(s=>s.includes("PREDADOR DO LODO")).length'),1);
 assert.equal(e.run('battleLog.filter(s=>s.includes("<b>O PÂNTANO RECLAMA</b>")).length'),1);
});
test('Submersion blocks hits/skills with no RNG/resource/action cost; WAIT is exclusive and double click safe',()=>{
 const e=lordBattle();e.run('ui.monster.hp=ui.monster.hpMax*.5;ui.monster.swampNormals=3;ui.monster.swampNextDomain=false');
 const hp=e.run('player.hp');lordTurn(e);assert.equal(e.run('player.hp'),hp);assert.equal(e.run('ui.monster.submerged'),true);
 const before=e.run('JSON.stringify([player,ui.monster,ui.skillCooldowns,ui.locked])');
 e.run('Math.random=()=>{throw Error("blocked attack rolled RNG")};playerAttack();usarSkill("golpe_da_fe");resolvePlayerHit(999,true)');
 assert.equal(e.run('JSON.stringify([player,ui.monster,ui.skillCooldowns,ui.locked])'),before);
 assert.ok(e.run('renderBatalhaTab()').includes('AGUARDAR'));
 e.run('Math.random=()=>.99;ui.skillCooldowns.fixture=2;waitForSwampLord();waitForSwampLord()');
 assert.equal(e.run('player.hp'),hp);assert.equal(e.run('ui.locked'),true);
 assert.equal(e.run('ui.skillCooldowns.fixture'),2);e.tick();
 assert.equal(e.run('player.hp'),hp-30);assert.equal(e.run('ui.monster.submerged'),false);
 assert.equal(e.run('ui.monster.swampNormals'),0);assert.equal(e.run('ui.skillCooldowns.fixture'),1);
 e.tick();assert.equal(e.run('ui.locked'),false);
 e.run('waitForSwampLord()');assert.equal(e.run('player.hp'),hp-30);
 assert.ok(!e.run('renderBatalhaTab()').includes('AGUARDAR'));
});
test('Submerged accepts existing nonoffensive posture, and next response is delayed ambush',()=>{
 const e=lordBattle();e.run('player.level=3;player.mp=30;ui.monster.hp=ui.monster.hpMax*.5;ui.monster.swampNormals=3;ui.monster.swampNextDomain=false');
 lordTurn(e);e.run('usarSkill("postura_defensiva")');
 assert.equal(e.run('player.mp'),20);assert.ok(e.run('ui.buffs.defBoost'));
 assert.equal(e.run('ui.monster.submerged'),true);e.tick();assert.equal(e.run('ui.monster.submerged'),false);
});
test('Drain telegraph, x1.5 damage, effective damage healing, 8% cap, full HP cap and dodge',()=>{
 for(const [hp,base,monsterHp,expectedHeal] of [[60,100,100,21],[10000,10000,100,63],[1000,100,790,3]]){
  const e=lordBattle();e.run('ui.monster.hp=200;ui.monster.swampNormals=3;ui.monster.swampNextDomain=false;ui.monster.swampNextOffense="drain"');
  assert.equal(lordTurn(e).damage,0);assert.equal(e.run('ui.monster.swampPrepared'),'drain');
  e.run('player.hp='+hp+';ui.monster.hp='+monsterHp+';calcDamage=()=>'+base);
  const hit=lordTurn(e);assert.equal(hit.damage,Math.round(base*1.5));assert.equal(e.run('ui.monster.hp'),monsterHp+expectedHeal);
 }
 const e=lordBattle();e.run('ui.monster.hp=200;ui.monster.swampNormals=3;ui.monster.swampNextDomain=false;ui.monster.swampNextOffense="drain"');lordTurn(e);
 e.run('Math.random=()=>0');lordTurn(e);assert.equal(e.run('ui.monster.hp'),200);
});
test('deterministic cumulative cycles keep one preparation, normal gaps and alternate phase III offense',()=>{
 const e=lordBattle();e.run('ui.monster.hp=200');
 const executed=[];let normals=0;
 for(let n=0;n<65;n++){
  const pending=e.run('ui.monster.swampPrepared');
  const turn=lordTurn(e);
  if(turn.damage===20)normals++;
  if(turn.damage===30){
   assert.ok(normals>=3);normals=0;executed.push(pending);
  }
  assert.equal(e.run('ui.monster.submerged'),e.run('ui.monster.swampPrepared==="ambush"'));
  if(e.run('ui.monster.submerged'))assert.equal(e.run('ui.monster.swampPrepared'),'ambush');
 }
 assert.ok(executed.length>=3);
 executed.forEach((move,i)=>assert.equal(move,i%2?'drain':'ambush'));
});
test('Devorador and other bosses have no new state or WAIT; schema 5 reload discards Senhor preparations/debuffs',()=>{
 const e=fresh();e.run('startBattle(1,MAPS[1].miniBoss,false)');
 assert.equal(e.run('ui.monster.swampPhase'),undefined);assert.ok(!e.run('renderBatalhaTab()').includes('AGUARDAR'));
 e.run('waitForSwampLord()');assert.equal(e.run('ui.locked'),false);
 for(const move of ['ambush','drain']){
  const b=fresh();b.run('startBattle(1,MAPS[1].boss,true);ui.monster.hp=200;ui.monster.swampNormals=3;ui.monster.swampNextDomain=false;ui.monster.swampNextOffense="'+move+'";ui.buffs.atolado={turnsLeft:2};resolveEnemyAttack()');
  const r=resumed(b);assert.equal(r.run('SAVE_SCHEMA_VERSION'),5);assert.equal(r.run('ui.monster'),null);
  assert.equal(r.run('ui.inBattle'),false);assert.equal(r.run('Object.keys(ui.buffs).length'),0);assert.equal(r.run('Object.keys(ui.skillCooldowns).length'),0);
 }
});

test('WAIT has zero resource cost and normal effect ticks, never refreshes Atolado or grants a benefit',()=>{
 const e=lordBattle();e.run('ui.monster.hp=300;ui.monster.swampNormals=3;ui.monster.swampNextDomain=false');lordTurn(e);
 e.run('player.mp=0;player.consumables={hp:0,mp:0};ui.buffs.atolado={turnsLeft:2};ui.buffs.atkBoost={turnsLeft:2,mult:1.3};ui.skillCooldowns.fixture=2');
 const resources=e.run('JSON.stringify([player.mp,player.consumables])');
 e.run('playerAttack()');assert.equal(e.run('ui.buffs.atolado.turnsLeft'),2);
 e.run('waitForSwampLord();waitForSwampLord()');e.tick();
 assert.equal(e.run('JSON.stringify([player.mp,player.consumables])'),resources);
 assert.equal(e.run('ui.buffs.atolado.turnsLeft'),1);assert.equal(e.run('ui.buffs.atkBoost.turnsLeft'),1);assert.equal(e.run('ui.skillCooldowns.fixture'),1);
 e.tick();assert.equal(e.run('ui.locked'),false);
});
test('Devorador desperation remains +20% at 40%, other bosses never gain Lord states',()=>{
 const e=fresh();e.run('startBattle(1,MAPS[1].miniBoss,false);var originalAtk=ui.monster.atk;ui.monster.hp=ui.monster.hpMax*.4;resolvePlayerHit(1,false)');e.tick();
 assert.equal(e.run('ui.monster.desperationTriggered'),true);
 assert.equal(e.run('ui.monster.atk'),e.run('Math.round(originalAtk*1.2)'));
 for(const index of [0,2,3]){
  const b=fresh();b.run('startBattle('+index+',MAPS['+index+'].boss,true)');
  assert.equal(b.run('ui.monster.swampPhase'),undefined);assert.equal(b.run('ui.monster.submerged'),undefined);
  assert.ok(!b.run('renderBatalhaTab()').includes('AGUARDAR'));
 }
});

// Alerta de Guerra V1: apenas sessão; usa o combate e o checkpoint reais.
function scoutBattle(){
 const e=fresh();e.run('startBattle(2,MAPS[2].monsters[0],false);player.hp=player.hpMax=10000');return e;
}
function scoutResponse(e){e.run('monsterCounterTurn();monsterCounterTurn()');e.tick();e.tick();}
function completeScoutAlert(e){for(let i=0;i<4;i++)scoutResponse(e);}

test('Scout: two normal responses, harmless telegraph, full locked player action, harmless completion only once',()=>{
 const e=scoutBattle();
 for(let i=0;i<2;i++){const hp=e.run('player.hp');scoutResponse(e);assert.ok(e.run('player.hp')<hp);}
 const hp=e.run('player.hp');scoutResponse(e);
 assert.equal(e.run('player.hp'),hp);assert.equal(e.run('ui.monster.scoutAlertPrepared'),true);
 assert.equal(e.run('trenchesSession.warAlert'),false);assert.match(e.run('enemyBehaviorChip(ui.monster)'),/ALERTA DE GUERRA/);
 e.run('resolvePlayerHit(1,false);resolvePlayerHit(1,false)');
 assert.equal(e.run('trenchesSession.warAlert'),false);assert.equal(e.run('ui.locked'),true);
 e.tick();assert.equal(e.run('trenchesSession.warAlert'),true);assert.equal(e.run('player.hp'),hp);e.tick();
 e.run('trenchesSession.warAlert=false');
 for(let i=0;i<8;i++)scoutResponse(e);
 assert.equal(e.run('trenchesSession.warAlert'),false);assert.equal(e.run('ui.monster.scoutAlertAttempted'),true);
});

test('Killing a prepared Scout prevents completion, including queued callbacks',()=>{
 const e=scoutBattle();for(let i=0;i<3;i++)scoutResponse(e);
 e.run('resolvePlayerHit(99999,false)');e.tick();e.tick();
 assert.equal(e.run('trenchesSession.warAlert'),false);assert.ok(e.run('ui.pendingVictory'));
 e.close();assert.equal(e.run('trenchesSession.warAlert'),false);
});

test('All four common Orcs consume alert; stance uses effective ATK x1.15 for exactly two actions without mutating templates',()=>{
 for(let i=0;i<4;i++){
  const e=fresh();const templates=e.run('JSON.stringify(MAPS)');
  e.run('trenchesSession.warAlert=true;startBattle(2,MAPS[2].monsters['+i+'],false);player.hp=10000;var attacks=[];calcDamage=(atk)=>{attacks.push(atk);return 1}');
  const atk=e.run('ui.monster.atk');assert.equal(e.run('trenchesSession.warAlert'),false);
  e.run('resolveEnemyAttack();resolveEnemyAttack()');
  assert.equal(e.run('attacks[0]'),atk*1.15);assert.equal(e.run('attacks[1]'),atk*1.15);
  assert.equal(e.run('ui.monster.warStanceActions'),0);
  if(i===0)e.run('resolveEnemyAttack();resolveEnemyAttack()');
  e.run('resolveEnemyAttack()');assert.equal(e.run('attacks[2]'),atk);
  assert.equal(e.run('ui.monster.atk'),atk);assert.equal(e.run('JSON.stringify(MAPS)'),templates);
  assert.equal(e.run('trenchesSession.warAlert'),i===0);
 }
});

test('Dodges consume stance actions too; telegraph responses are actions, not individual impacts',()=>{
 const e=scoutBattle();e.run('ui.monster.warStanceActions=2;getDodgeChance=()=>1');
 scoutResponse(e);scoutResponse(e);assert.equal(e.run('ui.monster.warStanceActions'),0);
 e.run('ui.monster.warStanceActions=2');scoutResponse(e);scoutResponse(e);
 assert.equal(e.run('ui.monster.warStanceActions'),0);assert.equal(e.run('trenchesSession.warAlert'),true);
});

test('Mini/boss neither consume alert nor gain stance; Butcher desperation is unchanged',()=>{
 for(const kind of ['miniBoss','boss']){
  const e=fresh();e.run('trenchesSession.warAlert=true;startBattle(2,MAPS[2].'+kind+','+(kind==='boss')+');player.hp=10000');
  assert.equal(e.run('trenchesSession.warAlert'),true);assert.equal(e.run('ui.monster.warStanceActions'),undefined);
  if(kind==='miniBoss'){
   const atk=e.run('ui.monster.atk');e.run('ui.monster.hp=ui.monster.hpMax*.4;resolvePlayerHit(1,false)');e.tick();
   assert.equal(e.run('ui.monster.atk'),Math.round(atk*1.2));assert.equal(e.run('ui.monster.desperationTriggered'),true);
  }
 }
});

test('Navigation and traps retain alert; actual external battle clears without buff; rejected start retains',()=>{
 const e=fresh();e.run('trenchesSession.warAlert=true;ui.mapIndex=0;render()');assert.equal(e.run('trenchesSession.warAlert'),true);
 e.run('Math.random=()=>0;explorarMapa(0)');assert.equal(e.run('trenchesSession.warAlert'),true);assert.equal(e.run('ui.inBattle'),false);e.close();
 e.run('ui.lucasScene="blocked";startBattle(0,MAPS[0].monsters[0],false)');assert.equal(e.run('trenchesSession.warAlert'),true);
 e.run('ui.lucasScene=null;startBattle(0,MAPS[0].monsters[0],false)');assert.equal(e.run('trenchesSession.warAlert'),false);assert.equal(e.run('ui.monster.warStanceActions'),undefined);
 e.run('fleeBattle();startBattle(2,MAPS[2].monsters[1],false)');assert.equal(e.run('ui.monster.warStanceActions'),undefined);
});

test('Flee/defeat before completion create nothing; after completion retain alert; consumed alert never returns on flee',()=>{
 for(const end of ['fleeBattle()','handleDefeat()'])for(const completed of [false,true]){
  const e=scoutBattle();for(let i=0;i<(completed?4:3);i++)scoutResponse(e);
  e.run(end);assert.equal(e.run('trenchesSession.warAlert'),completed);
  if(completed){e.close();e.run('startBattle(2,MAPS[2].monsters[1],false);fleeBattle()');assert.equal(e.run('trenchesSession.warAlert'),false);}
 }
});

test('Pending victory and repeated CONTINUAR preserve one session alert; schema 5 stores no alert and reload discards it',()=>{
 const e=scoutBattle();completeScoutAlert(e);e.run('resolvePlayerHit(99999,false)');e.tick();
 assert.ok(e.run('ui.pendingVictory'));assert.equal(e.run('trenchesSession.warAlert'),true);
 const raw=e.storage.get('a-ultima-lua.checkpoint');assert.equal(JSON.parse(raw).schemaVersion,5);assert.ok(!raw.includes('warAlert'));assert.ok(!raw.includes('scoutAlert'));
 const r=boot(e.storage);r.run('continueSavedGame()');assert.equal(r.run('trenchesSession.warAlert'),false);assert.equal(r.run('ui.monster'),null);
 e.close();e.run('confirmPendingVictory();confirmPendingVictory()');assert.equal(e.run('trenchesSession.warAlert'),true);
 e.run('startBattle(2,MAPS[2].monsters[1],false)');assert.equal(e.run('ui.monster.warStanceActions'),2);assert.equal(e.run('trenchesSession.warAlert'),false);
});

test('Reload drops preparation and stance, without restoring combat or changing schema',()=>{
 for(const prepared of [false,true]){
  const e=scoutBattle();if(prepared){for(let i=0;i<3;i++)scoutResponse(e);}else e.run('ui.monster.warStanceActions=2');
  const r=boot(e.storage);r.run('continueSavedGame()');assert.equal(r.run('ui.monster'),null);assert.equal(r.run('trenchesSession.warAlert'),false);assert.equal(r.run('SAVE_SCHEMA_VERSION'),5);
 }
});

test('Scout portraits follow preparation, completion and next normal response without mutating templates',()=>{
 const e=scoutBattle(),template=e.run('JSON.stringify(MAPS[2].monsters[0])');
 const art=()=>e.run('monsterAvatarHtml(ui.monster,"avatar-img-circle")');
 assert.match(art(),/orc_batedor_nova_arte.png/);
 scoutResponse(e);scoutResponse(e);scoutResponse(e);assert.match(art(),/orc_batedor_alerta_chifre.png/);
 scoutResponse(e);assert.match(art(),/orc_batedor_alerta_chifre.png/);
 scoutResponse(e);assert.match(art(),/orc_batedor_nova_arte.png/);
 assert.equal(e.run('JSON.stringify(MAPS[2].monsters[0])'),template);
});

test('Scout visual state never leaks after flee or death; other portraits remain canonical',()=>{
 for(const death of [false,true]){
  const e=scoutBattle();for(let i=0;i<3;i++)scoutResponse(e);
  if(death){e.run('resolvePlayerHit(99999,false)');e.tick();e.close();}else e.run('fleeBattle()');
  e.run('startBattle(2,MAPS[2].monsters[0],false)');assert.equal(e.run('ui.monster.scoutHornVisual'),false);
  assert.match(e.run('monsterAvatarHtml(ui.monster)'),/orc_batedor_nova_arte.png/);
 }
 const e=fresh();assert.equal(e.run('MAPS.every(map=>[...map.monsters,map.miniBoss,map.boss].filter(Boolean).every(m=>monsterAvatarHtml(m).includes(m.portrait)))'),true);
});

test('War stance narrative is rendered before arena and controls, and remains in battle log',()=>{
 const e=fresh();e.run('trenchesSession.warAlert=true;startBattle(2,MAPS[2].monsters[1],false)');
 const html=e.run('renderBatalhaTab()');assert.ok(html.indexOf('ELES ESTAVAM ESPERANDO')<html.indexOf('battle-arena'));
 assert.ok(e.run('battleLog.some(s=>s.includes("ELES ESTAVAM ESPERANDO"))'));
 e.run('ui.monster.warStanceActions=0');assert.ok(!e.run('renderBatalhaTab()').split('battle-arena')[0].includes('ELES ESTAVAM ESPERANDO'));
});

test('Approved Scout PNG assets exist at portrait paths with expected dimensions',()=>{
 for(const name of ['orc_batedor_nova_arte.png','orc_batedor_alerta_chifre.png']){
  const bytes=fs.readFileSync(path.join(root,'assets/images/enemies/trenches',name));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(bytes.readUInt32BE(16),627);assert.equal(bytes.readUInt32BE(20),1254);
 }
});

test('Natural portrait layout is opt-in, survives Scout art changes and never changes player or templates',()=>{
 const e=scoutBattle(),template=e.run('JSON.stringify(MAPS)');
 assert.equal(e.run('MAPS[2].monsters[0].portraitLayout'),'natural');
 const enemy=()=>e.run('renderBatalhaTab()').match(/<div class="([^"]*)" id="portrait-enemy">/)[1];
 for(let i=0;i<6;i++){
  assert.match(enemy(),/portrait-natural/);
  assert.match(e.run('monsterAvatarHtml(ui.monster)'),/width="627" height="1254"/);
  assert.ok(!e.run('renderBatalhaTab()').match(/<div class="([^"]*)" id="portrait-player">/)[1].includes('portrait-natural'));
  scoutResponse(e);
 }
 assert.equal(e.run('JSON.stringify(MAPS)'),template);
 e.run('fleeBattle();startBattle(2,MAPS[2].monsters[1],false)');assert.ok(!enemy().includes('portrait-natural'));
 e.run('ui.monster.portraitLayout="natural"');assert.match(enemy(),/portrait-natural/);
 e.run('delete ui.monster.portraitLayout');assert.ok(!enemy().includes('portrait-natural'));
 assert.equal(e.run('MAPS.flatMap(map=>[...map.monsters,map.boss,map.miniBoss]).filter(m=>m && m.portraitLayout).length'),1);
 const css=fs.readFileSync(path.join(root,'styles/game.css'),'utf8');
 assert.match(css,/\.portrait-ring\.portrait-natural\{height:auto;max-width:100%;\}/);
 assert.match(css,/\.portrait-ring\.portrait-natural > \.avatar-img-circle\{display:block;width:100%;height:auto;\}/);
});

test('Arena foundation separates artwork, effects, heading, resources and states with legacy fallback',()=>{
 const e=scoutBattle();let html=e.run('renderBatalhaTab()');
 for(const name of ['combatant-art-stage','combatant-artwork','combatant-effects','combatant-heading','combatant-hud','combatant-statuses'])assert.equal((html.match(new RegExp('class="'+name+'(?: |")','g'))||[]).length,2,name);
 assert.match(html,/combatant-art-stage art-legacy/);assert.match(html,/combatant-art-stage art-natural/);
 assert.match(html,/id="portrait-enemy">[\s\S]*?<\/div>\s*<div class="combatant-effects" id="effects-enemy"/);
 e.run('fleeBattle();startBattle(2,MAPS[2].monsters[1],false)');html=e.run('renderBatalhaTab()');
 assert.equal((html.match(/combatant-art-stage art-legacy/g)||[]).length,2);assert.ok(!html.includes('art-natural'));
});

test('Existing floating numbers target effects; shake targets artwork; action lock preserves forced disabled controls',()=>{
 const e=fresh();
 e.run(gameCode.slice(gameCode.indexOf('function floatNumber('),gameCode.indexOf('function updateArenaBarsOnly(')));
 for(const side of ['player','enemy']){
  const effects=e.document.getElementById('effects-'+side),art=e.document.getElementById('portrait-'+side);
  let floated=null,shaken=false;effects.appendChild=x=>{floated=x};art.appendChild=()=>{throw Error('numbers must not enter artwork')};
  art.classList.add=name=>{shaken=name==='shake'};
  e.run('floatNumber("'+side+'","-12","dmg");shakeSide("'+side+'")');
  assert.equal(floated.textContent,'-12');assert.equal(shaken,true);
 }
 const buttons=[{dataset:{}},{dataset:{forceDisabled:'1'}}];const original=e.document.querySelectorAll;
 e.document.querySelectorAll=sel=>sel.includes('.battle-actions')?buttons:original(sel);
 e.run('setActionsLocked(true)');assert.ok(buttons.every(b=>b.disabled));
 e.run('setActionsLocked(false)');assert.equal(buttons[0].disabled,false);assert.equal(buttons[1].disabled,true);
});
