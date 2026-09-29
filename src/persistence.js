/* Persistência local de checkpoints. Script clássico, carregado após game.js. */
const SAVE_KEY='a-ultima-lua.checkpoint';
const SAVE_SCHEMA_VERSION=2;
let saveNotice='';
let saveActionDepth=0;
let saveReplacementApproved=false;
let lastSavedPayload=null;

function normalizeCheckpoint(input){
  if(!input || typeof input!=='object' || ![0,1,SAVE_SCHEMA_VERSION].includes(input.schemaVersion)) throw new Error('Schema incompatível');
  const data=JSON.parse(JSON.stringify(input));
  const p=data.player;
  const object=value=>value && typeof value==='object' && !Array.isArray(value);
  if(!object(p) || !Object.prototype.hasOwnProperty.call(CLASSES,p.classKey) ||
    !Number.isInteger(p.level) || p.level<1 || !Number.isFinite(p.totalXp) || p.totalXp<0 ||
    !Array.isArray(p.inventory) || !object(p.equipment) || !object(p.allocated) ||
    !object(p.consumables) || !Array.isArray(p.defeatedBosses)) throw new Error('Personagem inválido');
  for(const key of ['hp','hpMax','mp','mpMax','statPoints','coins','xp','atk','def','magia','agilidade']){
    if(!Number.isFinite(p[key]) || p[key]<0) throw new Error('Atributo inválido');
  }
  if(p.hpMax<=0 || p.hp<=0 || p.hp>p.hpMax || p.mp>p.mpMax) throw new Error('Checkpoint inseguro');
  for(const key of ['forca','defesa','vitalidade','espirito','magia','agilidade']){
    if(!Number.isInteger(p.allocated[key]) || p.allocated[key]<0) throw new Error('Pontos inválidos');
  }
  if(p.defeatedBosses.some(id=>!Number.isInteger(id)||id<0||id>=MAPS.length)) throw new Error('Chefes inválidos');
  if(Object.values(p.consumables).some(n=>!Number.isInteger(n)||n<0))throw new Error('Consumíveis inválidos');
  for(const key of ['forestProgress','swampProgress']){
    if(p[key]!==undefined && (!object(p[key]) || !Number.isInteger(p[key].commonKills) || p[key].commonKills<0))throw new Error('Progressão inválida');
  }
  const ids=new Set();
  let next=1;
  for(const item of [...p.inventory,...Object.values(p.equipment).filter(Boolean)]){
    if(!object(item) || typeof item.uid!=='string' || !item.uid || ids.has(item.uid) ||
      typeof item.name!=='string' || !Object.prototype.hasOwnProperty.call(SLOT_META,item.slot)) throw new Error('Item inválido ou uid repetido');
    if(item.affixes!==undefined && (!Array.isArray(item.affixes) || item.affixes.some(a=>!object(a)||typeof a.key!=='string'||!Number.isFinite(a.value))))throw new Error('Afixos inválidos');
    if(item.statReq!==undefined && (!object(item.statReq)||Object.values(item.statReq).some(n=>!Number.isFinite(n)||n<0)))throw new Error('Requisitos inválidos');
    for(const key of ['atk','def','hp','mp','magia','agi','value']){
      if(item[key]!==undefined && !Number.isFinite(item[key])) throw new Error('Valor de item inválido');
    }
    ids.add(item.uid);
    const match=/^it(\d+)$/.exec(item.uid);
    if(match){const n=Number(match[1]);if(!Number.isSafeInteger(n)||n>=Number.MAX_SAFE_INTEGER-1)throw new Error('uid inválido');next=Math.max(next,n+1);}
  }
  // Migração v2: mover a instância inteira uma única vez, sem recriar o item.
  const bracelet=p.equipment.bracelet;
  if(bracelet){
    p.inventory.push(bracelet);
    for(const [stat,bonus] of [['atk','atk'],['def','def'],['hpMax','hp'],['mpMax','mp'],['magia','magia'],['agilidade','agi']]){
      p[stat]-=bracelet[bonus]||0;
    }
    p.hp=Math.min(p.hp,p.hpMax);p.mp=Math.min(p.mp,p.mpMax);
  }
  delete p.equipment.bracelet;
  for(const slot of SLOT_ORDER) if(p.equipment[slot]===undefined)p.equipment[slot]=null;
  for(const key of ['questItems','materials','recipePity','forgeProgress'])if(!object(p[key]))p[key]={};
  if(!Array.isArray(p.knownRecipes))p.knownRecipes=[];
  // Checkpoints não restauram cenas. Schema 0 é o envelope de importação/normalização.
  if(p.romarDiscoveries && p.romarDiscoveries.pending)throw new Error('Cena pendente');
  const state=object(data.world)?data.world:{};
  const safeSeq=Number.isSafeInteger(data.itemSeq)&&data.itemSeq>0?data.itemSeq:1;
  return {schemaVersion:SAVE_SCHEMA_VERSION,player:p,itemSeq:Math.max(next,safeSeq),
    world:{forestEventCooldown:Number.isInteger(state.forestEventCooldown)&&state.forestEventCooldown>=0?state.forestEventCooldown:0,
      lastForestEventId:FOREST_EVENTS.some(e=>e.id===state.lastForestEventId)?state.lastForestEventId:null}};
}
function readCheckpoint(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw)return null;
    return normalizeCheckpoint(JSON.parse(raw));
  }catch(error){saveNotice='Não foi possível carregar o save local. O arquivo armazenado foi preservado.';return null;}
}
function isSafeCheckpoint(){
  return !!player && player.hp>0 && !ui.inBattle && !ui.locked && !ui.monster &&
    !ui.romarResult && !hasPendingRomarDiscovery() && !pendingForestEvent &&
    document.querySelectorAll('.interactive-card').length===0;
}
function requestCheckpoint(){
  if(saveActionDepth || !isSafeCheckpoint())return false;
  try{
    const checkpoint=normalizeCheckpoint({schemaVersion:SAVE_SCHEMA_VERSION,player,itemSeq:ui.itemSeq,
      world:{forestEventCooldown,lastForestEventId}});
    const payload=JSON.stringify(checkpoint);
    if(payload!==lastSavedPayload){localStorage.setItem(SAVE_KEY,payload);lastSavedPayload=payload;}
    saveNotice='';
    return true;
  }catch(error){
    saveNotice='Não foi possível salvar neste navegador. O último checkpoint permanece preservado.';
    if(typeof localStorage!=='undefined')showToast(saveNotice);
    return false;
  }
}
function continueSavedGame(){
  if(player)return false;
  const checkpoint=readCheckpoint();
  if(!checkpoint){renderSaveEntry();return false;}
  player=checkpoint.player;
  Object.assign(ui,{tab:'mapa',mapIndex:null,monster:null,inBattle:false,locked:false,skillCooldowns:{},buffs:{},
    romarResult:null,selectedEquipSlot:null,itemSeq:checkpoint.itemSeq,gameStart:Date.now(),
    pendingAlloc:{forca:0,defesa:0,vitalidade:0,espirito:0,magia:0,agilidade:0}});
  pendingForestEvent=null;forestEventCooldown=checkpoint.world.forestEventCooldown;
  lastForestEventId=checkpoint.world.lastForestEventId;
  battleLog=[];
  document.getElementById('title-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  lastSavedPayload=null;
  render();requestCheckpoint();return true;
}
function renderSaveEntry(){
  const saved=readCheckpoint();
  if(!saved){renderClassSelect();if(saveNotice)document.getElementById('class-select').insertAdjacentHTML('beforeend','<p>'+saveNotice+'</p>');return;}
  document.getElementById('class-select').innerHTML='<div class="class-card"><h3>Personagem salvo</h3><p>Nível '+saved.player.level+' · '+CLASSES[saved.player.classKey].name+'</p><button class="pick-btn" onclick="continueSavedGame()">CONTINUAR</button><button class="pick-btn" onclick="requestNewGame()">NOVO JOGO</button></div>';
}
function requestNewGame(){
  if(player)return;
  document.getElementById('class-select').innerHTML='<div class="class-card"><h3>Substituir o personagem salvo?</h3><p>Ao escolher uma nova classe, seu personagem anterior será substituído. Essa ação não pode ser desfeita.</p><button class="pick-btn" onclick="confirmNewGame()">CONFIRMAR NOVO JOGO</button><button class="pick-btn" onclick="cancelNewGame()">CANCELAR</button></div>';
}
function confirmNewGame(){
  if(player)return;
  saveReplacementApproved=true;renderClassSelect();
  document.getElementById('class-select').insertAdjacentHTML('beforeend','<button class="pick-btn" onclick="cancelNewGame()">CANCELAR</button>');
}
function cancelNewGame(){saveReplacementApproved=false;renderSaveEntry();}

/* Hooks explícitos: nunca salvar em render, em animações ou a cada frame.
   O depth impede que uma rotina interna confirme metade de uma operação externa. */
function checkpointAction(action,before=false){
  return function(...args){
    if(before && !saveActionDepth)requestCheckpoint();
    saveActionDepth++;
    let completed=false;
    try{const result=action.apply(this,args);completed=true;return result;}
    finally{saveActionDepth--;if(completed && !saveActionDepth)requestCheckpoint();}
  };
}
const chooseClassWithoutSave=chooseClass;
chooseClass=function(key){
  if(player || !Object.prototype.hasOwnProperty.call(CLASSES,key))return;
  if(readCheckpoint() && !saveReplacementApproved){renderSaveEntry();return;}
  chooseClassWithoutSave(key);saveReplacementApproved=false;lastSavedPayload=null;requestCheckpoint();
};
explorarMapa=checkpointAction(explorarMapa,true);
startBattle=checkpointAction(startBattle,true);
startRomarEncounter=checkpointAction(startRomarEncounter,true);
handleVictory=checkpointAction(handleVictory);
handleDefeat=checkpointAction(handleDefeat);
fleeBattle=checkpointAction(fleeBattle);
finishRomarDiscovery=checkpointAction(finishRomarDiscovery);
continueRomarResult=checkpointAction(continueRomarResult);
chooseRomarFirst=checkpointAction(chooseRomarFirst);
resolveForestEvent=checkpointAction(resolveForestEvent);
equipItem=checkpointAction(equipItem);
unequipItem=checkpointAction(unequipItem);
sellItem=checkpointAction(sellItem);
confirmAlloc=checkpointAction(confirmAlloc);
resetAllocatedStats=checkpointAction(resetAllocatedStats);
chooseMagDomain=checkpointAction(chooseMagDomain);
usarConsumivelFora=checkpointAction(usarConsumivelFora);
usarTonicoFuria=checkpointAction(usarTonicoFuria);
descansar=checkpointAction(descansar);
buyShopItem=checkpointAction(buyShopItem);
buyBaseGear=checkpointAction(buyBaseGear);

// O click propaga depois do listener que remove o card. Só persistimos confirmações.
document.addEventListener('click',event=>{
  const target=event.target;
  if(target && typeof target.closest==='function' && target.closest('.notif-continue, .event-result-card button'))requestCheckpoint();
});
renderSaveEntry();
