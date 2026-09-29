const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),{test}=require('node:test');
const root=path.join(__dirname,'..'),gameCode=fs.readFileSync(path.join(root,'src/game.js'),'utf8'),saveCode=fs.readFileSync(path.join(root,'src/persistence.js'),'utf8');
function boot(storage=new Map()){
 const cards=[],elements=new Map(),listeners={};
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
 const context=vm.createContext({console,Date,Math:Object.create(Math),document,localStorage,setTimeout(){},clearTimeout(){},setInterval(){}});
 vm.runInContext(gameCode,context);
 vm.runInContext('render=()=>{};showToast=()=>{};Math.random=()=>0.99;isMonsterEventActive=()=>false;isXpEventActive=()=>false;',context);
 vm.runInContext(saveCode,context);
 const run=s=>vm.runInContext(s,context);
 return {run,storage,document,close(){for(const card of [...cards])card.querySelector(card.id==='forest-event-result'?'button':'.notif-continue').click();}};
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
test('checkpoint refuses combat and unconfirmed attribute drafts; reload rolls back entire encounter',()=>{
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
 const bracelet=e.run('JSON.stringify(old.player.equipment.bracelet)'),ring=e.run('JSON.stringify(old.player.equipment.accessory)');
 let loaded=boot(e.storage);loaded.run('continueSavedGame()');
 assert.equal(loaded.run('SAVE_SCHEMA_VERSION'),2);
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
