
// Última Lua — Vertical Slice 1.18 — Atributos e Domínio Arcano
// Última Lua — Vertical Slice 1.1 (playtest)
/* =========================================================
   DADOS DO JOGO
   ========================================================= */
const CLASSES = {
  mago:      { name:'Mago',      emoji:'🧙', tag:'Poder Arcano · Conjurador Lunar · Mago de Batalha', portrait:'assets/images/classes/mago.jpg',
               baseHp:55, baseAtk:14, baseDef:3,  baseMp:40, baseMagia:16, baseAgi:3,  hpG:9,  atkG:3.4, defG:0.9, mpG:4.2, magiaG:3.6, agiG:0.3 },
  arqueiro:  { name:'Arqueiro',  emoji:'🏹', tag:'Precisão letal à distância', portrait:'assets/images/classes/arqueiro.jpg',
               baseHp:70, baseAtk:11, baseDef:5,  baseMp:25, baseMagia:2, baseAgi:10, hpG:11, atkG:2.9, defG:1.4, mpG:2.6, magiaG:0.3, agiG:1.8 },
  guerreiro: { name:'Guerreiro', emoji:'⚔️', tag:'Aço e sangue na linha de frente', portrait:'assets/images/classes/guerreiro.jpg',
               baseHp:95, baseAtk:9,  baseDef:8,  baseMp:15, baseMagia:1, baseAgi:5,  hpG:14, atkG:2.3, defG:2.1, mpG:1.6, magiaG:0.2, agiG:0.8 },
  cavaleiro: { name:'Cavaleiro', emoji:'🛡️', tag:'Escudo e fé contra a escuridão', portrait:'assets/images/classes/cavaleiro.jpg',
               baseHp:105, baseAtk:7, baseDef:12, baseMp:20, baseMagia:1, baseAgi:4,  hpG:15, atkG:1.9, defG:2.8, mpG:2.0, magiaG:0.2, agiG:0.6 },
};

const SKILL_COOLDOWN_TURNS = 2;
const CRIT_BASE_CHANCE = 0.15;
const CRIT_MULT = 1.75;

const SKILLS = {
  mago: [
    { id:'bola_fogo',      name:'Bola de Fogo',      icon:'🔥', unlockLevel:1, mpCost:8,  mult:1.8, desc:'Fogo arcano lançado no inimigo.' },
    { id:'toque_sombrio',  name:'Toque Sombrio',     icon:'✨', unlockLevel:3, mpCost:10, heal:true, healMult:1.1, desc:'Absorve energia vital das sombras e recupera HP.' },
    { id:'explosao_arcana',name:'Explosão Arcana',   icon:'💥', unlockLevel:5, mpCost:18, mult:2.6, desc:'Uma detonação de energia pura.' },
  ],
  arqueiro: [
    { id:'tiro_certeiro',  name:'Tiro Certeiro',     icon:'🎯', unlockLevel:1, mpCost:6,  mult:1.6, desc:'Uma flecha precisa que raramente erra.' },
    { id:'foco_predador',  name:'Foco Predador',     icon:'👁️', unlockLevel:3, mpCost:9,  buff:'crit', buffBonus:0.25, buffTurns:3, desc:'+25% de chance crítica por 3 turnos.' },
    { id:'chuva_flechas',  name:'Chuva de Flechas',  icon:'🏹', unlockLevel:5, mpCost:14, mult:2.2, desc:'Várias flechas em sequência.' },
  ],
  guerreiro: [
    { id:'investida',          name:'Investida',          icon:'🐎', unlockLevel:1, mpCost:5,  mult:1.5, lifesteal:0.2, desc:'Avanço brutal que rouba um pouco de vida.' },
    { id:'grito_de_guerra',    name:'Grito de Guerra',    icon:'📣', unlockLevel:3, mpCost:9,  buff:'atk', buffMult:1.3, buffTurns:3, desc:'+30% de Força por 3 turnos.' },
    { id:'golpe_devastador',   name:'Golpe Devastador',   icon:'🪓', unlockLevel:5, mpCost:12, mult:2.4, defPierce:0.4, desc:'Ignora parte da defesa inimiga.' },
  ],
  cavaleiro: [
    { id:'golpe_da_fe',        name:'Golpe da Fé',        icon:'✝️', unlockLevel:1, mpCost:5,  mult:1.4, desc:'Um golpe abençoado com a espada.' },
    { id:'postura_defensiva',  name:'Postura Defensiva',  icon:'🛡️', unlockLevel:3, mpCost:10, buff:'def', buffMult:1.25, buffTurns:2, desc:'+25% de Defesa por 2 turnos.' },
    { id:'julgamento_sagrado', name:'Julgamento Sagrado', icon:'⚡', unlockLevel:5, mpCost:14, mult:2.1, defPierce:0.3, lifesteal:0.15, desc:'Fé pura que fere e restaura HP.' },
  ],
};

const CLASS_KEYS = ['mago','arqueiro','guerreiro','cavaleiro'];

const SLOT_META = {
  weapon:   { label:'Arma',      icon:'🗡️' },
  armor:    { label:'Peitoral',  icon:'🛡️' },
  shield:   { label:'Mão Secundária/Escudo',    icon:'🔰' },
  helmet:   { label:'Cabeça',      icon:'⛑️' },
  boots:    { label:'Botas',     icon:'🥾' },
  gloves:   { label:'Mãos',     icon:'🧤' },
  accessory:{ label:'Anel',      icon:'💍' },
  earring:  { label:'Brincos',    icon:'👂' },
  legs:     { label:'Pernas', icon:'🦵' },
  bracelet: { label:'Bracelete', icon:'📿' },
  necklace: { label:'Amuleto',     icon:'🔗' },
};
const CLASS_SLOTS = ['weapon','armor','shield','helmet','boots','gloves','legs'];
const UNIVERSAL_SLOTS = ['accessory','earring','necklace'];
const SLOT_ORDER = [...CLASS_SLOTS, ...UNIVERSAL_SLOTS];
// Pernas ainda não possui conteúdo; braceletes permanecem apenas como legado vendável.
const DROP_SLOTS = SLOT_ORDER.filter(slot=>slot!=='legs');

const CLASS_LABEL = { mago:'Mago', arqueiro:'Arqueiro', guerreiro:'Guerreiro', cavaleiro:'Cavaleiro' };

/* Tipos de arma por classe: cada uma tem um foco de status e se ocupa as duas mãos (bloqueia escudo) */
const WEAPON_TYPES = {
  mago:      [ { id:'varinha', name:'Varinha',            twoHanded:false, focus:'magia', mult:1.0 },
               { id:'cajado',  name:'Cajado de Duas Mãos',twoHanded:true,  focus:'magia', mult:1.6 } ],
  arqueiro:  [ { id:'arco',    name:'Arco',                twoHanded:false, focus:'atk', mult:1.0 },
               { id:'pistola', name:'Pistola',             twoHanded:false, focus:'agi', mult:0.7, secondaryFocus:'atk', secondaryMult:0.5 } ],
  guerreiro: [ { id:'espada',  name:'Espada',              twoHanded:false, focus:'atk', mult:0.85, secondaryFocus:'agi', secondaryMult:0.4 },
               { id:'martelo', name:'Martelo de Guerra',   twoHanded:true,  focus:'atk', mult:1.6 } ],
  cavaleiro: [ { id:'espada_sagrada', name:'Espada Sagrada', twoHanded:false, focus:'atk', mult:1.0 } ],
};

/* Requisito de status para equipar itens de classe, escalando com raridade e mapa.
   Chaves batem com as propriedades reais do jogador: atk=Força, def=Defesa, magia, agilidade */
const REQ_BASE = { comum:4, raro:10, épico:18, lendário:30 };
const REQ_LABELS = { atk:'Força', def:'Defesa', magia:'Magia', agilidade:'Agilidade' };
function buildStatReq(classReq, rarity, mapIndex){
  if(!classReq) return {};
  const base = REQ_BASE[rarity] * (1 + mapIndex*0.3);
  if(classReq==='mago')      return { magia: Math.round(base) };
  if(classReq==='guerreiro') return { atk: Math.round(base) };
  if(classReq==='cavaleiro') return { def: Math.round(base*0.8), atk: Math.round(base*0.5) };
  if(classReq==='arqueiro')  return { atk: Math.round(base*0.7), agilidade: Math.round(base*0.6) };
  return {};
}

const RARITIES = ['comum','raro','épico','lendário'];
const RARITY_MULT = { comum:1, raro:1.9, épico:3.2, lendário:5.5 };
const RARITY_PREFIX = {
  comum:      ['Gasta','Simples','Rústica','de Batedor'],
  raro:       ['Rúnica','Sombria','do Caçador Noturno','de Presas Afiadas'],
  épico:      ['Amaldiçoada','Ancestral','das Trevas Antigas','de Garras Negras'],
  lendário:   ['do Lorde Vampiro','Imortal','da Matilha Alfa','do Fim da Lua'],
};

/* VS 1.5 — Identidade de itens: raridades altas ganham propriedades que mudam a build. */
const AFFIX_POOL = [
  { key:'crit', label:'Precisão Mortal', slots:['weapon','gloves','accessory','earring','bracelet','necklace'], min:.03, max:.07, fmt:v=>`+${Math.round(v*100)}% Crítico` },
  { key:'dodge', label:'Passo Sombrio', slots:['boots','armor','accessory','earring','bracelet'], min:.02, max:.06, fmt:v=>`+${Math.round(v*100)}% Esquiva` },
  { key:'lifesteal', label:'Sede de Sangue', slots:['weapon','gloves','accessory','necklace'], min:.03, max:.08, fmt:v=>`${Math.round(v*100)}% Roubo de Vida` },
  { key:'damageReduction', label:'Pele de Ferro', slots:['armor','shield','helmet','necklace'], min:.03, max:.08, fmt:v=>`-${Math.round(v*100)}% Dano recebido` },
  { key:'execute', label:'Caçador Ferido', slots:['weapon','gloves','bracelet'], min:.08, max:.16, fmt:v=>`+${Math.round(v*100)}% dano contra inimigos abaixo de 35% HP` },
  /* VS 1.13 — afixos arcanos: criam caminhos de build para o Mago */
  { key:'magicDamage', label:'Poder Arcano', slots:['weapon','gloves','earring','necklace'], min:.04, max:.10, fmt:v=>`+${Math.round(v*100)}% Dano Mágico` },
  { key:'manaEfficiency', label:'Condução Lunar', slots:['weapon','armor','helmet','accessory','necklace'], min:.04, max:.10, fmt:v=>`-${Math.round(v*100)}% Custo de MP` },
  { key:'lowHpMagic', label:'Ritual de Sangue', slots:['weapon','armor','gloves','bracelet'], min:.08, max:.18, fmt:v=>`+${Math.round(v*100)}% Dano Mágico abaixo de 40% HP` },
];
function addItemAffixes(item){
  const count = item.rarity==='lendário' ? 2 : item.rarity==='épico' ? 1 : (item.rarity==='raro' && Math.random()<0.35 ? 1 : 0);
  item.affixes = [];
  let pool = AFFIX_POOL.filter(a=>a.slots.includes(item.slot));
  for(let i=0;i<count && pool.length;i++){
    const idx=Math.floor(Math.random()*pool.length), a=pool.splice(idx,1)[0];
    const rarityBoost = item.rarity==='lendário' ? 1.35 : item.rarity==='épico' ? 1.0 : .75;
    const value=(a.min+Math.random()*(a.max-a.min))*rarityBoost;
    item.affixes.push({key:a.key,label:a.label,value});
  }
}
function equippedAffixTotal(key){
  return SLOT_ORDER.reduce((sum,slot)=>{
    const it=player.equipment[slot];
    return sum + (it&&it.affixes ? it.affixes.filter(a=>a.key===key).reduce((x,a)=>x+a.value,0) : 0);
  },0);
}
function affixDesc(a){
  const def=AFFIX_POOL.find(x=>x.key===a.key);
  return def ? def.fmt(a.value) : a.label;
}

const SLOT_BASE_STATS = {
  weapon:    { atk:4 },
  gloves:    { atk:2 },
  armor:     { def:3, hp:8 },
  shield:    { def:4 },
  helmet:    { def:2, hp:4 },
  boots:     { def:2, hp:2, agi:1 },
  accessory: { atk:2, def:2, hp:4 },
  earring:   { magia:2, hp:3 },
  bracelet:  { atk:2, agi:2 },
  necklace:  { def:2, hp:4 },
};

const MAPS = [
  {
    name:'Floresta Uivante', sub:'Território dos lobos e lobisomens', theme:'🐺', fam:'fam-lobo',
    unlockLevel:1,
    monsters:[
      { id:'lobo_selvagem', name:'Lobo Selvagem', emoji:'🐺', portrait:'assets/images/enemies/forest/lobo_selvagem.jpg', hp:30, atk:6,  def:2, xp:12, coinMin:4,  coinMax:8,  tier:0 },
      { id:'lobo_cinzento',  name:'Lobo Cinzento', emoji:'🐺', portrait:'assets/images/enemies/forest/lobo_cinzento.jpg', hp:42, atk:8,  def:3, xp:18, coinMin:6,  coinMax:10, tier:1 },
      { id:'lobisomem_jovem',name:'Lobisomem Jovem', emoji:'🐾', portrait:'assets/images/enemies/forest/lobisomem_jovem.jpg', hp:58, atk:11, def:4, xp:26, coinMin:8,  coinMax:14, tier:2 },
      { id:'lobisomem_feroz', name:'Lobisomem Feroz', emoji:'🐾', portrait:'assets/images/enemies/forest/lobisomem_feroz.jpg', hp:75, atk:14, def:6, xp:35, coinMin:10, coinMax:18, tier:3 },
    ],
    boss:{ id:'alfa_matilha', name:'Alfa da Matilha', emoji:'🐺', portrait:'assets/images/enemies/forest/alfa_matilha.jpg', hp:300, atk:30, def:14, xp:130, coinMin:40, coinMax:60, isBoss:true },
    miniBoss:{ id:'uivante_sombras', name:'Uivante das Sombras', emoji:'🐺', portrait:'assets/images/enemies/forest/uivante_sombras.jpg', hp:190, atk:25, def:12, xp:85, coinMin:20, coinMax:30, isMiniBoss:true },
  },
  {
    name:'Pântano Podre', sub:'Domínio dos trolls e ogros', theme:'🧌', fam:'fam-troll',
    unlockLevel:5,
    monsters:[
      { id:'troll_lodo',     name:'Troll do Lodo', emoji:'🧌', portrait:'assets/images/enemies/swamp/troll_lodo.jpg', hp:95,  atk:16, def:7,  xp:45, coinMin:14, coinMax:22, tier:0 },
      { id:'troll_apodrecido',name:'Troll Apodrecido', emoji:'🧌', portrait:'assets/images/enemies/swamp/troll_apodrecido.jpg', hp:115, atk:19, def:9,  xp:55, coinMin:16, coinMax:26, tier:1 },
      { id:'ogro_menor',     name:'Ogro Menor', emoji:'👹', portrait:'assets/images/enemies/swamp/ogro_menor.jpg', hp:135, atk:22, def:10, xp:65, coinMin:20, coinMax:30, tier:2 },
      { id:'ogro_guerra',    name:'Ogro de Guerra', emoji:'👹', portrait:'assets/images/enemies/swamp/ogro_guerra.jpg', hp:160, atk:26, def:12, xp:78, coinMin:24, coinMax:36, tier:3 },
    ],
    boss:{ id:'senhor_pantano', name:'Senhor do Pântano', emoji:'🧌', portrait:'assets/images/enemies/swamp/senhor_pantano.jpg', hp:520, atk:52, def:24, xp:220, coinMin:80, coinMax:120, isBoss:true },
    miniBoss:{ id:'devorador_charco', name:'Devorador do Charco', emoji:'🧌', portrait:'assets/images/enemies/swamp/devorador_charco.jpg', hp:280, atk:40, def:18, xp:140, coinMin:45, coinMax:65, isMiniBoss:true },
  },
  {
    name:'Trincheiras Orc', sub:'Acampamento de guerra orc', theme:'👺', fam:'fam-orc',
    unlockLevel:9,
    monsters:[
      { id:'orc_batedor',  name:'Orc Batedor', emoji:'👺', portrait:'assets/images/enemies/trenches/orc_batedor.jpg', hp:190, atk:30, def:14, xp:95,  coinMin:30, coinMax:45, tier:0 },
      { id:'orc_guerreiro',name:'Orc Guerreiro', emoji:'👺', portrait:'assets/images/enemies/trenches/orc_guerreiro.jpg', hp:220, atk:35, def:16, xp:110, coinMin:35, coinMax:50, tier:1 },
      { id:'orc_xama',     name:'Orc Xamã', emoji:'💀', portrait:'assets/images/enemies/trenches/orc_xama.jpg', hp:200, atk:40, def:13, xp:120, coinMin:38, coinMax:55, tier:2 },
      { id:'orc_capitao',  name:'Orc Capitão', emoji:'👺', portrait:'assets/images/enemies/trenches/orc_capitao.jpg', hp:260, atk:44, def:19, xp:135, coinMin:44, coinMax:64, tier:3 },
    ],
    boss:{ id:'warlord_gorthak', name:'Warlord Gorthak', emoji:'👺', portrait:'assets/images/enemies/trenches/warlord_gorthak.jpg', hp:625, atk:67, def:29, xp:300, coinMin:150, coinMax:220, isBoss:true },
    miniBoss:{ id:'acougueiro_trincheira', name:'Açougueiro da Trincheira', emoji:'👺', portrait:'assets/images/enemies/trenches/acougueiro_trincheira.jpg', hp:460, atk:68, def:30, xp:240, coinMin:75, coinMax:105, isMiniBoss:true },
  },
  {
    name:'Cripta Sangrenta', sub:'Trono dos vampiros ancestrais', theme:'🧛', fam:'fam-vampiro',
    unlockLevel:13,
    monsters:[
      { id:'servo_vampirico', name:'Servo Vampírico', emoji:'🧛', portrait:'assets/images/enemies/crypt/servo_vampirico.jpg', hp:300, atk:52, def:22, xp:170, coinMin:60, coinMax:85,  tier:0 },
      { id:'noiva_palida',    name:'Noiva Pálida', emoji:'🧛‍♀️', portrait:'assets/images/enemies/crypt/noiva_palida.jpg', hp:340, atk:58, def:24, xp:190, coinMin:68, coinMax:95,  tier:1 },
      { id:'cavaleiro_noite', name:'Cavaleiro da Noite', emoji:'🧛', portrait:'assets/images/enemies/crypt/cavaleiro_noite.jpg', hp:390, atk:64, def:28, xp:215, coinMin:78, coinMax:108, tier:2 },
      { id:'vampiro_anciao',  name:'Vampiro Ancião', emoji:'🧛', portrait:'assets/images/enemies/crypt/vampiro_anciao.jpg', hp:450, atk:72, def:32, xp:245, coinMin:90, coinMax:125, tier:3 },
    ],
    boss:{ id:'lorde_draven', name:'Lorde Draven', emoji:'🧛‍♂️', portrait:'assets/images/enemies/crypt/lorde_draven.jpg', hp:1080, atk:114, def:48, xp:600, coinMin:300, coinMax:450, isBoss:true },
    miniBoss:{ id:'arauto_draven', name:'Arauto de Draven', emoji:'🧛', portrait:'assets/images/enemies/crypt/arauto_draven.jpg', hp:780, atk:110, def:45, xp:420, coinMin:160, coinMax:220, isMiniBoss:true },
  },
];


/* VS 1.6 — artes aprovadas de equipamentos e consumíveis */
const ITEM_ART = {
  necklace: 'assets/images/equipment/necklace.jpg',
  sword_cavalier: 'assets/images/equipment/sword_cavalier.jpg',
  ring: 'assets/images/equipment/ring.jpg',
  wand: 'assets/images/equipment/wand.jpg',
  pistol: 'assets/images/equipment/pistol.jpg',
  staff: 'assets/images/equipment/staff.jpg',
  bracelet: 'assets/images/equipment/bracelet.jpg',
  hp_medium: 'assets/images/consumables/hp_medium.jpg',
  hp_small: 'assets/images/consumables/hp_small.jpg',
  hammer_unique: 'assets/images/equipment/hammer_unique.jpg',
  mp_medium: 'assets/images/consumables/mp_medium.jpg',
  mp_large: 'assets/images/consumables/mp_large.jpg',
  hammer: 'assets/images/equipment/hammer.jpg',
  hp_large: 'assets/images/consumables/hp_large.jpg',
  orb: 'assets/images/equipment/orb.jpg',
  armor: 'assets/images/equipment/armor.jpg',
  earring: 'assets/images/equipment/earring.jpg',
  helmet: 'assets/images/equipment/helmet.jpg',
  mp_small: 'assets/images/consumables/mp_small.jpg',
  sword_warrior: 'assets/images/equipment/sword_warrior.jpg',
  bow_unique: 'assets/images/equipment/bow_unique.jpg',
  gloves: 'assets/images/equipment/gloves.jpg',
  boots: 'assets/images/equipment/boots.jpg',
  xp_tonic: 'assets/images/consumables/xp_tonic.jpg',
  sword_unique: 'assets/images/equipment/sword_unique.jpg',
  shield: 'assets/images/equipment/shield.jpg',
  bow: 'assets/images/equipment/bow.jpg',
};
function artImg(src, cls, alt=''){ return src ? `<img src="${src}" class="${cls}" alt="${alt}">` : ''; }
function itemArtFor(item){
  if(item.artKey && ITEM_ART[item.artKey]) return ITEM_ART[item.artKey];
  const slot=item.slot;
  if(slot==='armor') return ITEM_ART.armor; if(slot==='helmet') return ITEM_ART.helmet; if(slot==='boots') return ITEM_ART.boots; if(slot==='gloves') return ITEM_ART.gloves;
  if(slot==='accessory') return ITEM_ART.ring; if(slot==='earring') return ITEM_ART.earring; if(slot==='bracelet') return ITEM_ART.bracelet; if(slot==='necklace') return ITEM_ART.necklace;
  if(slot==='shield') return item.classReq==='mago' ? ITEM_ART.orb : ITEM_ART.shield;
  return '';
}

const SHOP_ITEMS = [
  { id:'hp',  name:'Poção de Sangue Vivo',        icon:'🧪', desc:'Restaura 50 de HP ao usar.', price:15, type:'consumable_hp' },
  { id:'hp_medium', name:'Poção de Sangue Rubro', icon:'🧪', desc:'Restaura 120 de HP ao usar.', price:45, type:'consumable_hp_medium' },
  { id:'hp_major', name:'Poção de Sangue Ancestral', icon:'🧪', desc:'Restaura 250 de HP ao usar.', price:110, type:'consumable_hp_major' },
  { id:'mp',  name:'Frasco de Éter Lunar', icon:'💧', desc:'Restaura 30 de MP ao usar.', price:18, type:'consumable_mp' },
  { id:'mp_medium', name:'Essência de Éter Lunar', icon:'💧', desc:'Restaura 70 de MP ao usar.', price:50, type:'consumable_mp_medium' },
  { id:'mp_major', name:'Éter Lunar Concentrado', icon:'💧', desc:'Restaura 150 de MP ao usar.', price:120, type:'consumable_mp_major' },
];

/* Equipamentos base (universais, sem classe/requisito) vendidos pelo ferreiro a partir do 4º mapa */
const FERREIRO_GEAR_UNLOCK_MAP = 3; // índice do 4º mapa
const FERREIRO_BASE_GEAR = [
  { slot:'earring', name:'Brinco de Osso Polido', icon:'👂', artKey:'earring', magia:3, hp:5, price:120 },
  { slot:'necklace', name:'Colar de Presas', icon:'🔗', artKey:'necklace', def:3, hp:6, price:120 },
  { slot:'accessory', name:'Anel de Ferro Rúnico', icon:'💍', artKey:'ring', atk:2, def:2, hp:4, price:130 },
];

function buyBaseGear(idx){
  const tmpl = FERREIRO_BASE_GEAR[idx];
  if(!tmpl || player.coins < tmpl.price) return;
  player.coins -= tmpl.price;
  const item = {
    uid: 'it'+(ui.itemSeq++), slot:tmpl.slot, rarity:'comum', classReq:null,
    atk:tmpl.atk||0, def:tmpl.def||0, hp:tmpl.hp||0, magia:tmpl.magia||0, agi:tmpl.agi||0,
    twoHanded:false, levelReq:0, statReq:{},
    name: tmpl.name, artKey:tmpl.artKey||null, value: Math.round(tmpl.price*0.4),
  };
  assignSalvageProfile(item);
  player.inventory.push(item);
  player.newItemCount = (player.newItemCount||0) + 1;
  showToast(`${tmpl.name} comprado.`);
  render();
}

/* =========================================================
   ESTADO
   ========================================================= */
let player = null;
let ui = {
  tab:'mapa', mapIndex:null, monster:null, inBattle:false, itemSeq:1, locked:false,
  skillCooldowns:{}, buffs:{}, gameStart: Date.now(),
  pendingAlloc:{ forca:0, defesa:0, vitalidade:0, espirito:0, magia:0, agilidade:0 },
  selectedEquipSlot: null,
};

// VS 1.5 — progressão deliberadamente lenta: subir de nível exige constância, sem transformar cada etapa em grind excessivo.
const EXP_DIFFICULTY_MULT = 3.6;
function xpToNext(level){ return Math.round((35 + level*26) * EXP_DIFFICULTY_MULT); }

const DEATH_XP_PENALTY = 0.35; // perde 35% do XP total acumulado ao morrer

/* ---- Eventos globais por tempo: se alternam num único ciclo, nunca simultâneos ----
   Um evento COMEÇA a cada 15 min, alternando tipo. Duração de cada um continua 3 min.
   Linha do tempo (repete a cada 30 min):
   0-3min     Onda Sombria ativa
   3-15min    intervalo (12 min)
   15-18min   Bênção da Lua Cheia ativa
   18-30min   intervalo (12 min) */
const EVENT_DURATION = 3*60*1000;        // 3 min de duração cada evento
const TONIC_XP_DURATION = 5*60*1000;     // 5 min de duração do Tônico da Fúria da Caçada
const EVENT_START_INTERVAL = 15*60*1000; // intervalo entre o INÍCIO de um evento e o início do próximo
const MONSTER_EVENT_START = 0;
const MONSTER_EVENT_END = MONSTER_EVENT_START + EVENT_DURATION;
const XP_EVENT_START = EVENT_START_INTERVAL;
const XP_EVENT_END = XP_EVENT_START + EVENT_DURATION;
const EVENT_CYCLE = EVENT_START_INTERVAL * 2;

function eventElapsed(){ return (Date.now() - ui.gameStart) % EVENT_CYCLE; }

function isMonsterEventActive(){
  const e = eventElapsed();
  return e >= MONSTER_EVENT_START && e < MONSTER_EVENT_END;
}
function isXpEventActive(){
  const e = eventElapsed();
  return e >= XP_EVENT_START && e < XP_EVENT_END;
}
function msToClock(ms){
  const s = Math.max(0, Math.ceil(ms/1000));
  const m = Math.floor(s/60);
  const r = (s%60).toString().padStart(2,'0');
  return `${m}:${r}`;
}
function monsterEventTimeInfo(){
  const e = eventElapsed();
  if(e < MONSTER_EVENT_END) return { active:true, remaining: MONSTER_EVENT_END - e };
  return { active:false, remaining: EVENT_CYCLE - e + MONSTER_EVENT_START };
}
function xpEventTimeInfo(){
  const e = eventElapsed();
  if(e >= XP_EVENT_START && e < XP_EVENT_END) return { active:true, remaining: XP_EVENT_END - e };
  if(e < XP_EVENT_START) return { active:false, remaining: XP_EVENT_START - e };
  return { active:false, remaining: EVENT_CYCLE - e + XP_EVENT_START };
}

function totalXpForLevel(level){
  let sum = 0;
  for(let l=1; l<level; l++) sum += xpToNext(l);
  return sum;
}

function recomputeLevelFromXp(){
  let level = 1;
  while(player.totalXp >= totalXpForLevel(level+1)) level++;
  while(level > 1 && player.totalXp < totalXpForLevel(level)) level--;
  player.level = level;
  player.xp = player.totalXp - totalXpForLevel(level);
}

function newPlayer(classKey){
  const c = CLASSES[classKey];
  player = {
    classKey, name: c.name, level:1, xp:0, totalXp:0,
    coins:25,
    hp:c.baseHp, hpMax:c.baseHp, mp:c.baseMp, mpMax:c.baseMp, atk:c.baseAtk, def:c.baseDef, magia:c.baseMagia, agilidade:c.baseAgi,
    statPoints:0,
    allocated:{ forca:0, defesa:0, vitalidade:0, espirito:0, magia:0, agilidade:0 },
    newItemCount:0,
    defeatedBosses:[],
    forestProgress:{ commonKills:0, miniBossDefeated:false, miniBossKills:0, discoveries:0 },
    swampProgress:{ commonKills:0, miniBossDefeated:false, miniBossKills:0 },
    inventory:[],
    consumables:{ hp:1, hp_medium:0, hp_major:0, mp:1, mp_medium:0, mp_major:0, xpbuff:0 },
    xpBuffUntil:0,
    equipment:{ weapon:null, armor:null, shield:null, helmet:null, boots:null, gloves:null, accessory:null, earring:null, legs:null, necklace:null },
  };
  recomputeStats();
  player.hp = player.hpMax;
  player.mp = player.mpMax;
}

function recomputeStats(){
  const c = CLASSES[player.classKey];
  const lvl = player.level;
  // VS 1.18 — seis atributos definitivos.
  let hpMax = Math.round(c.baseHp + c.hpG*(lvl-1)) + (player.allocated.vitalidade||0)*4;
  let mpMax = Math.round(c.baseMp + c.mpG*(lvl-1)) + (player.allocated.espirito||0)*2;
  let atk   = Math.round((c.baseAtk + c.atkG*(lvl-1)) * (1 + (player.allocated.forca||0)*0.005));
  let def   = Math.round(c.baseDef + c.defG*(lvl-1)) + (player.allocated.defesa||0);
  let magia = Math.round((c.baseMagia + c.magiaG*(lvl-1)) * (1 + (player.allocated.magia||0)*0.005));
  let agilidade = Math.round(c.baseAgi + c.agiG*(lvl-1)) + (player.allocated.agilidade||0);
  SLOT_ORDER.forEach(slot=>{
    const it = player.equipment[slot];
    if(it){ atk += it.atk||0; def += it.def||0; hpMax += it.hp||0; mpMax += it.mp||0; magia += it.magia||0; agilidade += it.agi||0; }
  });
  player.hpMax = hpMax; player.mpMax = mpMax; player.atk = atk; player.def = def; player.magia = magia; player.agilidade = agilidade;
  if(player.hp > player.hpMax) player.hp = player.hpMax;
  if(player.mp > player.mpMax) player.mp = player.mpMax;
}

function getDodgeChance(){ return Math.min(0.50, (player.agilidade||0) * 0.006 + equippedAffixTotal('dodge')); }
function getExtraAttackChance(){ return Math.min(0.30, (player.agilidade||0) * 0.004); }

function stagePoint(stat, delta){
  const staged = Object.values(ui.pendingAlloc).reduce((a,b)=>a+b,0);
  const available = player.statPoints - staged;
  if(delta>0){
    if(available<=0) return;
    ui.pendingAlloc[stat] += 1;
  } else {
    if((ui.pendingAlloc[stat]||0) <= 0) return;
    ui.pendingAlloc[stat] -= 1;
  }
  render();
}

function confirmAlloc(){
  let totalStaged = 0;
  Object.keys(ui.pendingAlloc).forEach(k=>{
    player.allocated[k] += ui.pendingAlloc[k];
    totalStaged += ui.pendingAlloc[k];
    ui.pendingAlloc[k] = 0;
  });
  if(totalStaged>0){
    player.statPoints -= totalStaged;
    recomputeStats();
    showToast(`${totalStaged} ponto${totalStaged>1?'s':''} de status distribuído${totalStaged>1?'s':''}.`);
  }
  render();
}

/* VS 1.16 — ferramenta de playtest: permite experimentar builds sem reiniciar a partida. */
function resetAllocatedStats(){
  if(ui.inBattle){ showToast('Não é possível redefinir atributos durante uma batalha.'); return; }
  const returned = Object.values(player.allocated||{}).reduce((a,b)=>a+(b||0),0);
  Object.keys(ui.pendingAlloc).forEach(k=>ui.pendingAlloc[k]=0);
  if(returned<=0){ showToast('Nenhum ponto distribuído para redefinir.'); return; }
  Object.keys(player.allocated).forEach(k=>player.allocated[k]=0);
  player.magDomain = null;
  player.overchargeNext = false;
  player.statPoints += returned;
  recomputeStats();
  player.hp = Math.min(player.hp, player.hpMax);
  player.mp = Math.min(player.mp, player.mpMax);
  showToast(`${returned} ponto${returned>1?'s':''} devolvido${returned>1?'s':''}. Teste uma nova build.`);
  render();
}

/* =========================================================
   ITENS
   ========================================================= */
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

/* Retorna a arte do personagem (se já tivermos) ou o emoji como fallback */
function classAvatarHtml(classKey, cssClass){
  const c = CLASSES[classKey];
  if(c.portrait) return `<img src="${c.portrait}" class="${cssClass}" alt="${c.name}">`;
  return c.emoji;
}
/* Mesma ideia, mas pra monstros (que não vêm de CLASSES) */
function monsterAvatarHtml(monster, cssClass){
  if(monster.id==='romar') return `<span class="romar-avatar ${monster.romarTransform?'romar-transform':''}"><span aria-label="Romar">⚔️</span><img src="${monster.portrait}" class="${cssClass}" alt="Romar" onerror="this.style.display='none'"></span>`;
  if(monster.portrait) return `<img src="${monster.portrait}" class="${cssClass}" alt="${monster.name}">`;
  return monster.emoji;
}
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

function rollRarity(tier, isBoss, mapIndex){
  let legendary = isBoss ? (3 + mapIndex*3) : (mapIndex>=2 ? 1 : 0);
  let epic      = isBoss ? (16 + mapIndex*5) : (tier>=2 ? 4 + mapIndex*3 : 1);
  let rare      = isBoss ? 36 : 16 + tier*5;
  let common    = Math.max(10, 100 - legendary - epic - rare);
  const table = [['comum',common],['raro',rare],['épico',epic],['lendário',legendary]];
  const total = table.reduce((s,t)=>s+t[1],0);
  let r = Math.random()*total;
  for(const [rarity,w] of table){ if(r<w) return rarity; r-=w; }
  return 'comum';
}

function generateItem(mapIndex, tier, isBoss, forceMinRarity){
  const slot = pick(DROP_SLOTS);
  let rarity = rollRarity(tier, isBoss, mapIndex);
  if(forceMinRarity){
    const order = ['comum','raro','épico','lendário'];
    if(order.indexOf(rarity) < order.indexOf(forceMinRarity)) rarity = forceMinRarity;
  }
  const mult = RARITY_MULT[rarity];
  const scale = 1 + mapIndex*0.45;
  const roll = 0.65 + Math.random()*0.7; // variação individual (±35%), ampla o bastante pra até status baixos variarem
  const isUniversal = UNIVERSAL_SLOTS.includes(slot);
  const shieldEligibleClasses = CLASS_KEYS.filter(c=>c!=='arqueiro');
  const classReq = isUniversal ? null : (slot==='shield' ? pick(shieldEligibleClasses) : pick(CLASS_KEYS));
  const base = SLOT_BASE_STATS[slot];

  const item = {
    uid: 'it'+(ui.itemSeq++),
    slot, rarity, classReq,
    atk:0, def:0, hp:0, mp:0, magia:0, agi:0,
    twoHanded:false,
    levelReq: MAPS[mapIndex].unlockLevel,
    statReq: buildStatReq(classReq, rarity, mapIndex),
    name: '',
  };

  if(slot==='weapon' && classReq){
    const wt = pick(WEAPON_TYPES[classReq]);
    item.twoHanded = wt.twoHanded;
    item[wt.focus] += Math.round((base.atk||4) * mult * scale * wt.mult * roll);
    if(wt.secondaryFocus){
      item[wt.secondaryFocus] += Math.round((base.atk||4) * mult * scale * wt.secondaryMult * roll);
    }
    item.name = `${wt.name} ${pick(RARITY_PREFIX[rarity])}`;
    const weaponArt = {varinha:'wand',cajado:'staff',arco:'bow',pistola:'pistol',espada:'sword_warrior',martelo:'hammer',espada_sagrada:'sword_cavalier'};
    item.artKey = weaponArt[wt.id] || null;
  } else if(slot==='gloves' && classReq==='mago'){
    item.magia = Math.round((base.atk||2) * mult * scale * roll);
    item.name = `Luvas Encantadas ${pick(RARITY_PREFIX[rarity])}`;
  } else if(slot==='shield' && classReq==='mago'){
    item.def = Math.round((base.def||4) * mult * scale * roll);
    item.mp = Math.max(2, Math.round(4 * mult * scale * roll));
    item.name = `Orbe ${pick(RARITY_PREFIX[rarity])}`;
    item.artKey = 'orb';
  } else if(classReq==='mago' && slot==='armor'){
    item.magia = Math.max(1,Math.round(2.2*mult*scale*roll));
    item.mp = Math.max(3,Math.round(7*mult*scale*roll));
    item.def = Math.max(1,Math.round(1.1*mult*scale*roll));
    item.name = `Vestes Arcanas ${pick(RARITY_PREFIX[rarity])}`;
  } else if(classReq==='mago' && slot==='helmet'){
    item.magia = Math.max(1,Math.round(1.5*mult*scale*roll));
    item.mp = Math.max(2,Math.round(5*mult*scale*roll));
    item.name = `Capuz Arcano ${pick(RARITY_PREFIX[rarity])}`;
  } else if(classReq==='mago' && slot==='boots'){
    item.agi = Math.max(1,Math.round(1.1*mult*scale*roll));
    item.mp = Math.max(2,Math.round(3*mult*scale*roll));
    item.name = `Botas do Conjurador ${pick(RARITY_PREFIX[rarity])}`;
  } else if(isUniversal){
    const pool = ['atk','def','hp','magia','agi'];
    for(let i=pool.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
    const [s1,s2] = pool;
    const STAT_WEIGHT = { atk:1, def:1, magia:1, agi:1, hp:2 };
    const budget = 5 * mult * scale;
    const split = 0.35 + Math.random()*0.3;
    item[s1] = Math.max(1, Math.round(budget*split*STAT_WEIGHT[s1]*(0.75+Math.random()*0.5)));
    item[s2] = Math.max(1, Math.round(budget*(1-split)*STAT_WEIGHT[s2]*(0.75+Math.random()*0.5)));
    item.name = `${SLOT_META[slot].label} ${pick(RARITY_PREFIX[rarity])}`;
  } else {
    if(base.atk)   item.atk   = Math.round(base.atk*mult*scale*roll);
    if(base.def)   item.def   = Math.round(base.def*mult*scale*roll);
    if(base.hp)    item.hp    = Math.round(base.hp*mult*scale*roll);
    if(base.magia) item.magia = Math.round(base.magia*mult*scale*roll);
    if(base.agi)   item.agi   = Math.round(base.agi*mult*scale*roll);
    item.name = `${SLOT_META[slot].label} ${pick(RARITY_PREFIX[rarity])}`;
  }

  assignSalvageProfile(item);
  addItemAffixes(item);
  item.value = Math.round(9 * mult * (1+mapIndex*0.5) * roll * (1 + (item.affixes?.length||0)*0.35));
  return item;
}

function generateBossUnique(mapIndex){
  if(mapIndex!==0) return null;
  const classKey=player.classKey;
  const names={mago:'Cajado do Uivo Lunar',arqueiro:'Arco da Presa Prateada',guerreiro:'Martelo Quebra-Matilha',cavaleiro:'Espada do Último Uivo'};
  const item=generateItem(0,3,true,'lendário');
  item.slot='weapon'; item.rarity='lendário'; item.classReq=classKey; item.levelReq=3;
  item.statReq=buildStatReq(classKey,'épico',0); item.name=names[classKey]; item.twoHanded=false;
  item.artKey={mago:'staff',arqueiro:'bow_unique',guerreiro:'hammer_unique',cavaleiro:'sword_unique'}[classKey];
  item.atk=0; item.def=0; item.hp=0; item.magia=0; item.agi=0;
  if(classKey==='mago') item.magia=16;
  else if(classKey==='arqueiro'){ item.atk=10; item.agi=8; }
  else if(classKey==='guerreiro') item.atk=18;
  else { item.atk=13; item.def=5; }
  item.affixes=[{key:'crit',label:'Marca do Alfa',value:.07},{key:'execute',label:'Predador Supremo',value:.14}];
  delete item.salvageProfile;
  item.uniqueEffect={id:'alfa',desc:'Legado do Alfa: crítico e dano de execução elevados'};
  item.value=180;
  return item;
}

function itemDesc(item){
  const parts = [];
  if(item.atk)   parts.push(`+${item.atk} Força`);
  if(item.magia) parts.push(`+${item.magia} Magia`);
  if(item.def)   parts.push(`+${item.def} Defesa`);
  if(item.agi)   parts.push(`+${item.agi} Agilidade`);
  if(item.hp)    parts.push(`+${item.hp} HP`);
  if(item.mp)    parts.push(`+${item.mp} MP`);
  if(item.twoHanded) parts.push('duas mãos');
  if(item.affixes?.length) item.affixes.forEach(a=>parts.push(affixDesc(a)));
  if(item.uniqueEffect) parts.push(item.uniqueEffect.desc);
  return parts.join(' · ');
}

function itemRequirementLabel(item){
  const bits = [];
  if(item.classReq) bits.push(CLASS_LABEL[item.classReq]);
  if(item.levelReq) bits.push(`Nível ${item.levelReq}+`);
  if(item.statReq) Object.keys(item.statReq).forEach(k=>{
    bits.push(`${REQ_LABELS[k]} ${item.statReq[k]}+`);
  });
  return bits.join(' · ');
}

function itemMeetsRequirements(item){
  if(item.classReq && item.classReq !== player.classKey) return false;
  if(item.levelReq && player.level < item.levelReq) return false;
  if(item.statReq){
    for(const k of Object.keys(item.statReq)){
      if((player[k]||0) < item.statReq[k]) return false;
    }
  }
  return true;
}

/* =========================================================
   NOTIFICAÇÕES (level up / item / poção)
   ========================================================= */
function popNotif({eyebrow, title, sub, levelup, image, trap, persist}){
  const layer = document.getElementById('notif-layer');
  const card = document.createElement('div');
  const interactive = !!(trap || persist);
  card.className = 'notif-card' + (levelup ? ' levelup' : '') + (trap ? ' trap-card' : '') + (interactive ? ' interactive-card' : '');
  card.innerHTML = `${image?`<img class="trap-art" src="${image}" alt="${title}">`:''}<div class="n-eyebrow">${eyebrow}</div><div class="n-title">${title}</div>${sub?`<div class="n-sub">${sub}</div>`:''}${interactive?'<div class="event-choice-row"><button type="button" class="event-choice-btn primary notif-continue">CONTINUAR</button></div>':''}`;
  layer.appendChild(card);
  if(interactive){
    const btn=card.querySelector('.notif-continue');
    btn.addEventListener('click',()=>card.remove(),{once:true});
  }else{
    setTimeout(()=>{ if(card.isConnected) card.remove(); }, 5600);
  }
}

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* =========================================================
   COMBATE
   ========================================================= */
let battleLog = [];

function calcDamage(atk, def){
  const base = Math.max(1, atk - def*0.5);
  const variance = 0.85 + Math.random()*0.3;
  return Math.max(1, Math.round(base*variance));
}

const TRAP_CHANCE = 0.08;
const MINI_BOSS_CHANCE = 0.06;

/* VS 1.7 — Artes finais das armadilhas da Floresta Uivante. */
const TRAP_ART = {
  bear: 'assets/images/traps/bear.jpg',
  stakes: 'assets/images/traps/stakes.jpg',
  rune: 'assets/images/traps/rune.jpg'
};
const FOREST_TRAPS = [
  { id:'bear', name:'Armadilha de Urso', damage:20, image:TRAP_ART.bear, sub:'Mandíbulas de ferro se fecham sobre sua perna antes que você consiga recuar.' },
  { id:'stakes', name:'Estacas Ocultas', damage:11, image:TRAP_ART.stakes, sub:'Folhas cedem sob seus pés e revelam estacas afiadas escondidas no solo.' },
  { id:'rune', name:'Runa Amaldiçoada', damage:6, image:TRAP_ART.rune, sub:'Um símbolo antigo desperta sob seus passos e queima sua carne com energia profana.' },
];

/* Pesos de tier de monstro (fraco->forte) conforme o quanto o jogador já está estabelecido na área */
const TIER_WEIGHTS_BY_PROGRESS = [
  [70,25,5,0],   // acabou de chegar na área
  [40,40,18,2],  // já subiu 1 nível na área
  [15,35,35,15], // já subiu 2 níveis na área
  [5,20,35,40],  // bem estabelecido (3+ níveis na área)
];

/* Poder "esperado" de um personagem daquela classe, sem equipamento nem pontos alocados,
   usado só como referência para saber se o jogador está acima/abaixo da curva */
function baselinePowerAtLevel(classKey, level){
  const c = CLASSES[classKey];
  const atk = c.baseAtk + c.atkG*(level-1);
  const def = c.baseDef + c.defG*(level-1);
  const magia = c.baseMagia + c.magiaG*(level-1);
  const hp = c.baseHp + c.hpG*(level-1);
  const mp = c.baseMp + c.mpG*(level-1);
  const agi = c.baseAgi + c.agiG*(level-1);
  return atk+def+magia+hp/5+mp/5+agi;
}
function currentPowerScore(){
  return player.atk+player.def+player.magia+player.hpMax/5+player.mpMax/5+player.agilidade;
}
function tierWeightAdjustment(){
  const base = baselinePowerAtLevel(player.classKey, player.level);
  if(base<=0) return 0;
  const ratio = currentPowerScore()/base;
  if(ratio >= 1.3) return 2;
  if(ratio >= 1.15) return 1;
  if(ratio <= 0.8) return -1;
  return 0;
}

function pickWeightedMonster(map){
  const levelsIn = player.level - map.unlockLevel;
  const bucket = Math.min(3, Math.max(0, levelsIn + tierWeightAdjustment()));
  const weights = TIER_WEIGHTS_BY_PROGRESS[bucket];
  const total = weights.reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  for(let i=0;i<map.monsters.length;i++){
    if(r < weights[i]) return map.monsters[i];
    r -= weights[i];
  }
  return map.monsters[map.monsters.length-1];
}

// Estados antigos não registravam quando ocorreu a última vitória. Não é possível
// reconstruir esse marco por miniBossKills: abates anteriores não podem ser creditados.
function ensureMiniBossKillCheckpoint(progress){
  if(!Number.isFinite(progress.commonKillsAtLastMiniBossVictory) || progress.commonKillsAtLastMiniBossVictory<0 || progress.commonKillsAtLastMiniBossVictory>progress.commonKills){
    progress.commonKillsAtLastMiniBossVictory = progress.miniBossKills>0 ? progress.commonKills : 0;
  }
}
function getForestProgress(){
  if(!player.forestProgress) player.forestProgress = { commonKills:0, miniBossDefeated:false, miniBossKills:0, discoveries:0 };
  if(typeof player.forestProgress.miniBossKills !== 'number') player.forestProgress.miniBossKills = player.forestProgress.miniBossDefeated ? 1 : 0;
  ensureMiniBossKillCheckpoint(player.forestProgress);
  return player.forestProgress;
}
function getForestMiniBossTarget(){
  const fp = getForestProgress();
  return fp.miniBossKills > 0 ? fp.commonKillsAtLastMiniBossVictory + 7 : 14;
}
function forestStage(){
  const k = getForestProgress().commonKills;
  if(k >= 10) return 2;
  if(k >= 5) return 1;
  return 0;
}
function pickForestMonster(map){
  const stage = forestStage();
  const pools = [
    [0,0,0,1],
    [0,1,1,2],
    [1,2,2,3,3]
  ];
  return map.monsters[pick(pools[stage])];
}
function forestDiscovery(){
  const fp = getForestProgress();
  const stage = forestStage();
  const discoveries = [
    {title:'Pegadas sob a lua', sub:'Marcas enormes seguem para o interior. Algo observa você entre as árvores.'},
    {title:'Totem dilacerado', sub:'Garras profundas cobrem a madeira. Os uivos agora parecem responder uns aos outros.'},
    {title:'Covil nas sombras', sub:'Você encontrou sinais do Uivante das Sombras. A caçada se aproxima do coração da floresta.'}
  ];

  if((fp.discoveries||0) >= stage+1) return false;
  fp.discoveries = stage+1;
  popNotif({
    eyebrow:'DESCOBERTA',
    title:discoveries[stage].title,
    sub:discoveries[stage].sub
  });
  render();
  return true;
}

function desafiarMiniBossFloresta(){
  const fp = getForestProgress();
  const target = getForestMiniBossTarget();
  if(fp.commonKills < target){
    const faltam = target - fp.commonKills;
    popNotif({ eyebrow:'RASTRO INCOMPLETO', title:fp.miniBossKills>0?'O Uivante ainda não retornou':'O Uivante ainda não foi localizado', sub:`Derrote mais ${faltam} criatura(s) da Floresta Uivante.` });
    return;
  }
  startBattle(0, MAPS[0].miniBoss, false);
}
function getSwampProgress(){
  if(!player.swampProgress) player.swampProgress = { commonKills:0, miniBossDefeated:false, miniBossKills:0 };
  if(typeof player.swampProgress.miniBossKills !== 'number') player.swampProgress.miniBossKills = player.swampProgress.miniBossDefeated ? 1 : 0;
  ensureMiniBossKillCheckpoint(player.swampProgress);
  return player.swampProgress;
}
function getSwampMiniBossTarget(){
  const sp = getSwampProgress();
  return sp.miniBossKills > 0 ? sp.commonKillsAtLastMiniBossVictory + 7 : 14;
}
function desafiarMiniBossPantano(){
  const sp = getSwampProgress();
  const target = getSwampMiniBossTarget();
  if(sp.commonKills < target){
    const faltam = target - sp.commonKills;
    popNotif({ eyebrow:'RASTRO INCOMPLETO', title:sp.miniBossKills>0?'O Devorador ainda não retornou':'O charco ainda esconde sua criatura', sub:`Derrote mais ${faltam} criatura(s) do Pântano Podre.` });
    return;
  }
  startBattle(1, MAPS[1].miniBoss, false);
}
function desafiarBossTerritorio(mapIndex){
  if(mapIndex===0 && !getForestProgress().miniBossDefeated && !player.defeatedBosses.includes(0)){
    popNotif({ eyebrow:'DOMÍNIO SELADO', title:'O Alfa ainda não se revela', sub:'Encontre e derrote o Uivante das Sombras primeiro.' });
    return;
  }
  if(mapIndex===1 && !getSwampProgress().miniBossDefeated && !player.defeatedBosses.includes(1)){
    popNotif({ eyebrow:'DOMÍNIO SELADO', title:'O Senhor do Pântano ainda não se revela', sub:'Encontre e derrote o Devorador do Charco primeiro.' });
    return;
  }
  startBattle(mapIndex, MAPS[mapIndex].boss, true);
}
/* =========================================================
   VS 1.8 — EVENTOS DA FLORESTA
   Pequeno conjunto inicial: 3 encontros com escolha e consequência.
   ========================================================= */
const FOREST_EVENT_CHANCE = 0.14;
let pendingForestEvent = null;
// VS 1.11 — anti-repetição: eventos não podem formar sequências e descobertas são únicas por estágio.
let forestEventCooldown = 0;
let lastForestEventId = null;

// Descobertas únicas por personagem; estado serializável junto com player.
const ROMAR_DISCOVERIES = [
  {
    "id": "massacre",
    "title": "O MASSACRE",
    "image": "assets/images/events/forest/romar/romar_massacre.png",
    "button": "CONTINUAR",
    "paragraphs": [
      "O cheiro chega antes da clareira.",
      "Um grande lobo jaz entre folhas e raízes. O solo ao redor foi revolvido, galhos estão partidos e um golpe profundo rasgou o tronco de uma árvore próxima.",
      "Não há sinais de outra fera.",
      "Entre a lama, você encontra um pequeno fragmento de metal escuro. Parte de uma armadura, talvez.",
      "Quem fez isso não estava caçando. Estava abrindo caminho."
    ]
  },
  {
    "id": "marcas",
    "title": "MARCAS ENTRE AS ÁRVORES",
    "image": "assets/images/events/forest/romar/romar_marcas_arvores.png",
    "button": "SEGUIR EXPLORANDO",
    "paragraphs": [
      "Mais adiante, outro tronco carrega a marca de uma lâmina pesada. O corte atravessou madeira que um homem dificilmente conseguiria romper.",
      "Há sangue no caminho. Desta vez, não pertence a um animal.",
      "Pegadas humanas seguem floresta adentro. Irregulares. Cada vez mais espaçadas.",
      "Seja quem for… está ferido. E ainda está se movendo."
    ]
  },
  {
    "id": "runa",
    "title": "A RUNA VIOLADA",
    "image": "assets/images/events/forest/romar/romar_runa_violada.png",
    "button": "AFASTAR-SE",
    "paragraphs": [
      "Sob raízes antigas, uma pedra que deveria permanecer enterrada foi exposta.",
      "Símbolos desconhecidos cobrem sua superfície. Parte deles foi destruída recentemente — não pelo tempo, mas por golpes deliberados.",
      "Das rachaduras ainda escapa um brilho vermelho fraco. A vegetação ao redor parece morta.",
      "As mesmas pegadas terminam diante da pedra.",
      "Depois… continuam.",
      "Mas alguma coisa nelas mudou."
    ]
  },
  {
    "id": "acampamento",
    "title": "ACAMPAMENTO ABANDONADO",
    "image": "assets/images/events/forest/romar/romar_acampamento_abandonado.png",
    "button": "CONTINUAR",
    "paragraphs": [
      "Alguém tentou sobreviver aqui.",
      "Uma fogueira apagada. Comida quase intocada. Partes de uma armadura pesada foram abandonadas ao lado de um abrigo improvisado.",
      "Entre os pertences há anotações incompletas. A maioria está ilegível.",
      "Uma frase ainda pode ser lida:",
      "“Enquanto eu ainda conseguir lembrar quem sou…”",
      "O restante da página foi destruído."
    ]
  }
];
function getRomarDiscoveries(){
  if(!player.romarDiscoveries || typeof player.romarDiscoveries!=='object') player.romarDiscoveries={};
  const state=player.romarDiscoveries;
  const ids=ROMAR_DISCOVERIES.map(scene=>scene.id);
  state.seen=Array.isArray(state.seen) ? [...new Set(state.seen.filter(id=>ids.includes(id)))] : [];
  if(!ids.includes(state.pending)) state.pending=null;
  if(state.pending && !state.seen.includes(state.pending)) state.seen.push(state.pending);
  if(!Number.isInteger(state.cooldown) || state.cooldown<0) state.cooldown=0;
  for(const key of ['clueAttempts','encounterAttempts']){
    if(!Number.isInteger(state[key]) || state[key]<0) state[key]=0;
  }
  return state;
}
function hasPendingRomarDiscovery(){
  return !!(player && player.romarDiscoveries && player.romarDiscoveries.pending);
}
function canEncounterRomar(){
  const state=getRomarDiscoveries();
  return player.defeatedBosses.includes(0) && !player.romar_first_choice && !ui.romarResult &&
    !state.pending && state.seen.length>=3 && state.seen.includes('runa');
}
function discoverRomarClue(){
  if(!player.defeatedBosses.includes(0) || player.romar_first_choice || ui.romarResult || ui.inBattle) return false;
  const state=getRomarDiscoveries();
  if(state.pending || state.cooldown>0 || pendingForestEvent || document.querySelectorAll('.interactive-card').length) return false;
  const pool=ROMAR_DISCOVERIES.filter(scene=>!state.seen.includes(scene.id));
  if(!pool.length) return false;
  const scene=pick(pool);
  state.seen.push(scene.id); state.pending=scene.id; state.cooldown=2;
  state.clueAttempts=0;
  forestEventCooldown=2; ui.mapIndex=0; ui.tab='mapa';
  render(); return true;
}
function romarAttemptChance(attempt,encounter){
  const chances=encounter ? [0.06,0.06,0.12,0.12,0.25,0.25,0.50,1] : [0.12,0.15,0.20,0.30,0.50,1];
  return chances[Math.min(chances.length-1,Math.max(0,attempt-1))];
}
// Conta o clique aceito antes dos eventos. O próprio contador guarda a garantia
// pendente (>=6 pistas, >=8 encontro), inclusive após serializar o personagem.
function advanceRomarExploration(){
  if(!player || player.hp<=0 || !player.defeatedBosses.includes(0) || player.romar_first_choice) return;
  const state=getRomarDiscoveries();
  const encounter=canEncounterRomar();
  if(!encounter && !ROMAR_DISCOVERIES.some(scene=>!state.seen.includes(scene.id))) return;
  state[encounter ? 'encounterAttempts' : 'clueAttempts']++;
}
// Um único sorteio orgânico por exploração: encontro elegível tem prioridade.
function tryRomarExploration(){
  if(!player || ui.inBattle || player.hp<=0 || !player.defeatedBosses.includes(0) || player.romar_first_choice || ui.romarResult || (ui.monster && ui.monster.romarChoice)) return false;
  const state=getRomarDiscoveries();
  if(state.pending || state.cooldown>0 || forestEventCooldown>0 || pendingForestEvent || document.querySelectorAll('.interactive-card').length) return false;
  const encounter=canEncounterRomar();
  if(!encounter && !ROMAR_DISCOVERIES.some(scene=>!state.seen.includes(scene.id))) return false;
  const key=encounter ? 'encounterAttempts' : 'clueAttempts';
  if(state[key]<=0) return false;
  if(Math.random()>=romarAttemptChance(state[key],encounter)) return false;
  if(!encounter) return discoverRomarClue();
  if(!startRomarEncounter()) return false;
  state.encounterAttempts=0;
  return true;
}
function finishRomarDiscovery(){
  const state=getRomarDiscoveries();
  if(!state.pending) return;
  state.pending=null; ui.mapIndex=0; ui.tab='mapa'; render();
}
function renderRomarDiscovery(){
  const scene=ROMAR_DISCOVERIES.find(scene=>scene.id===getRomarDiscoveries().pending);
  if(!scene) return '';
  return `<article class="romar-discovery interactive-card">
    <img class="romar-discovery-art" src="${scene.image}" alt="${scene.title}">
    <div class="romar-discovery-text"><h2>DESCOBERTA — ${scene.title}</h2>
    ${scene.paragraphs.map(text=>`<p>${text}</p>`).join('')}
    <button type="button" class="enter-map-btn" onclick="finishRomarDiscovery()">${scene.button}</button></div>
  </article>`;
}

// Economia aprovada: classificação explícita por slot e classe; nunca por nome.
const MATERIAL_DEFS={
  sucata_ferro:{name:'Sucata de Ferro'},
  essencia_arcana:{name:'Essência Arcana'},
  fragmento_refinado:{name:'Fragmento Refinado'},
  lodo_viscoso:{name:'Lodo Viscoso',territorial:true},
  escamas_grande_mae:{name:'Escamas da Grande Mãe',territorial:true}
};
// profile: {version, yieldsByRarity:{raridade:{materialId:quantidade}}}
// item.salvageProfile: {id,version}. Instâncias ambíguas continuam bloqueadas.
const SALVAGE_PROFILES={
  physical:{version:1,yieldsByRarity:{comum:{sucata_ferro:1},raro:{sucata_ferro:2},épico:{sucata_ferro:4,fragmento_refinado:1},lendário:{sucata_ferro:7,fragmento_refinado:2}}},
  arcane:{version:1,yieldsByRarity:{comum:{essencia_arcana:1},raro:{essencia_arcana:2},épico:{essencia_arcana:4,fragmento_refinado:1},lendário:{essencia_arcana:7,fragmento_refinado:2}}},
  hybrid:{version:1,yieldsByRarity:{comum:{sucata_ferro:1},raro:{sucata_ferro:1,essencia_arcana:1},épico:{sucata_ferro:2,essencia_arcana:2,fragmento_refinado:1},lendário:{sucata_ferro:3,essencia_arcana:3,fragmento_refinado:2}}}
};
function assignSalvageProfile(item){
  if(item.salvageProfile || item.uniqueEffect || item.protected || item.special || item.isProtected || item.isSpecial || item.isUnique || item.questClue)return item;
  let id=null;
  if(['accessory','necklace','earring','bracelet'].includes(item.slot))id='hybrid';
  else if(['weapon','shield','helmet','armor','gloves','boots'].includes(item.slot)){
    if(item.classReq==='mago')id='arcane';
    else if(['arqueiro','guerreiro','cavaleiro'].includes(item.classReq))id='physical';
  }
  if(id)item.salvageProfile={id,version:1};
  return item;
}
// recipe: {version, ingredients:[{materialId,quantity}], resultSlot, requirements,
// fixedPropertiesByRarity, affixRules}. Conhecimento é uma lista de IDs no save.
// Instâncias futuras: {origin:'craft',recipeId,recipeVersion,fixedProperties}.
const RECIPE_DEFS={};
function normalizeForgeEconomy(p){
  for(const key of ['materials','recipePity']){
    if(!p[key] || typeof p[key]!=='object' || Array.isArray(p[key]))p[key]={};
    for(const value of Object.values(p[key]))if(!Number.isSafeInteger(value) || value<0)throw new Error('Quantidade econômica inválida');
  }
  p.knownRecipes=Array.isArray(p.knownRecipes)?[...new Set(p.knownRecipes.filter(id=>typeof id==='string' && id.length>0))]:[];
}
function forgeText(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function forgeAvailable(){
  return !!player && !!(player.forgeProgress && player.forgeProgress.lucas && player.forgeProgress.lucas.forgeUnlocked) &&
    ui.mapIndex===1 && ui.lucasScene==='workshop' && !ui.inBattle && !ui.monster && !ui.locked && !ui.romarResult && !pendingForestEvent && !hasPendingRomarDiscovery();
}
function salvageQuote(uid){
  if(!player || typeof uid!=='string')return null;
  const matches=player.inventory.filter(it=>it.uid===uid);
  if(matches.length!==1 || Object.values(player.equipment).some(it=>it && it.uid===uid))return null;
  const item=matches[0];
  if(!Object.prototype.hasOwnProperty.call(SLOT_META,item.slot) || item.protected || item.special || item.isProtected || item.isSpecial || item.isUnique || item.uniqueEffect || item.questClue || item.category==='quest' || item.category==='consumable')return null;
  if(Object.values(player.questItems||{}).some(q=>q && q.uid===uid))return null;
  const ref=item.salvageProfile;
  if(!ref || !Object.prototype.hasOwnProperty.call(SALVAGE_PROFILES,ref.id))return null;
  const profile=SALVAGE_PROFILES[ref.id];
  if(!profile || !profile.yieldsByRarity || profile.version!==ref.version || !Object.prototype.hasOwnProperty.call(profile.yieldsByRarity,item.rarity))return null;
  const yields=profile.yieldsByRarity[item.rarity];
  if(!yields || !Object.keys(yields).length || Object.entries(yields).some(([id,n])=>!Object.prototype.hasOwnProperty.call(MATERIAL_DEFS,id)||!Number.isSafeInteger(n)||n<=0))return null;
  return {uid,item:JSON.stringify(item),yields:JSON.parse(JSON.stringify(yields))};
}
function previewSalvage(uid){
  if(!forgeAvailable())return;
  ui.salvageConfirmation=salvageQuote(uid);render();
}
function cancelSalvage(){ui.salvageConfirmation=null;render();}
function confirmSalvage(){
  if(!forgeAvailable() || !ui.salvageConfirmation)return false;
  const preview=ui.salvageConfirmation;
  ui.salvageConfirmation=null; // Consome a requisição antes de qualquer escrita.
  const current=salvageQuote(preview.uid);
  if(!current || JSON.stringify(current)!==JSON.stringify(preview)){showToast('O equipamento ou rendimento mudou. Confira novamente.');render();return false;}
  const next=JSON.parse(JSON.stringify(player));
  next.inventory.splice(next.inventory.findIndex(it=>it.uid===preview.uid),1);
  normalizeForgeEconomy(next);
  for(const [id,n] of Object.entries(current.yields))next.materials[id]=(next.materials[id]||0)+n;
  const saved=commitForgeTransaction(next);
  if(saved)showToast('Equipamento desmontado. Materiais recebidos.');
  render();return saved;
}
function renderForgeMaterials(){
  const rows=Object.entries(player.materials||{}).filter(([,n])=>n>0);
  return '<h3>MATERIAIS</h3>'+ (rows.length?rows.map(([id,n])=>'<p>'+forgeText(MATERIAL_DEFS[id]?.name||id)+' · '+n+'</p>').join(''):'<p>Nenhum material disponível.</p>');
}
function renderForgeWorkshop(){
  const preview=ui.salvageConfirmation;
  if(preview){
    const item=JSON.parse(preview.item);
    return '<h3>DESMONTAR</h3><p>'+forgeText(item.name)+' · '+forgeText(item.rarity)+'</p><p>'+forgeText(itemDesc(item))+'</p><p>Rendimento garantido:</p>'+Object.entries(preview.yields).map(([id,n])=>'<p>'+forgeText(MATERIAL_DEFS[id].name)+' · '+n+'</p>').join('')+'<p><strong>ESTE EQUIPAMENTO SERÁ DESTRUÍDO PERMANENTEMENTE.</strong></p><button class="enter-map-btn" onclick="confirmSalvage()">DESMONTAR</button><button class="enter-map-btn" onclick="cancelSalvage()">CANCELAR</button>';
  }
  const eligible=player.inventory.filter(it=>salvageQuote(it.uid));
  const recipes=(player.knownRecipes||[]).filter(id=>Object.prototype.hasOwnProperty.call(RECIPE_DEFS,id));
  return '<h3>FABRICAR</h3><p>'+(recipes.length?'Receitas conhecidas. Fabricação ainda indisponível.':'Nenhuma receita conhecida.')+'</p><h3>DESMONTAR</h3>'+ (eligible.length?eligible.map(it=>'<button class="enter-map-btn" onclick="previewSalvage('+forgeText(JSON.stringify(it.uid))+')">'+forgeText(it.name)+' · '+forgeText(it.rarity)+'</button>').join(''):'<p>Nenhum equipamento elegível para desmontagem.</p>')+renderForgeMaterials();
}

// Lucas: cena transitória separada da progressão permanente.
const LUCAS_ART='assets/images/npcs/lucas.jpg';
function normalizeLucasProgress(forge){
  const old=forge.lucas||{};
  forge.lucas={version:1,discovered:old.discovered===true,forgeUnlocked:old.discovered===true,
    fragmentSeen:old.fragmentSeen===true,
    waitExplorations:Number.isInteger(old.waitExplorations)?Math.max(0,Math.min(3,old.waitExplorations)):0};
  return forge.lucas;
}
function getLucasProgress(){
  player.forgeProgress=player.forgeProgress||{};
  return normalizeLucasProgress(player.forgeProgress);
}
function lucasHasFragment(){return !!(player.questItems && player.questItems.fragmento_ferro_runico);}
function advanceLucasExploration(){
  const state=getLucasProgress();
  if(state.discovered)return false;
  if(state.waitExplorations>0){state.waitExplorations--;return false;}
  return !!(player.swampProgress && player.swampProgress.commonKills>=3);
}
function showLucasScene(scene){ui.lucasScene=scene;ui.mapIndex=1;ui.tab='mapa';render();}
function visitForge(){
  if(ui.mapIndex!==1 || ui.lucasScene || ui.inBattle || ui.locked || ui.monster || ui.romarResult ||
    hasPendingRomarDiscovery() || pendingForestEvent || document.querySelectorAll('.interactive-card').length || !getLucasProgress().forgeUnlocked)return;
  showLucasScene(lucasHasFragment() && !getLucasProgress().fragmentSeen?'fragment1':'workshop');
}
function lucasSceneAction(action){
  const scene=ui.lucasScene;if(!scene)return;
  const state=getLucasProgress();
  if(scene==='sound' && action==='leave'){state.waitExplorations=3;ui.lucasScene=null;render();return;}
  if(scene==='sound' && action==='investigate')return showLucasScene('approach');
  if(scene==='approach' && action==='next')return showLucasScene(lucasHasFragment() && !state.fragmentSeen?'fragment1':'unknown');
  if(scene==='fragment1' && action==='next')return showLucasScene('fragment2');
  if(scene==='fragment2' && action==='next'){state.fragmentSeen=true;return showLucasScene(state.discovered?'workshop':'unknown');}
  if(scene==='unknown' && action==='reply')return showLucasScene('name');
  if(scene==='name' && action==='next')return showLucasScene('unlock');
  if(scene==='unlock' && action==='finish'){
    state.discovered=true;state.forgeUnlocked=true;state.waitExplorations=0;ui.lucasScene=null;render();return;
  }
  if(scene==='workshop' && action==='finish'){ui.salvageConfirmation=null;ui.lucasScene=null;render();}
}
function renderLucasScene(){
  const scenes={
    sound:{title:'DESCOBERTA — MARTELADAS NA NÉVOA',text:['CLANG.','O som atravessa o pântano.','Você para.','Por alguns instantes, apenas água, insetos e o vento entre as árvores mortas.','CLANG.','Metal contra metal.','Não é o som de uma criatura.','E não parece vir de muito longe.'],buttons:[['investigate','INVESTIGAR O SOM'],['leave','SEGUIR CAMINHO']]},
    approach:{title:'MARTELADAS NA NÉVOA',text:['Você segue as marteladas através da névoa.','O cheiro pútrido do pântano começa a se misturar a outro.','Carvão. Ferro quente.','Entre árvores mortas surge uma construção de madeira escurecida. Uma chaminé improvisada expele fumaça para a noite.','Alguém mantém uma forja acesa aqui.'],buttons:[['next','APROXIMAR-SE']]},
    unknown:{title:'FERREIRO DESCONHECIDO',text:['O homem percebe sua presença, mas não interrompe o trabalho.','CLANG.','Mais um golpe.','Só então repousa o martelo sobre a bigorna.','“Se veio roubar, escolha alguma coisa leve.”','Ele finalmente olha para você.','“Vai facilitar quando eu for buscar de volta.”'],buttons:[['reply','NÃO VIM ROUBAR']]},
    name:{title:'FERREIRO DESCONHECIDO',text:['“Ótimo.”','O homem volta os olhos para o metal sobre a bigorna.','“Lucas.”','“Se pretende continuar aparecendo por aqui, é melhor saber o nome de quem vai consertar o que você quebrar.”'],buttons:[['next','CONTINUAR']]},
    fragment1:{title:'FERREIRO DESCONHECIDO',text:['O olhar do ferreiro desce até seus pertences.','Ele para.','Pela primeira vez desde que você chegou, sua expressão muda.','“Isso.”','Ele aponta para o fragmento.','“Coloque sobre a bancada.”'],buttons:[['next','CONTINUAR']]},
    fragment2:{title:'FERREIRO DESCONHECIDO',text:['Lucas aproxima a mão.','As marcas escuras que atravessam seus dedos parecem reagir.','Um brilho vermelho quase imperceptível percorre algumas delas.','Ele recua a mão.','“Onde conseguiu isso?”','Você relata apenas o necessário sobre o guerreiro encontrado na Floresta.','“Então ainda existe mais.”','Silêncio.','“Eu já trabalhei esse metal uma vez.”','Ele observa a própria mão.','“Uma vez foi o bastante.”'],buttons:[['next','CONTINUAR']]},
    unlock:{title:'LUCAS, O FERREIRO MARCADO',text:['SISTEMA DESCOBERTO — FORJA','A oficina agora está acessível no Pântano Podre.'],buttons:[['finish','CONTINUAR']]},
    workshop:{title:'LUCAS, O FERREIRO MARCADO',text:['FORJA','A oficina de Lucas permanece acesa entre as árvores mortas.','Forja desbloqueada. Os serviços de fabricação e desmontagem ainda não estão disponíveis.'],buttons:[['finish','VOLTAR AO PÂNTANO']]}
  };
  const scene=scenes[ui.lucasScene];if(!scene)return '';
  const title=getLucasProgress().discovered && ui.lucasScene.startsWith('fragment')?'LUCAS, O FERREIRO MARCADO':scene.title;
  const art=!['sound','approach'].includes(ui.lucasScene)?`<img class="romar-discovery-art" src="${LUCAS_ART}" alt="Lucas" onerror="this.style.display='none'">`:'';
  const body=ui.lucasScene==='workshop'?renderForgeWorkshop():scene.text.map(t=>`<p>${t}</p>`).join('');
  return `<article class="romar-discovery interactive-card">${art}<div class="romar-discovery-text"><h2>${title}</h2>${body}${ui.salvageConfirmation?'':scene.buttons.map(b=>`<button type="button" class="enter-map-btn" onclick="lucasSceneAction('${b[0]}')">${b[1]}</button>`).join('')}</div></article>`;
}

const FOREST_EVENTS = [
  { id:'chest', eyebrow:'ENCONTRO', title:'Baú Abandonado',
    sub:'Entre raízes retorcidas, um velho baú permanece fechado. Há marcas recentes no barro ao redor.',
    a:'Abrir o baú', b:'Deixar para trás' },
  { id:'corpse', eyebrow:'ENCONTRO', title:'Aventureiro Caído',
    sub:'Um viajante jaz sob as folhas. A bolsa ainda está presa ao cinto, mas um cheiro estranho paira no ar.',
    a:'Vasculhar a bolsa', b:'Respeitar os mortos' },
  { id:'shrine', eyebrow:'ENCONTRO', title:'Santuário Lunar',
    sub:'Pedras antigas formam um pequeno altar. Um brilho frio pulsa no centro, como se esperasse uma oferenda.',
    a:'Tocar o altar', b:'Afastar-se' }
];

function showForestEvent(){
  { const pool = FOREST_EVENTS.filter(e=>e.id!==lastForestEventId); pendingForestEvent = pick(pool.length?pool:FOREST_EVENTS); lastForestEventId = pendingForestEvent.id; forestEventCooldown = 2; }
  const layer = document.getElementById('notif-layer');
  const old=document.getElementById('forest-event-card'); if(old) old.remove();
  const card = document.createElement('div');
  card.id = 'forest-event-card';
  card.className = 'notif-card explore-event-card interactive-card';
  card.innerHTML = `<div class="n-eyebrow">${pendingForestEvent.eyebrow}</div><div class="n-title">${pendingForestEvent.title}</div><div class="n-sub">${pendingForestEvent.sub}</div><div class="event-choice-row"><button type="button" class="event-choice-btn primary" data-choice="yes">${pendingForestEvent.a}</button><button type="button" class="event-choice-btn" data-choice="no">${pendingForestEvent.b}</button></div>`;
  layer.appendChild(card);
  card.querySelector('[data-choice="yes"]').addEventListener('click',()=>resolveForestEvent(true),{once:true});
  card.querySelector('[data-choice="no"]').addEventListener('click',()=>resolveForestEvent(false),{once:true});
}

function showForestEventResult(eyebrow,title,sub){
  const layer=document.getElementById('notif-layer');
  const card=document.createElement('div');
  card.id='forest-event-result'; card.className='notif-card explore-event-card interactive-card event-result-card';
  card.innerHTML=`<div class="n-eyebrow">${eyebrow}</div><div class="n-title">${title}</div>${sub?`<div class="n-sub">${sub}</div>`:''}<div class="event-choice-row"><button type="button" class="event-choice-btn primary">CONTINUAR</button></div>`;
  layer.appendChild(card);
  card.querySelector('button').addEventListener('click',()=>card.remove(),{once:true});
}

function resolveForestEvent(accept){
  const ev = pendingForestEvent;
  pendingForestEvent = null;
  const card = document.getElementById('forest-event-card'); if(card) card.remove();
  if(!ev) return;
  if(!accept){
    showForestEventResult('DECISÃO','Você segue adiante','Nem todo segredo da floresta precisa ser despertado.');
    render(); return;
  }
  let eyebrow='ENCONTRO', title='', sub='';
  if(ev.id==='chest'){
    if(Math.random()<0.35){
      const dmg=randInt(8,16); player.hp=Math.max(1,player.hp-dmg);
      eyebrow='EMBOSCADA!'; title=`Mecanismo oculto · -${dmg} HP`; sub='Ao erguer a tampa, uma lâmina enferrujada dispara de dentro do baú.';
    }else{
      const coins=randInt(18,42); player.coins+=coins;
      if(Math.random()<0.30){ const item=generateItem(0,Math.min(2,forestStage()+1),false); player.inventory.push(item); player.newItemCount++; eyebrow='TESOURO'; title=`${coins} moedas + ${item.name}`; sub='O risco valeu a pena. Você encontrou equipamento entre os restos do baú.'; }
      else {eyebrow='TESOURO'; title=`+${coins} moedas`; sub='Moedas antigas ainda brilham sob a madeira apodrecida.';}
    }
  } else if(ev.id==='corpse'){
    if(Math.random()<0.30){
      const dmg=randInt(6,12); player.hp=Math.max(1,player.hp-dmg);
      eyebrow='CORRUPÇÃO'; title=`Miasma dos mortos · -${dmg} HP`; sub='Uma névoa pútrida escapa das roupas do cadáver quando você se aproxima.';
    } else {
      const roll=Math.random();
      if(roll<0.45){player.consumables.hp++; eyebrow='ACHADO'; title='Poção de Cura Pequena'; sub='Ainda intacta na bolsa do aventureiro.';}
      else if(roll<0.80){player.consumables.mp++; eyebrow='ACHADO'; title='Poção de Mana Pequena'; sub='O frasco sobreviveu à queda de seu antigo dono.';}
      else {player.consumables.xpbuff++; eyebrow='ACHADO RARO'; title='Tônico de XP'; sub='Um pequeno frasco verde estava escondido no fundo da bolsa.';}
    }
  } else if(ev.id==='shrine'){
    if(Math.random()<0.25){
      const dmg=randInt(5,10); player.hp=Math.max(1,player.hp-dmg);
      eyebrow='PRESSÁGIO'; title=`A lua rejeita sua presença · -${dmg} HP`; sub='O altar escurece e uma dor gelada atravessa seu corpo.';
    } else {
      const oldHp=player.hp, oldMp=player.mp;
      const hpTarget=Math.round(player.hpMax*0.30), mpTarget=Math.round(player.mpMax*0.30);
      player.hp=Math.min(player.hpMax,player.hp+hpTarget); player.mp=Math.min(player.mpMax,player.mp+mpTarget);
      const hpGain=player.hp-oldHp, mpGain=player.mp-oldMp;
      eyebrow='BÊNÇÃO LUNAR'; title='O santuário responde'; sub=`Você recuperou ${hpGain} HP e ${mpGain} MP.`;
    }
  }
  render();
  showForestEventResult(eyebrow,title,sub);
}
function explorarMapa(mapIndex){
  if(ui.lucasScene)return;
  if(ui.inBattle) return;
  if(hasPendingRomarDiscovery() || ui.romarResult || (ui.monster && ui.monster.romarChoice) || pendingForestEvent || document.querySelectorAll('.interactive-card').length) return;
  const lucasReady=mapIndex===1 && player.hp>0 ? advanceLucasExploration() : false;
  if(mapIndex===0) advanceRomarExploration();
  const map = MAPS[mapIndex];
  if(Math.random() < TRAP_CHANCE){
    const trap = pick(FOREST_TRAPS);
    player.hp = Math.max(1, player.hp - trap.damage);
    popNotif({ eyebrow:'ARMADILHA!', title:`${trap.name} · -${trap.damage} HP`, sub:trap.sub, image:trap.image, trap:true });
    render();
    return;
  }
  // Vertical Slice da Floresta: exploração em profundidade, eventos e mini-chefe como marco de progressão.
  if(mapIndex===0){
    const romarState=getRomarDiscoveries();
    const romarPaused=romarState.cooldown>0 || forestEventCooldown>0;
    if(romarState.cooldown>0) romarState.cooldown--;
    // Após um evento, as próximas 2 explorações não podem gerar outro evento.
    if(forestEventCooldown > 0) forestEventCooldown--;
    else if(Math.random() < FOREST_EVENT_CHANCE){ showForestEvent(); return; }
    // Descobertas são marcos únicos; se a do estágio já apareceu, seguimos para combate.
    if(Math.random() < 0.12 && forestDiscovery()) return;
    if(!romarPaused && tryRomarExploration()) return;
    startBattle(mapIndex, pickForestMonster(map), false);
    return;
  }
  if(map.miniBoss && Math.random() < MINI_BOSS_CHANCE){
    startBattle(mapIndex, map.miniBoss, false);
    return;
  }
  if(lucasReady){showLucasScene('sound');return;}
  const monster = pickWeightedMonster(map);
  startBattle(mapIndex, monster, false);
}

function startBattle(mapIndex, monsterTemplate, isBoss){
  if(ui.lucasScene)return;
  if(hasPendingRomarDiscovery()) return;
  if(ui.romarResult || (ui.monster && ui.monster.romarChoice)) return;
  ui.mapIndex = mapIndex;
  const map = MAPS[mapIndex];
  const eventOn = isMonsterEventActive();
  let hp = monsterTemplate.hp, atk = monsterTemplate.atk, def = monsterTemplate.def;
  // VS 1.5 — dificuldade-base maior, com peso crescente para encontros importantes.
  // A intenção é exigir preparo e uso de recursos, não apenas inflar barras de vida.
  const dangerHp  = monsterTemplate.isBoss ? 1.22 : monsterTemplate.isMiniBoss ? 1.18 : 1.12;
  const dangerAtk = monsterTemplate.isBoss ? 1.20 : monsterTemplate.isMiniBoss ? 1.18 : 1.12;
  const dangerDef = monsterTemplate.isBoss ? 1.10 : monsterTemplate.isMiniBoss ? 1.08 : 1.05;
  hp = Math.round(hp*dangerHp); atk = Math.round(atk*dangerAtk); def = Math.round(def*dangerDef);

  // VS 1.14 — Pântano Podre funciona como primeiro "teste de build".
  // O jogador pode entrar normalmente, mas encontra um salto perceptível de perigo,
  // incentivando voltar à Floresta Uivante para ganhar níveis e melhorar equipamentos.
  if(mapIndex===1){
    hp = Math.round(hp*1.25);
    atk = Math.round(atk*1.30);
    def = Math.round(def*1.15);
  }

  if(eventOn){
    hp = Math.round(hp*1.3); atk = Math.round(atk*1.3); def = Math.round(def*1.3);
  }
  ui.monster = Object.assign({}, monsterTemplate, { hp, atk, def, hpMax: hp, isBoss: !!isBoss, eventBuffed: eventOn, battleBaseAtk: atk, battleBaseDef: def, bossPhase: 0, desperationTriggered:false, aiTurns:0, frenzyTriggered:false, heavyPrepared:false });
  if(mapIndex===0){
    Object.assign(ui.monster, {
      grayPouncePrepared:false, youngHuntPrepared:false,
      heavyPrepareTurn:monsterTemplate.id==='uivante_sombras' ? randInt(2,4) : 0,
      packWolfActive:false, packWolfHp:0, packWolfHpMax:Math.max(8,Math.round(hp*0.12)),
      alphaChargePrepared:false, alphaChargeTurn:0,
      alphaMoonPrepared:false, alphaMoonUsed:false, alphaCounterStance:false,
      alphaNextActionTurn:1,
    });
  }
  ui.inBattle = true;
  ui.locked = false;
  ui.skillCooldowns = {};
  ui.buffs = {};
  if(ui.monster.isMiniBoss){
    battleLog = [`<b>⚠️ Algo salta das sombras!</b> <b>${ui.monster.name}</b> ${ui.monster.emoji} aparece diante de você — um encontro inesperado!${eventOn?' A Onda Sombria o fortalece ainda mais.':''}`];
  } else if(ui.monster.isBoss){
    battleLog = [ui.mapIndex===0 && ui.monster.id==='alfa_matilha' ? `<b>👑 O Alfa da Matilha surge entre as árvores.</b> O uivo cala toda a floresta${eventOn?' — a Onda Sombria torna sua presença ainda mais brutal':''}.` : `Você desafia <b>${ui.monster.name}</b> ${ui.monster.emoji}${eventOn?' — fortalecido pela Onda Sombria':''}. A batalha começa!`];
  } else {
    battleLog = eventOn
      ? [`<b>🧟 A Onda Sombria fortalece a região!</b> Você encontrou <b>${ui.monster.name}</b> ${ui.monster.emoji} (+30% de poder). A batalha começa!`]
      : [`Você encontrou <b>${ui.monster.name}</b> ${ui.monster.emoji}. A batalha começa!`];
  }
  ui.tab = 'batalha';
  render();
}

/* Romar: encontro opcional liberado pela cadeia de descobertas.
   Estado e pista seguem a duração da sessão do player, como o restante do jogo. */
function startRomarEncounter(){
  if(hasPendingRomarDiscovery()) return false;
  if(!player || player.hp<=0 || ui.inBattle || ui.romarResult || (ui.monster && ui.monster.romarChoice) || player.romar_first_choice) return false;
  ui.mapIndex=0;
  const band=player.level>=8 ? [1.15,1.10,1.08] : player.level>=6 ? [1.08,1.05,1.05] : [1,1,1];
  const hp=Math.round(300*band[0]), atk=24*band[1], def=12*band[2];
  ui.monster={id:'romar',name:'Romar',emoji:'⚔️',hp,hpMax:hp,atk,def,
    battleBaseDef:def,portrait:'assets/images/enemies/forest/romar_15.jpg',
    romarStage:1,romarHistory:[],romarPrepared:null,romarSurgePending:false,
    romarChoice:false,romarTransform:false,romarLastMove:null};
  ui.inBattle=true; ui.locked=false; ui.skillCooldowns={}; ui.buffs={}; ui.tab='batalha';
  battleLog=['<b>Romar</b> segura a arma de duas mãos. Sob a armadura, marcas rúnicas avançam.'];
  render(); return true;
}
function romarBehaviorChip(m){
  const state=m.romarPrepared==='rupture' ? 'RUPTURA DA MARCA · interrompa com '+Math.ceil(m.hpMax*0.12)+' de dano nesta ação'
    : m.romarPrepared==='heavy' ? 'GOLPE PESADO PREPARADO'
    : m.romarPrepared==='surge' ? 'SURTO RÚNICO PREPARADO · vulnerável após o golpe'
    : m.romarSurgePending ? 'SURTO AGRESSIVO IMINENTE'
    : m.def>m.battleBaseDef ? 'GUARDA DE FERRO'
    : m.def<m.battleBaseDef ? 'ROMAR VULNERÁVEL' : 'ROMAR · ESTÁGIO '+m.romarStage;
  return '<span class="arena-enemy-chip">'+state+'</span>';
}
function romarMoveFromHistory(m){
  // A ação que está sendo resolvida ainda NÃO foi inserida no histórico.
  const history=m.romarHistory.slice(-3);
  const phase=m.romarStage-1;
  const base=[[0.18,0.15,0.12,0.20],[0.22,0.18,0.15,0.15],[0.15,0.18,0.22,0.20]][phase];
  const bonus=type=>{
    const count=history.filter(a=>a===type).length;
    return count===3 ? [0.24,0.28,0.25][phase] : count===2 ? [0.18,0.22,0.20][phase] : 0;
  };
  const guard=base[0]+bonus('attack'), breaker=base[1]+bonus('defense'), pressure=base[2]+bonus('support');
  const r=Math.random();
  let move=r<guard ? 'guard' : r<guard+breaker ? 'breaker' : r<guard+breaker+pressure ? 'pressure' : r<guard+breaker+pressure+base[3] ? 'heavy' : 'normal';
  // Apenas um padrão pode predominar em três ações; o bônus retira peso do ataque normal.
  // Não encadear Guarda: mudar o padrão permite explorar a janela seguinte.
  if(move==='guard' && m.romarLastMove==='guard') move='normal';
  return move;
}
function romarFinalChoice(m){
  if(ui.monster!==m) return;
  m.hp=Math.max(m.hpMax*0.20,m.hp); m.romarPrepared=null; m.romarSurgePending=false;
  delete ui.buffs.romarFracture;
  m.romarChoice=true; ui.inBattle=false; ui.locked=false; ui.tab='batalha';
  logPush('<b>CHEGA!</b><br>“Enquanto ainda sou eu...”<br>“Vá.”');
}
function finishRomarEncounter(message){
  ui.inBattle=false; ui.locked=false; ui.monster=null; ui.buffs={}; ui.skillCooldowns={};
  ui.romarResult=message; ui.tab='batalha'; render();
}
function chooseRomarFirst(choice){
  const m=ui.monster;
  if(!m || m.id!=='romar' || !m.romarChoice || !['spared','attacked'].includes(choice)) return;
  player.romar_first_choice=choice;
  if(choice==='attacked'){
    player.questItems=player.questItems||{};
    player.questItems.fragmento_ferro_runico={name:'Fragmento de Ferro Rúnico',questClue:true};
    finishRomarEncounter('Romar repele seu ataque e foge. Ele permanece vivo.<br>Você recolhe o <b>Fragmento de Ferro Rúnico</b>, uma pista de missão.');
  } else finishRomarEncounter('Você recua. Romar permanece vivo.<br>Nenhuma recompensa material foi recebida.');
}
function continueRomarResult(){
  if(!ui.romarResult) return;
  ui.romarResult=null; ui.tab='mapa'; render();
}
function romarNonlethalDefeat(){
  player.hp=Math.max(1,Math.round(player.hpMax*0.20));
  finishRomarEncounter('Romar ergue a arma... e para.<br>“Eu mandei você ir embora.”<br>Você sobrevive ferido. O encontro continua disponível.');
}
function resolveRomarAction(kind,damage=0){
  const m=ui.monster;
  if(!ui.inBattle || !m || m.id!=='romar' || m.romarChoice) return;
  const move=romarMoveFromHistory(m);
  m.romarHistory.push(kind); m.romarHistory=m.romarHistory.slice(-3);
  m.romarTransform=false;
  m.def=m.battleBaseDef; // Guarda/vulnerabilidade duram exatamente uma ação do jogador.
  if(m.hp<=m.hpMax*0.20){
    romarFinalChoice(m); render(); return;
  }
  let transitioned=false;
  if(m.romarStage<2 && m.hp<=m.hpMax*0.65){
    m.romarStage=2; m.portrait='assets/images/enemies/forest/romar_30.jpg';
    m.romarPrepared=null; m.romarTransform=true; transitioned=true;
    logPush('<b>“Não... agora não.”</b> As runas pulsam. Romar perde a ação enquanto luta pelo controle.');
  }
  if(m.romarStage<3 && m.hp<=m.hpMax*0.35){
    m.romarStage=3; m.portrait='assets/images/enemies/forest/romar_45.jpg';
    m.romarTransform=true; transitioned=true; m.romarPrepared='rupture';
    logPush('Romar cai sobre um joelho; as marcas avançam. <b>“Fique... longe de mim.”</b>');
    logPush('<b>Ruptura da Marca preparada!</b> As runas concentram poder na arma. Uma ação de '+Math.ceil(m.hpMax*0.12)+' de dano pode interromper o golpe.');
  }
  if(!transitioned){
    if(m.romarPrepared==='rupture' && damage>=m.hpMax*0.12){
      m.romarPrepared=null; m.romarSurgePending=true;
      logPush('<b>Ruptura da Marca interrompida!</b> Romar sofre; as runas anunciam um Surto mais agressivo na próxima resposta.');
    } else if(m.romarSurgePending){
      m.romarSurgePending=false; romarStrike(m,'Surto Rúnico agressivo',1.75,0.85,false);
    } else if(m.romarPrepared){
      const rupture=m.romarPrepared==='rupture', surge=m.romarPrepared==='surge'; m.romarPrepared=null;
      romarStrike(m,rupture?'Ruptura da Marca':surge?'Surto Rúnico':'Golpe Pesado',rupture?4:1.5,(rupture||surge)?0.85:0,rupture||surge);
    } else if(move==='guard'){
      m.def=m.battleBaseDef*1.5; logPush('<b>Guarda de Ferro!</b> Romar firma a arma e protege o corpo durante sua próxima ação.');
    } else if(move==='heavy'){
      m.romarPrepared=m.romarStage===3?'rupture':'heavy';
      logPush(m.romarStage===3 ? '<b>Ruptura da Marca preparada!</b> Reaja: '+Math.ceil(m.hpMax*0.12)+' de dano nesta ação interrompem o golpe, mas provocam um Surto agressivo.' : '<b>Golpe Pesado preparado!</b> Romar ergue a arma de duas mãos.');
    } else if(move==='breaker'){
      romarStrike(m,'Quebra-Guarda',1,0.80,false,true);
    } else if(move==='pressure' && m.romarStage>=2){
      m.romarPrepared='surge';
      logPush('<b>Surto Rúnico preparado!</b> As marcas pulsam antes do golpe. Romar ficará vulnerável depois de atacar.');
    } else romarStrike(m,move==='pressure'?'Pressão ofensiva':'Ataque',1,0,false);
    m.romarLastMove=move;
  }
  if(!ui.inBattle || ui.monster!==m) return;
  tickCooldowns(); ui.locked=false; render();
}
function romarStrike(m,name,mult,pierce,vulnerable,fracture=false){
  if(!ui.inBattle || ui.monster!==m || m.romarChoice || player.hp<=0) return;
  const dodged=Math.random()<getDodgeChance();
  const damage=dodged ? 0 : Math.max(1,Math.round(calcDamage(m.atk,getEffectiveDef()*(1-pierce))*mult*(1-Math.min(.35,equippedAffixTotal('damageReduction')))));
  player.hp=Math.max(0,player.hp-damage);
  logPush(dodged ? '<span class="log-good">Você esquiva de '+name+'!</span>' : '<span class="log-bad"><b>'+name+'!</b> Romar causa '+damage+' de dano.</span>');
  if(player.hp<=0){ romarNonlethalDefeat(); return; }
  if(fracture && !dodged && ui.buffs.defBoost && ui.buffs.defBoost.turnsLeft>0){
    // O tick desta resposta consome 1; o próximo encerra a única ação afetada.
    ui.buffs.romarFracture={turnsLeft:2,mult:0.40};
    logPush('<span class="log-bad"><b>FRATURA!</b> Eficiência da DEF reduzida em 60% durante sua próxima ação e a resposta de Romar. Postura Defensiva permanece ativa.</span>');
  }
  if(vulnerable){
    m.def=m.battleBaseDef*0.70;
    logPush('Romar recupera parte do controle e fica <b>vulnerável durante sua próxima ação</b>.');
  }
}

function tickCooldowns(){
  Object.keys(ui.skillCooldowns).forEach(id=>{
    if(ui.skillCooldowns[id] > 0) ui.skillCooldowns[id]--;
  });
  Object.keys(ui.buffs).forEach(key=>{
    if(!ui.buffs[key]) return;
    ui.buffs[key].turnsLeft--;
    if(ui.buffs[key].turnsLeft <= 0) delete ui.buffs[key];
  });
}

function getEffectiveAtk(){
  let atk = player.atk;
  if(ui.buffs.atkBoost && ui.buffs.atkBoost.turnsLeft > 0) atk = Math.round(atk * ui.buffs.atkBoost.mult);
  return atk;
}

function getEffectiveDef(){
  let def = player.def;
  if(ui.buffs.defBoost && ui.buffs.defBoost.turnsLeft > 0) def = Math.round(def * ui.buffs.defBoost.mult);
  if(ui.inBattle && ui.monster && ui.monster.id==='romar' && ui.buffs.romarFracture && ui.buffs.romarFracture.turnsLeft>0) def *= ui.buffs.romarFracture.mult;
  return def;
}

function getCritChance(){
  let chance = CRIT_BASE_CHANCE;
  if(ui.buffs.critBoost && ui.buffs.critBoost.turnsLeft > 0) chance += ui.buffs.critBoost.bonus;
  chance += equippedAffixTotal('crit');
  return Math.min(0.65, chance);
}

function rollDamage(atkStat, defStat){
  const base = calcDamage(atkStat, defStat);
  const isCrit = Math.random() < getCritChance();
  const dmg = isCrit ? Math.round(base * CRIT_MULT) : base;
  return { dmg, isCrit };
}

function logPush(html){ battleLog.push(html); if(battleLog.length>40) battleLog.shift(); }

function floatNumber(side, text, cls){
  const el = document.getElementById(side==='player' ? 'portrait-player' : 'portrait-enemy');
  if(!el) return;
  const span = document.createElement('span');
  span.className = 'float-num ' + cls;
  span.textContent = text;
  el.appendChild(span);
  setTimeout(()=>span.remove(), 1000);
}

function shakeSide(side){
  const el = document.getElementById(side==='player' ? 'portrait-player' : 'portrait-enemy');
  if(!el) return;
  el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
}

function updateArenaBarsOnly(){
  const m = ui.monster;
  const pFill = document.getElementById('arena-hp-player');
  const eFill = document.getElementById('arena-hp-enemy');
  const pText = document.getElementById('arena-hp-player-text');
  const eText = document.getElementById('arena-hp-enemy-text');
  const mpFill = document.getElementById('arena-mp-player');
  const mpText = document.getElementById('arena-mp-player-text');
  if(pFill){ pFill.style.width = Math.max(0,(player.hp/player.hpMax)*100)+'%'; pText.textContent = `${player.hp}/${player.hpMax} HP`; }
  if(mpFill){ mpFill.style.width = Math.max(0,(player.mp/player.mpMax)*100)+'%'; mpText.textContent = `${player.mp}/${player.mpMax} MP`; }
  if(eFill && m){ eFill.style.width = Math.max(0,(m.hp/m.hpMax)*100)+'%'; eText.textContent = `${m.hp}/${m.hpMax} HP`; }
}

function setActionsLocked(locked){
  ui.locked = locked;
  document.querySelectorAll('.battle-actions button, .skills-row button, .consumable-row button').forEach(b=>{
    b.disabled = locked || b.dataset.forceDisabled==='1';
  });
}

/* Fases do Alfa: comando, investida e leitura das ações do jogador.
   true reserva a resposta desta rodada para anunciar a Lua, sem executá-la. */
function updateAlfaBossPhase(){
  const m = ui.monster;
  if(!ui.inBattle || !m || m.hp<=0 || !m.isBoss || ui.mapIndex!==0 || m.id!=='alfa_matilha') return false;
  const ratio = m.hp / m.hpMax;
  if(m.bossPhase < 1 && ratio <= 0.60){
    m.bossPhase = 1;
    m.packWolfActive = false; m.packWolfHp = 0;
    m.alphaChargeTurn = m.aiTurns + 2;
    logPush('<span class="log-bad"><b>Fúria da Matilha!</b> Ao ver a matilha cair, o Alfa abandona o comando e passa a caçar você pessoalmente.</span>');
  }
  if(m.bossPhase < 2 && ratio <= 0.30){
    m.bossPhase = 2;
    m.def = Math.max(1, Math.round(m.battleBaseDef * 0.82));
    m.alphaChargePrepared = false; m.alphaCounterStance = false;
    m.alphaNextActionTurn = m.aiTurns + 3;
    logPush('<span class="log-bad"><b>Instinto do Alfa!</b> Gravemente ferido, ele abandona parte da defesa e passa a estudar cada movimento seu.</span>');
    if(!m.alphaMoonUsed){
      m.alphaMoonUsed = true; m.alphaMoonPrepared = true;
      logPush('<span class="log-bad"><b>Lua da Caçada!</b> O Alfa escolheu sua presa. Seu próximo ataque será brutal se você não reagir.</span>');
      return true;
    }
  }
  return false;
}

/* Um impacto, e não a soma de ataques extras, quebra a preparação. */
function tryInterruptPreparedAttack(damage){
  const m = ui.monster;
  if(!ui.inBattle || ui.mapIndex!==0 || !m || m.hp<=0 || damage<Math.max(8,m.hpMax*0.12)) return false;
  const attacks = [
    ['grayPouncePrepared','Bote interrompido! Seu impacto quebra a postura do Lobo Cinzento.'],
    ['heavyPrepared','Golpe Brutal interrompido! O Uivante perde a abertura que preparava.'],
    ['alphaChargePrepared','Investida interrompida! O Alfa perde o equilíbrio antes de avançar.'],
    ['alphaMoonPrepared','Lua da Caçada quebrada! Você força o Alfa a abandonar seu golpe decisivo.'],
  ];
  let interrupted = false;
  attacks.forEach(([key,message])=>{
    if(m[key]){ m[key]=false; interrupted=true; logPush(`<span class="log-good"><b>${message}</b></span>`); }
  });
  return interrupted;
}

/* Comportamentos e avisos da Floresta Uivante. */
function enemyBehaviorChip(m){
  if(!m) return '';
  if(m.id==='romar') return romarBehaviorChip(m);
  if(m.id==='lobo_selvagem' && m.frenzyTriggered)
    return `<span class="arena-enemy-chip danger">🐺 FRENESI · mais forte e vulnerável</span>`;
  if(m.id==='lobo_cinzento' && m.grayPouncePrepared)
    return `<span class="arena-enemy-chip warning">BOTE PREPARADO · pode ser interrompido</span>`;
  if(m.id==='lobisomem_jovem' && m.youngHuntPrepared)
    return `<span class="arena-enemy-chip warning">INSTINTO DE CAÇA · pressionando sua brecha</span>`;
  if(m.id==='lobisomem_feroz')
    return `<span class="arena-enemy-chip${m.aiTurns%3===2?' warning':''}">🩸 MORDIDA PROFUNDA · ${m.aiTurns%3===2?'próximo ataque':m.aiTurns%3===1?'se aproxima':'à espreita'}</span>`;
  if(m.id==='uivante_sombras' && m.heavyPrepared)
    return `<span class="arena-enemy-chip warning">⚠️ GOLPE BRUTAL PREPARADO</span>`;
  if(m.id==='uivante_sombras')
    return `<span class="arena-enemy-chip">🌑 PREDADOR SOMBRIO</span>`;
  if(m.id==='alfa_matilha' && ui.mapIndex===0){
    if(m.alphaMoonPrepared) return '<span class="arena-enemy-chip warning">LUA DA CAÇADA PREPARADA</span>';
    if(m.alphaCounterStance) return '<span class="arena-enemy-chip warning">O ALFA OBSERVA SEU ATAQUE</span>';
    if(m.alphaChargePrepared) return '<span class="arena-enemy-chip warning">INVESTIDA DO ALFA PREPARADA</span>';
    if(m.packWolfActive) return `<span class="arena-enemy-chip danger">MATILHA ATIVA · Lobo ${m.packWolfHp}/${m.packWolfHpMax} HP</span>`;
    return `<span class="arena-enemy-chip">${['COMANDANTE DA MATILHA','O PREDADOR','INSTINTO DO ALFA'][m.bossPhase]}</span>`;
  }
  return '';
}

function updateEnemyBehaviorBeforeCounter(){
  const m=ui.monster;
  if(!ui.inBattle || ui.mapIndex!==0 || !m || m.hp<=0) return;

  // Frenesi: dispara uma única vez ao chegar a 35% de vida.
  if(m.id==='lobo_selvagem' && !m.frenzyTriggered && m.hp/m.hpMax<=0.35){
    m.frenzyTriggered=true;
    m.atk=Math.round(m.atk*1.25);
    m.def=Math.max(0,Math.round(m.def*0.70));
    logPush('<span class="log-bad"><b>Frenesi!</b> Ferido, o Lobo Selvagem ataca com mais força, mas abandona a cautela e fica mais vulnerável.</span>');
  }
}

function resolveEnemyAttack(contextText='revida', retaliation=false){
  const m=ui.monster;
  if(!ui.inBattle || !m || m.hp<=0 || player.hp<=0) return;
  updateEnemyBehaviorBeforeCounter();
  if(!retaliation) m.aiTurns=(m.aiTurns||0)+1;

  if(!retaliation && ui.mapIndex===0 && m.id==='lobo_cinzento' && !m.grayPouncePrepared && m.aiTurns%3===2){
    m.grayPouncePrepared=true;
    logPush('<span class="log-bad"><b>Preparando o Bote!</b> O Lobo Cinzento abaixa o corpo e fixa os olhos em você.</span>');
    return {dodged:false, damage:0, prepared:true};
  }
  if(!retaliation && ui.mapIndex===0 && m.id==='uivante_sombras' && !m.heavyPrepared && m.aiTurns>=m.heavyPrepareTurn){
    m.heavyPrepared=true;
    m.heavyPrepareTurn=m.aiTurns+randInt(2,4)+1;
    logPush('<span class="log-bad"><b>Presságio Sombrio!</b> O Uivante recua e prepara um Golpe Brutal.</span>');
    return {dodged:false, damage:0, prepared:true};
  }
  if(!retaliation && ui.mapIndex===0 && m.id==='alfa_matilha' && m.isBoss){
    if(m.bossPhase===0 && !m.packWolfActive && m.aiTurns>=m.alphaNextActionTurn){
      m.packWolfActive=true; m.packWolfHp=m.packWolfHpMax;
      m.alphaNextActionTurn=m.aiTurns+4;
      logPush('<span class="log-bad"><b>O Alfa convoca um Lobo da Matilha!</b> Elimine o lobo para quebrar a Caçada Coordenada.</span>');
      return {dodged:false, damage:0, prepared:true};
    }
    if(m.bossPhase===1 && !m.alphaChargePrepared && m.aiTurns>=m.alphaChargeTurn){
      m.alphaChargePrepared=true; m.alphaChargeTurn=m.aiTurns+3;
      logPush('<span class="log-bad"><b>Investida Preparada!</b> O Alfa recua e cava a terra com as patas.</span>');
      return {dodged:false, damage:0, prepared:true};
    }
    if(m.bossPhase===2 && !m.alphaMoonPrepared && !m.alphaCounterStance && m.aiTurns>=m.alphaNextActionTurn){
      m.alphaCounterStance=true; m.alphaNextActionTurn=m.aiTurns+3;
      logPush('<span class="log-bad"><b>O Alfa observa.</b> Ele espera um ataque precipitado para retaliar.</span>');
      return {dodged:false, damage:0, prepared:true};
    }
  }

  let mult=retaliation ? 1.25 : 1;
  let attackName=retaliation ? 'Retaliação do Alfa' : '';

  // Lobisomem: a cada 3º ataque efetivo, uma mordida mais perigosa.
  if(!retaliation && m.id==='lobisomem_feroz' && m.aiTurns%3===0){
    mult=1.35;
    attackName='🩸 Mordida Profunda';
  }

  // Uivante: golpe previamente anunciado.
  if(!retaliation && m.id==='uivante_sombras' && m.heavyPrepared){
    mult=1.75;
    attackName='🌑 Golpe Brutal';
    m.heavyPrepared=false;
  }
  if(!retaliation && m.grayPouncePrepared){ mult=1.55; attackName='Bote'; m.grayPouncePrepared=false; }
  if(!retaliation && m.youngHuntPrepared){ mult=1.40; attackName='Instinto de Caça'; m.youngHuntPrepared=false; }
  if(!retaliation && m.alphaChargePrepared){ mult=1.65; attackName='Investida do Alfa'; m.alphaChargePrepared=false; }
  if(!retaliation && m.alphaMoonPrepared){ mult=2.0; attackName='Lua da Caçada'; m.alphaMoonPrepared=false; }

  // Uma tentativa de golpe consome a preparação mesmo quando o jogador esquiva.
  const dodged=Math.random()<getDodgeChance();
  if(dodged){
    floatNumber('player','ESQUIVA!','dodge');
    logPush(`<span class="log-good">Você esquiva do ataque de ${m.name}!</span>`);
    if(!retaliation) resolvePackWolfAttack(m);
    return {dodged:true, damage:0};
  }

  let dmg2=calcDamage(m.atk,getEffectiveDef());
  dmg2=Math.max(1,Math.round(dmg2*mult*(1-Math.min(.35,equippedAffixTotal('damageReduction')))));
  player.hp=Math.max(0,player.hp-dmg2);
  floatNumber('player','-'+dmg2,'dmg');
  shakeSide('player');

  if(attackName){
    logPush(`<span class="log-bad"><b>${attackName}!</b> ${m.name} causa ${dmg2} de dano em você.</span>`);
  }else{
    logPush(`<span class="log-bad">${m.name} ${contextText} e causa ${dmg2} de dano em você.</span>`);
  }
  if(!retaliation) resolvePackWolfAttack(m);
  return {dodged:false, damage:dmg2};
}

function resolvePackWolfAttack(m){
  if(!ui.inBattle || ui.monster!==m || ui.mapIndex!==0 || m.id!=='alfa_matilha' || m.bossPhase!==0 || !m.packWolfActive || m.hp<=0 || player.hp<=0) return;
  if(Math.random()<getDodgeChance()){
    logPush('<span class="log-good">Caçada Coordenada! Você esquiva do Lobo da Matilha.</span>'); return;
  }
  let damage=calcDamage(Math.max(1,Math.round(m.battleBaseAtk*0.35)),getEffectiveDef());
  damage=Math.max(1,Math.round(damage*(1-Math.min(.35,equippedAffixTotal('damageReduction')))));
  player.hp=Math.max(0,player.hp-damage);
  floatNumber('player','-'+damage,'dmg');
  logPush(`<span class="log-bad"><b>Caçada Coordenada!</b> O Lobo da Matilha causa ${damage} de dano adicional.</span>`);
}

function attackPackWolf(){
  const m=ui.monster;
  if(!ui.inBattle || ui.locked || !m || ui.mapIndex!==0 || m.id!=='alfa_matilha' || m.bossPhase!==0 || !m.packWolfActive) return;
  const hit=rollDamage(getEffectiveAtk(),m.battleBaseDef);
  m.packWolfHp=Math.max(0,m.packWolfHp-hit.dmg);
  logPush(`<span class="log-good">Você ataca o Lobo da Matilha e causa ${hit.dmg} de dano${hit.isCrit?' crítico':''}.</span>`);
  if(m.packWolfHp<=0){
    m.packWolfActive=false; m.alphaNextActionTurn=Math.max(m.alphaNextActionTurn,m.aiTurns+3);
    logPush('<span class="log-good"><b>Lobo da Matilha abatido.</b> A Caçada Coordenada foi quebrada.</span>');
  }
  monsterCounterTurn(false);
  render();
}

/* Executa uma rodada: dano do jogador no monstro, depois (se vivo) contra-ataque do monstro */
function resolvePlayerHit(dmg, isCrit, impacts=[dmg]){
  const m = ui.monster;
  if(!ui.inBattle || ui.locked || !m || m.hp<=0 || player.hp<=0) return;
  setActionsLocked(true);
  const executeBonus = (m.hp/m.hpMax)<=0.35 ? equippedAffixTotal('execute') : 0;
  if(executeBonus>0) dmg = Math.round(dmg*(1+executeBonus));
  m.hp = Math.max(m.id==='romar' ? m.hpMax*0.20 : 0, m.hp - dmg);
  tryInterruptPreparedAttack(Math.max(...impacts.map(hit=>executeBonus>0 ? Math.round(hit*(1+executeBonus)) : hit)));
  const steal = equippedAffixTotal('lifesteal');
  if(steal>0 && dmg>0){
    const heal=Math.max(1,Math.round(dmg*steal));
    const before=player.hp; player.hp=Math.min(player.hpMax,player.hp+heal);
    if(player.hp>before) logPush(`<span class="log-good">🩸 Equipamento drena ${player.hp-before} HP.</span>`);
  }
  floatNumber('enemy', (isCrit?'CRÍTICO -':'-')+dmg, isCrit?'crit':'dmg');
  shakeSide('enemy');
  updateArenaBarsOnly();

  // A retaliação substitui o contra-ataque desta rodada; golpe letal não a dispara.
  if(m.id==='romar'){ resolveRomarAction('attack',dmg); return; }
  const retaliated=ui.mapIndex===0 && m.id==='alfa_matilha' && m.hp>0 && m.alphaCounterStance;
  if(retaliated){
    m.alphaCounterStance=false; m.aiTurns++;
    logPush('<span class="log-bad"><b>Retaliação do Alfa!</b> Ele esperava seu ataque e responde imediatamente.</span>');
    resolveEnemyAttack('retalia',true);
    updateArenaBarsOnly();
  }

  setTimeout(()=>{
    if(!ui.inBattle || ui.monster!==m) return;
    if(player.hp<=0){ handleDefeat(); render(); return; }
    if(m.hp<=0){
      logPush(`<b>${m.name} foi derrotado!</b>`);
      handleVictory(m);
      render();
      return;
    }
    const moonAnnounced=updateAlfaBossPhase();
    // Mini-chefes entram em desespero quando muito feridos: um pico curto de perigo que
    // recompensa guardar cura/defesa para o fim, sem simplesmente multiplicar o HP.
    if(m.isMiniBoss && !m.desperationTriggered && m.hp/m.hpMax <= 0.40){
      m.desperationTriggered = true;
      m.atk = Math.round(m.atk * 1.20);
      logPush(`<span class="log-bad"><b>⚠️ Fúria Desesperada!</b> ${m.name} fica mais agressivo ao sentir a morte próxima.</span>`);
      popNotif({ eyebrow:'PERIGO', title:'Fúria Desesperada', sub:'O mini-chefe causa mais dano abaixo de 40% de HP.' });
    }
    if(!retaliated && !moonAnnounced) resolveEnemyAttack('revida');
    updateArenaBarsOnly();
    tickCooldowns();

    setTimeout(()=>{
      if(!ui.inBattle || ui.monster!==m) return;
      if(player.hp<=0){
        logPush(`<b>Você caiu em combate...</b> Você desperta enfraquecido, mas vivo.`);
        handleDefeat();
      } else {
        ui.locked = false;
      }
      render();
    }, 420);
  }, 480);
}

function playerAttack(){
  if(!ui.inBattle || ui.locked) return;
  const m = ui.monster;
  const { dmg, isCrit } = rollDamage(getEffectiveAtk(), m.def);
  logPush(isCrit
    ? `<span class="log-drop"><b>CRÍTICO!</b> Você ataca ${m.name} e causa ${dmg} de dano.</span>`
    : `<span class="log-good">Você ataca ${m.name} e causa ${dmg} de dano.</span>`);
  let totalDmg = dmg;
  const impacts = [dmg];
  if(m.hp - totalDmg > 0 && Math.random() < getExtraAttackChance()){
    const extra = rollDamage(getEffectiveAtk(), m.def);
    totalDmg += extra.dmg;
    impacts.push(extra.dmg);
    logPush(`<span class="log-drop">⚡ Ataque extra! +${extra.dmg}${extra.isCrit?' (crítico!)':''} de dano adicional.</span>`);
  }
  resolvePlayerHit(totalDmg, isCrit, impacts);
}

function getMagInvested(){ return (player.allocated && player.allocated.magia) || 0; }
function hasMagMilestone(n){ return player.classKey==='mago' && getMagInvested()>=n; }
function getMagDomain(){ return player.magDomain || null; }
function chooseMagDomain(domain){
  if(!hasMagMilestone(100)){ showToast('Requer 100 pontos em MAG.'); return; }
  if(!['destruidor','proibido'].includes(domain)) return;
  player.magDomain = domain;
  showToast(domain==='destruidor' ? 'Domínio escolhido: Arcano Destruidor.' : 'Domínio escolhido: Arcano Proibido.');
  render();
}
function getSkillMpCost(skill){
  let cost = skill.mpCost;
  if(player.classKey==='mago') cost *= (1-Math.min(.35,equippedAffixTotal('manaEfficiency')));
  return Math.max(1,Math.ceil(cost));
}
function getMagicBuildMultiplier(){
  if(player.classKey!=='mago') return 1;
  let mult=1+equippedAffixTotal('magicDamage');
  if(hasMagMilestone(25)) mult += 0.05;
  if(player.hp/player.hpMax<=.40) mult += equippedAffixTotal('lowHpMagic');
  return mult;
}

function usarSkill(skillId){
  if(!ui.inBattle || ui.locked) return;
  const skill = (SKILLS[player.classKey]||[]).find(s=>s.id===skillId);
  if(!skill || player.level < skill.unlockLevel) return;
  let actualMpCost=getSkillMpCost(skill);
  let hpPaid=0;
  let overcharged=false;
  if(hasMagMilestone(100) && getMagDomain()==='destruidor' && player.overchargeNext){
    actualMpCost=Math.ceil(actualMpCost*1.5); overcharged=true; player.overchargeNext=false;
  }
  if(player.mp < actualMpCost){
    if(hasMagMilestone(100) && getMagDomain()==='proibido'){
      hpPaid=actualMpCost-player.mp;
      if(player.hp<=hpPaid){ showToast('A Conjuração Proibida consumiria toda a sua vida.'); return; }
      player.hp-=hpPaid; player.mp=0;
      logPush(`<span class="log-bad">🩸 Conjuração Proibida: ${hpPaid} HP consumido para completar o custo.</span>`);
    } else return;
  } else player.mp-=actualMpCost;
  ui.skillCooldowns[skill.id] = SKILL_COOLDOWN_TURNS;

  if(skill.heal){
    const baseStat = player.classKey==='mago' ? player.magia : getEffectiveAtk();
    const heal = Math.round(baseStat*skill.healMult);
    player.hp = Math.min(player.hpMax, player.hp+heal);
    floatNumber('player', '+'+heal, 'heal');
    logPush(`<span class="log-good">Você usa ${skill.icon} ${skill.name} e recupera ${heal} de HP.</span>`);
    monsterCounterTurn();
    return;
  }

  if(skill.buff){
    if(skill.buff==='atk'){
      ui.buffs.atkBoost = { turnsLeft: skill.buffTurns + 1, mult: skill.buffMult };
      logPush(`<span class="log-good">Você usa ${skill.icon} ${skill.name}! Força +${Math.round((skill.buffMult-1)*100)}% por ${skill.buffTurns} turnos.</span>`);
    } else if(skill.buff==='crit'){
      ui.buffs.critBoost = { turnsLeft: skill.buffTurns + 1, bonus: skill.buffBonus };
      logPush(`<span class="log-good">Você usa ${skill.icon} ${skill.name}! Chance crítica +${Math.round(skill.buffBonus*100)}% por ${skill.buffTurns} turnos.</span>`);
    } else if(skill.buff==='def'){
      ui.buffs.defBoost = { turnsLeft: skill.buffTurns + 1, mult: skill.buffMult };
      logPush(`<span class="log-good">Você usa ${skill.icon} ${skill.name}! Defesa +${Math.round((skill.buffMult-1)*100)}% por ${skill.buffTurns} turnos.</span>`);
    }
    monsterCounterTurn(true,skill.id==='postura_defensiva' ? 'defense' : 'support');
    return;
  }

  const m = ui.monster;
  let pierce=skill.defPierce||0;
  if(player.classKey==='mago' && hasMagMilestone(75) && skill.mpCost>=14) pierce=Math.max(pierce,0.20);
  const effDef=m.def*(1-pierce);
  const baseStat = player.classKey==='mago' ? player.magia : getEffectiveAtk();
  let buildMult = player.classKey==='mago' ? getMagicBuildMultiplier() : 1;
  if(overcharged) buildMult*=1.35;
  const { dmg, isCrit } = rollDamage(Math.round(baseStat*skill.mult*buildMult), effDef);
  logPush(isCrit
    ? `<span class="log-drop"><b>CRÍTICO!</b> Você usa ${skill.icon} ${skill.name} e causa ${dmg} de dano.</span>`
    : `<span class="log-mp">Você usa ${skill.icon} ${skill.name} e causa ${dmg} de dano.</span>`);
  let totalDmg = dmg;
  const impacts = [dmg];
  if(player.classKey==='mago' && hasMagMilestone(50) && isCrit){
    const refund=Math.max(1,Math.floor(getSkillMpCost(skill)*0.25));
    player.mp=Math.min(player.mpMax,player.mp+refund);
    logPush(`<span class="log-mp">✦ Eco Arcano recupera ${refund} MP.</span>`);
  }
  if(m.hp - totalDmg > 0 && Math.random() < getExtraAttackChance()){
    const extra = rollDamage(Math.round(baseStat*skill.mult*buildMult), effDef);
    totalDmg += extra.dmg;
    impacts.push(extra.dmg);
    logPush(`<span class="log-drop">⚡ Ataque extra! +${extra.dmg}${extra.isCrit?' (crítico!)':''} de dano adicional.</span>`);
  }
  if(skill.lifesteal){
    const heal = Math.round(totalDmg*skill.lifesteal);
    player.hp = Math.min(player.hpMax, player.hp+heal);
    floatNumber('player', '+'+heal, 'heal');
    logPush(`<span class="log-good">Você absorve ${heal} de HP.</span>`);
  }
  resolvePlayerHit(totalDmg, isCrit, impacts);
}

/* Contra-ataque do monstro para ações que não atingem o inimigo diretamente (cura, poções) */
function monsterCounterTurn(nonOffensive=true,romarAction='support'){
  if(!ui.inBattle || ui.locked || !ui.monster || ui.monster.hp<=0 || player.hp<=0) return;
  if(ui.monster.id==='romar'){ resolveRomarAction(romarAction); return; }
  updateArenaBarsOnly();
  setActionsLocked(true);
  const m = ui.monster;
  if(nonOffensive && ui.mapIndex===0){
    if(m.id==='lobisomem_jovem'){
      m.youngHuntPrepared=true;
      logPush('<span class="log-bad">O Lobisomem Jovem percebe sua pausa e avança para pressionar a brecha.</span>');
      render();
    }
    if(m.id==='alfa_matilha' && m.alphaCounterStance){
      m.alphaCounterStance=false;
      logPush('<span class="log-good">Você não cai na provocação. O Alfa abandona a postura de retaliação.</span>');
    }
  }
  setTimeout(()=>{
    if(!ui.inBattle || ui.monster!==m || m.hp<=0) return;
    resolveEnemyAttack('aproveita a brecha');
    updateArenaBarsOnly();
    tickCooldowns();
    setTimeout(()=>{
      if(!ui.inBattle || ui.monster!==m) return;
      if(player.hp<=0){
        logPush(`<b>Você caiu em combate...</b> Você desperta enfraquecido, mas vivo.`);
        handleDefeat();
      } else {
        ui.locked = false;
      }
      render();
    }, 380);
  }, 380);
}

function usarConsumivelBatalha(type){
  if(!ui.inBattle || ui.locked) return;
  const hpPotions = {
    hp:{heal:50,name:'Poção de Sangue Vivo'},
    hp_medium:{heal:120,name:'Poção de Sangue Rubro'},
    hp_major:{heal:250,name:'Poção de Sangue Ancestral'}
  };
  if(hpPotions[type]){
    if((player.consumables[type]||0)<=0) return;
    player.consumables[type]--;
    const {heal,name} = hpPotions[type];
    const recovered = Math.min(heal, player.hpMax-player.hp);
    player.hp = Math.min(player.hpMax, player.hp+heal);
    floatNumber('player', '+'+recovered, 'heal');
    logPush(`<span class="log-good">Você bebe uma ${name} e recupera ${recovered} HP.</span>`);
  } else {
    const mpPotions={mp:{restore:30,name:'Frasco de Éter Lunar'},mp_medium:{restore:70,name:'Essência de Éter Lunar'},mp_major:{restore:150,name:'Éter Lunar Concentrado'}};
    const pot=mpPotions[type]; if(!pot || (player.consumables[type]||0)<=0) return;
    player.consumables[type]--; const recovered=Math.min(pot.restore,player.mpMax-player.mp); player.mp=Math.min(player.mpMax,player.mp+pot.restore);
    logPush(`<span class="log-mp">Você bebe ${pot.name} e recupera ${recovered} MP.</span>`);
  }
  monsterCounterTurn();
}

function fleeBattle(){
  if(ui.romarResult || (ui.monster && ui.monster.romarChoice)) return;
  delete ui.buffs.romarFracture;
  ui.inBattle = false; ui.monster = null; ui.tab = 'mapa'; ui.locked = false;
  render();
}

function handleDefeat(){
  if(ui.monster && ui.monster.id==='romar'){ romarNonlethalDefeat(); return; }
  ui.inBattle = false;
  const oldLevel = player.level;
  const lost = Math.round(player.totalXp * DEATH_XP_PENALTY);
  player.totalXp = Math.max(0, player.totalXp - lost);
  recomputeLevelFromXp();
  recomputeStats();
  player.hp = Math.round(player.hpMax*0.5);
  const deleveled = player.level < oldLevel;
  logPush(`<span class="log-bad">Você caiu em batalha e perdeu ${lost} de experiência${deleveled?` — voltando ao nível ${player.level}`:''}.</span>`);
  popNotif({ eyebrow:'DERROTA', title: deleveled ? `Nível reduzido para ${player.level}` : `-${lost} XP`, sub: deleveled ? 'A escuridão consumiu seu progresso' : 'A escuridão cobra um preço alto', persist:true });
  ui.monster = null;
  ui.locked = false;
}

function handleVictory(m){
  if(m.id==='romar'){ romarFinalChoice(m); return; }
  ui.inBattle = false;
  ui.locked = false;
  player.coins += randInt(m.coinMin, m.coinMax);

  const xpEventOn = isXpEventActive();
  let xpGain = m.xp;
  const buffActive = Date.now() < player.xpBuffUntil;
  let xpBonusLabel = '';
  if(xpEventOn && buffActive){
    // não empilha: durante o evento, o bônus do evento (maior) prevalece sobre o tônico
    xpGain = Math.round(xpGain*2);
    xpBonusLabel = ' (+100% evento, tônico em espera)';
  } else if(xpEventOn){
    xpGain = Math.round(xpGain*2);
    xpBonusLabel = ' (+100% evento)';
  } else if(buffActive){
    xpGain = Math.round(xpGain*1.3);
    xpBonusLabel = ' (+30% tônico)';
  }
  player.totalXp = (player.totalXp||0) + xpGain;
  logPush(`<span class="log-good">+${xpGain} XP${xpBonusLabel} · +moedas</span>`);
  if(xpEventOn) popNotif({ eyebrow:'EVENTO ATIVO', title:'Bênção da Lua Cheia', sub:'XP e drops em dobro' });

  const oldLevel = player.level;
  recomputeLevelFromXp();
  const levelsGained = player.level - oldLevel;
  const leveledUp = levelsGained > 0;
  if(leveledUp){
    player.statPoints += levelsGained * 5;
  }
  recomputeStats();
  if(leveledUp){
    player.hp = player.hpMax;
    player.mp = player.mpMax;
    logPush(`<b>Você subiu para o nível ${player.level}!</b> HP e MP restaurados. +${levelsGained*5} pontos de status disponíveis.`);
    popNotif({ eyebrow:'NÍVEL ALCANÇADO', title:`Nível ${player.level}`, sub:`+${levelsGained*5} pontos de status para distribuir`, levelup:true });
  }

  // Progressão experimental da Floresta Uivante (Vertical Slice 1.2)
  if(ui.mapIndex===0){
    const fp = getForestProgress();
    if(m.isMiniBoss){
      fp.miniBossKills = (fp.miniBossKills||0) + 1;
      fp.commonKillsAtLastMiniBossVictory = fp.commonKills;
      if(!fp.miniBossDefeated){
        fp.miniBossDefeated = true;
        popNotif({ eyebrow:'CAÇADA CONCLUÍDA', title:'Uivante das Sombras derrotado', sub:'O caminho para o Alfa da Matilha foi revelado. Você pode enfrentá-lo agora ou derrotar mais 7 criaturas para rastrear o Uivante novamente e buscar equipamentos.' });
      } else {
        popNotif({ eyebrow:'PRESA ABATIDA', title:'Uivante das Sombras derrotado novamente', sub:'O rastro se perdeu na floresta. Derrote mais 7 criaturas para localizá-lo outra vez.' });
      }
    } else if(!m.isBoss){
      fp.commonKills++;
      if(fp.commonKills===5) popNotif({ eyebrow:'FLORESTA UIVANTE', title:'Trilhas Profundas', sub:'Você deixou a borda para trás. Criaturas mais perigosas começam a surgir.' });
      if(fp.commonKills===10) popNotif({ eyebrow:'FLORESTA UIVANTE', title:'Coração da Floresta', sub:'Os uivos estão próximos. O rastro do Uivante das Sombras ficou mais forte.' });
      const target = getForestMiniBossTarget();
      if(fp.commonKills===14 && (fp.miniBossKills||0)===0) popNotif({ eyebrow:'RASTRO COMPLETO', title:'Uivante das Sombras localizado', sub:'A caçada chegou ao covil. O mini-chefe agora pode ser desafiado.' });
      else if((fp.miniBossKills||0)>0 && fp.commonKills===target) popNotif({ eyebrow:'O UIVANTE RETORNOU', title:'O rastro surgiu novamente', sub:'Sete novas criaturas foram abatidas. O Uivante das Sombras pode ser caçado outra vez.' });
    }
  }

  // VS 1.17.1 — Pântano Podre: 14 abates revelam o Devorador pela primeira vez.
  // Depois de cada vitória sobre ele, são necessários mais 7 abates comuns para rastreá-lo novamente.
  // O Senhor do Pântano permanece desbloqueado após a primeira vitória sobre o Devorador.
  if(ui.mapIndex===1){
    const sp = getSwampProgress();
    if(m.isMiniBoss){
      sp.miniBossKills = (sp.miniBossKills||0) + 1;
      sp.commonKillsAtLastMiniBossVictory = sp.commonKills;
      if(!sp.miniBossDefeated){
        sp.miniBossDefeated = true;
        popNotif({ eyebrow:'CAÇADA CONCLUÍDA', title:'Devorador do Charco derrotado', sub:'O domínio do Senhor do Pântano foi revelado. Você pode enfrentá-lo agora ou caçar mais 7 criaturas para rastrear o Devorador novamente e buscar novos equipamentos.' });
      } else {
        popNotif({ eyebrow:'PRESA ABATIDA', title:'Devorador do Charco derrotado novamente', sub:'O rastro se perdeu no charco. Derrote mais 7 criaturas para localizá-lo outra vez.' });
      }
    } else if(!m.isBoss){
      sp.commonKills++;
      const target = getSwampMiniBossTarget();
      if(sp.commonKills===14 && (sp.miniBossKills||0)===0){
        popNotif({ eyebrow:'RASTRO COMPLETO', title:'Devorador do Charco localizado', sub:'Depois de 14 criaturas abatidas, o mini-chefe do Pântano Podre agora pode ser desafiado.' });
      } else if((sp.miniBossKills||0)>0 && sp.commonKills===target){
        popNotif({ eyebrow:'O DEVORADOR RETORNOU', title:'O rastro surgiu novamente', sub:'Sete novas criaturas foram abatidas. O Devorador do Charco pode ser caçado outra vez.' });
      }
    }
  }

  if(m.isBoss && !player.defeatedBosses.includes(ui.mapIndex)){
    player.defeatedBosses.push(ui.mapIndex);
    const nextMap = MAPS[ui.mapIndex+1];
    if(nextMap){
      popNotif({ eyebrow:'TERRITÓRIO CONQUISTADO', title:`${MAPS[ui.mapIndex].name} dominado!`, sub:ui.mapIndex===0 ? `${nextMap.name} foi desbloqueado` : `${nextMap.name} agora pode ser desbloqueado` });
    }
  }

  const dropMult = xpEventOn ? 2 : 1;
  let dropChance;
  if(m.isBoss) dropChance = 1; // chefe do território sempre recompensa com um item
  else if(m.isMiniBoss) dropChance = Math.min(1, 0.75*dropMult);
  else dropChance = Math.min(1, 0.35*dropMult);
  // Chefes agora garantem ao menos Épico; mini-chefes garantem ao menos Raro.
  // Isso compensa a progressão mais lenta com picos de recompensa realmente relevantes.
  const minRarity = m.isBoss ? 'épico' : m.isMiniBoss ? 'raro' : null;
  if(Math.random() < dropChance){
    let item;
    // O Alfa usa a tabela normal de chefe: equipamento forte para preparar a transição ao Pântano.
    item = generateItem(ui.mapIndex, m.tier||0, !!m.isBoss, minRarity);
    player.inventory.push(item);
    player.newItemCount = (player.newItemCount||0) + 1;
    logPush(`<span class="log-drop">Item encontrado: ${item.name} [${item.rarity}] (${itemDesc(item)})</span>`);
    popNotif({ eyebrow:'ITEM CONQUISTADO', title:item.name, sub:`${item.rarity} · ${itemDesc(item)}` });
  }

  const potionChance = Math.min(1, (m.isBoss ? 0.7 : m.isMiniBoss ? 0.5 : 0.32) * dropMult);
  if(Math.random() < potionChance){
    const isHp = Math.random() < 0.55;
    if(isHp){
      player.consumables.hp++;
      logPush(`<span class="log-drop">Drop: Poção de Sangue Vivo 🧪</span>`);
      popNotif({ eyebrow:'DROP', title:'Poção de Sangue Vivo', sub:'+1 Poção de Cura Pequena adicionada ao inventário.' });
    } else {
      player.consumables.mp++;
      logPush(`<span class="log-drop">Drop: Frasco de Éter Lunar 💧</span>`);
      popNotif({ eyebrow:'DROP', title:'Frasco de Éter Lunar', sub:'+1 Poção de Mana Pequena adicionada ao inventário.' });
    }
  }

  const xpBuffDropChance = Math.min(1, (m.isBoss ? 0.12 : m.isMiniBoss ? 0.08 : 0.03) * dropMult);
  if(Math.random() < xpBuffDropChance){
    player.consumables.xpbuff++;
    logPush(`<span class="log-drop">Drop raro: Tônico da Fúria da Caçada 📜</span>`);
    popNotif({ eyebrow:'ITEM RARO CONQUISTADO', title:'Tônico da Fúria da Caçada', sub:'+30% de XP por abate ao usar' });
  }

  popNotif({
    eyebrow:'VITÓRIA',
    title:`${m.name} derrotado`,
    sub:`+${xpGain} XP conquistados. Resultado concluído.`,
    persist:true
  });
  ui.monster = null;
}

/* =========================================================
   INVENTÁRIO
   ========================================================= */
function equipItem(uid){
  const idx = player.inventory.findIndex(i=>i.uid===uid);
  if(idx===-1) return;
  const item = player.inventory[idx];
  if(!SLOT_ORDER.includes(item.slot)){showToast('Este equipamento legado não pode mais ser equipado.');return;}

  if(item.classReq && item.classReq !== player.classKey){
    showToast(`Somente ${CLASS_LABEL[item.classReq]} pode usar este item.`);
    return;
  }
  if(item.levelReq && player.level < item.levelReq){
    showToast(`Requer nível ${item.levelReq}.`);
    return;
  }
  if(!itemMeetsRequirements(item)){
    const missing = Object.keys(item.statReq||{}).filter(k => (player[k]||0) < item.statReq[k]);
    showToast(`Requisito insuficiente: ${missing.map(k=>`${REQ_LABELS[k]} ${item.statReq[k]}+`).join(', ')}`);
    return;
  }
  if(item.slot==='shield' && player.equipment.weapon && player.equipment.weapon.twoHanded){
    showToast('Não é possível usar escudo com uma arma de duas mãos equipada.');
    return;
  }

  const prev = player.equipment[item.slot];
  player.equipment[item.slot] = item;
  player.inventory.splice(idx,1);
  if(prev) player.inventory.push(prev);

  if(item.slot==='weapon' && item.twoHanded && player.equipment.shield){
    player.inventory.push(player.equipment.shield);
    player.equipment.shield = null;
    showToast(`${item.name} equipado. Escudo removido (arma de duas mãos).`);
  } else {
    showToast(`${item.name} equipado.`);
  }
  recomputeStats();
  render();
}

function unequipItem(slot){
  const item = player.equipment[slot];
  if(!item) return;
  player.equipment[slot] = null;
  player.inventory.push(item);
  recomputeStats();
  render();
}

function sellItem(uid){
  const idx = player.inventory.findIndex(i=>i.uid===uid);
  if(idx===-1) return;
  const item = player.inventory[idx];
  player.coins += item.value;
  player.inventory.splice(idx,1);
  showToast(`Vendido ao mercador por ${item.value} moedas.`);
  render();
}

function usarConsumivelFora(type){
  const hpPotions = {
    hp:{heal:50,name:'Poção de Sangue Vivo'},
    hp_medium:{heal:120,name:'Poção de Sangue Rubro'},
    hp_major:{heal:250,name:'Poção de Sangue Ancestral'}
  };
  if(hpPotions[type]){
    if((player.consumables[type]||0)<=0) return;
    player.consumables[type]--;
    const {heal,name} = hpPotions[type];
    const recovered = Math.min(heal, player.hpMax-player.hp);
    player.hp = Math.min(player.hpMax, player.hp+heal);
    showToast(`${name} usada. +${recovered} HP.`);
  } else {
    const mpPotions={mp:{restore:30,name:'Frasco de Éter Lunar'},mp_medium:{restore:70,name:'Essência de Éter Lunar'},mp_major:{restore:150,name:'Éter Lunar Concentrado'}};
    const pot=mpPotions[type]; if(!pot || (player.consumables[type]||0)<=0) return;
    player.consumables[type]--; const recovered=Math.min(pot.restore,player.mpMax-player.mp); player.mp=Math.min(player.mpMax,player.mp+pot.restore);
    showToast(`${pot.name} usado. +${recovered} MP.`);
  }
  render();
}

const REST_XP_COST_PCT = 0.15; // % do XP do nível atual sacrificado
const REST_HEAL_PCT = 0.5;     // % do HP máximo recuperado

function descansar(){
  if(ui.inBattle){ showToast('Não é possível descansar em combate.'); return; }
  if(player.hp >= player.hpMax){ showToast('Seu HP já está cheio.'); return; }
  if(player.xp <= 0){ showToast('Sem XP suficiente para sacrificar. Vá caçar um pouco antes de descansar.'); return; }
  const cost = Math.max(1, Math.min(player.xp, Math.round(xpToNext(player.level)*REST_XP_COST_PCT)));
  const heal = Math.round(player.hpMax*REST_HEAL_PCT);
  player.xp -= cost;
  player.totalXp = Math.max(0, player.totalXp - cost);
  player.hp = Math.min(player.hpMax, player.hp + heal);
  showToast(`Você descansou à sombra. -${cost} XP, +${heal} HP.`);
  render();
}

function usarTonicoFuria(){
  if(player.consumables.xpbuff<=0) return;
  player.consumables.xpbuff--;
  const now = Date.now();
  const base = player.xpBuffUntil > now ? player.xpBuffUntil : now;
  player.xpBuffUntil = base + TONIC_XP_DURATION;
  showToast('Tônico da Fúria da Caçada ativado! +30% de XP por 5 minutos.');
  render();
}

function buyShopItem(id){
  const p = SHOP_ITEMS.find(x=>x.id===id);
  if(!p || player.coins < p.price) return;
  player.coins -= p.price;
  if(p.type==='consumable_hp'){ player.consumables.hp++; showToast(`${p.name} comprado. Vá em Inventário para usar.`); render(); return; }
  if(p.type==='consumable_hp_medium'){ player.consumables.hp_medium=(player.consumables.hp_medium||0)+1; showToast(`${p.name} comprado. Vá em Inventário para usar.`); render(); return; }
  if(p.type==='consumable_hp_major'){ player.consumables.hp_major=(player.consumables.hp_major||0)+1; showToast(`${p.name} comprado. Vá em Inventário para usar.`); render(); return; }
  if(p.type==='consumable_mp'){ player.consumables.mp++; showToast(`${p.name} comprado. Vá em Inventário para usar.`); render(); return; }
  if(p.type==='consumable_mp_medium'){ player.consumables.mp_medium=(player.consumables.mp_medium||0)+1; showToast(`${p.name} comprado. Vá em Inventário para usar.`); render(); return; }
  if(p.type==='consumable_mp_major'){ player.consumables.mp_major=(player.consumables.mp_major||0)+1; showToast(`${p.name} comprado. Vá em Inventário para usar.`); render(); return; }
  showToast(`${p.name} comprado.`);
  render();
}

/* =========================================================
   RENDER
   ========================================================= */
function renderClassSelect(){
  const wrap = document.getElementById('class-select');
  wrap.innerHTML = Object.entries(CLASSES).map(([key,c])=>{
    const skillNames = SKILLS[key].map(s=>s.name).join(' · ');
    return `
    <div class="class-card">
      ${c.portrait ? classAvatarHtml(key,'class-portrait-img') : `<span class="class-emoji">${c.emoji}</span>`}
      <h3>${c.name}</h3>
      <span class="class-tag">${c.tag}</span>
      <ul class="class-stats">
        <li><span>HP inicial</span><b>${c.baseHp}</b></li>
        <li><span>MP inicial</span><b>${c.baseMp}</b></li>
        <li><span>Ataque inicial</span><b>${c.baseAtk}</b></li>
        <li><span>Magia inicial</span><b>${c.baseMagia}</b></li>
        <li><span>Agilidade inicial</span><b>${c.baseAgi}</b></li>
        <li><span>Defesa inicial</span><b>${c.baseDef}</b></li>
      </ul>
      <div class="class-skills-preview">Skills: ${skillNames}</div>
      <button class="pick-btn" onclick="chooseClass('${key}')">Escolher ${c.name}</button>
    </div>
  `;}).join('');
}

function chooseClass(key){
  newPlayer(key);
  document.getElementById('title-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  ui.tab = 'mapa';
  render();
}

function switchTab(tab){
  if(ui.lucasScene)return;
  if(hasPendingRomarDiscovery()) return;
  if(ui.romarResult || (ui.monster && ui.monster.romarChoice)) return;
  ui.tab = tab;
  if(tab==='inventario') player.newItemCount = 0;
  render();
}

function renderHUD(){
  document.getElementById('hud-level').textContent = player.level;
  document.getElementById('hud-classname').textContent = player.name;
  document.getElementById('hud-coins').textContent = player.coins;
  const hpPct = Math.max(0,(player.hp/player.hpMax)*100);
  document.getElementById('hud-hp-fill').style.width = hpPct+'%';
  document.getElementById('hud-hp-text').textContent = `${player.hp}/${player.hpMax}`;
  const mpPct = Math.max(0,(player.mp/player.mpMax)*100);
  document.getElementById('hud-mp-fill').style.width = mpPct+'%';
  document.getElementById('hud-mp-text').textContent = `${player.mp}/${player.mpMax}`;
  const need = xpToNext(player.level);
  const xpPct = Math.max(0,(player.xp/need)*100);
  document.getElementById('hud-xp-fill').style.width = xpPct+'%';
  document.getElementById('hud-xp-text').textContent = `${player.xp}/${need}`;

  const tonicChip = document.getElementById('event-tonic-chip');
  const tonicRemaining = player.xpBuffUntil - Date.now();
  if(tonicChip){
    if(tonicRemaining > 0){
      tonicChip.textContent = `📜 Tônico da Fúria ativo! +30% XP · acaba em ${msToClock(tonicRemaining)}`;
      tonicChip.classList.remove('hidden');
      tonicChip.classList.add('active');
    } else {
      tonicChip.classList.add('hidden');
      tonicChip.classList.remove('active');
    }
  }

  const mEvent = monsterEventTimeInfo();
  const mChip = document.getElementById('event-monster-chip');
  if(mChip){
    mChip.textContent = mEvent.active ? `🧟 Onda Sombria ativa! +30% de poder · acaba em ${msToClock(mEvent.remaining)}` : `🧟 Próxima Onda Sombria em ${msToClock(mEvent.remaining)}`;
    mChip.classList.toggle('active', mEvent.active);
  }
  const xEvent = xpEventTimeInfo();
  const xChip = document.getElementById('event-xp-chip');
  if(xChip){
    xChip.textContent = xEvent.active ? `🌕 Bênção da Lua Cheia ativa! 2x XP/drop · acaba em ${msToClock(xEvent.remaining)}` : `🌕 Próxima Bênção em ${msToClock(xEvent.remaining)}`;
    xChip.classList.toggle('active', xEvent.active);
  }

  document.querySelectorAll('.tab-btn').forEach(b=>{
    b.classList.toggle('active', b.dataset.tab===ui.tab);
  });

  const invBadge = document.getElementById('badge-inventario');
  if(invBadge){
    if(player.newItemCount>0){ invBadge.textContent = player.newItemCount; invBadge.classList.remove('hidden'); }
    else invBadge.classList.add('hidden');
  }
  const statusBadge = document.getElementById('badge-status');
  if(statusBadge){
    if(player.statPoints>0){ statusBadge.textContent = player.statPoints; statusBadge.classList.remove('hidden'); }
    else statusBadge.classList.add('hidden');
  }
}

function renderMapaTab(){
  if(ui.lucasScene)return renderLucasScene();
  if(hasPendingRomarDiscovery()) return renderRomarDiscovery();
  if(ui.mapIndex===null){
    return `
      <h2 style="margin-bottom:6px;">Território</h2>
      <p style="color:var(--bone-dim);margin:0 0 22px;">Escolha para onde levar sua lâmina esta noite.</p>
      <div class="map-grid">
        ${MAPS.map((m,i)=>{
          // VS 1.18 — territórios exigem nível mínimo + chefe anterior derrotado.
          const lacksLevel = player.level < m.unlockLevel;
          const lacksPrevBoss = i>0 && !player.defeatedBosses.includes(i-1);
          const locked = lacksLevel || lacksPrevBoss;
          let reqText = 'Desbloqueado';
          if(lacksLevel && lacksPrevBoss) reqText = `Requer nível ${m.unlockLevel} e derrotar ${MAPS[i-1].boss.name}`;
          else if(lacksLevel) reqText = `Requer nível ${m.unlockLevel}`;
          else if(lacksPrevBoss) reqText = `Requer derrotar ${MAPS[i-1].boss.name}`;
          return `
            <div class="map-card ${locked?'locked':''}">
              <div style="font-size:30px;margin-bottom:8px;">${m.theme}</div>
              <h3>${m.name}</h3>
              <div class="map-sub">${m.sub}</div>
              <div class="map-req">${reqText}</div>
              <button class="enter-map-btn" ${locked?'disabled':''} onclick="ui.mapIndex=${i};render()">${locked?'Bloqueado':'Entrar'}</button>
            </div>`;
        }).join('')}
      </div>
    `;
  }

  const m = MAPS[ui.mapIndex];
  const bossDefeated = player.defeatedBosses.includes(ui.mapIndex);

  const boss = m.boss;
  const bossRow = `
    <div class="monster-row boss">
      <div class="monster-portrait ${m.fam} fam-boss">${monsterAvatarHtml(boss,'avatar-img-circle')}</div>
      <div class="monster-info">
        <h4>${boss.name} <span class="boss-tag">${bossDefeated?'DERROTADO ✓':'CHEFE'}</span></h4>
        <div class="stats">HP ${boss.hp} · ATQ ${boss.atk} · DEF ${boss.def} · ${boss.xp} XP</div>
      </div>
      <button class="fight-btn" ${((ui.mapIndex===0 && !getForestProgress().miniBossDefeated)||(ui.mapIndex===1 && !getSwampProgress().miniBossDefeated)) && !bossDefeated?'disabled':''} onclick="desafiarBossTerritorio(${ui.mapIndex})">${bossDefeated?'Desafiar de novo':(((ui.mapIndex===0 && !getForestProgress().miniBossDefeated)||(ui.mapIndex===1 && !getSwampProgress().miniBossDefeated))?'Selado':'Desafiar')}</button>
    </div>
  `;

  const forestProgressBox = ui.mapIndex===0 ? (()=>{
    const fp = getForestProgress();
    const stage = forestStage();
    const stageNames = ['Borda da Floresta','Trilhas Profundas','Coração da Floresta'];
    const target = getForestMiniBossTarget();
    const firstHunt = (fp.miniBossKills||0)===0;
    const cycleStart = firstHunt ? 0 : target-7;
    const cycleNeed = firstHunt ? 14 : 7;
    const cycleKills = Math.max(0, Math.min(cycleNeed, fp.commonKills-cycleStart));
    const miniReady = fp.commonKills>=target;
    const status = miniReady ? 'LOCALIZADO' : (fp.miniBossDefeated ? 'RASTRO PERDIDO' : 'OCULTO');
    return `
      <div class="explore-box" style="margin-bottom:14px;">
        <div style="font-size:11px;letter-spacing:1.5px;color:var(--gold);margin-bottom:6px;">PROGRESSÃO DA REGIÃO</div>
        <div style="font-weight:700;margin-bottom:6px;">🌲 ${stageNames[stage]}</div>
        <div style="color:var(--bone-dim);font-size:13px;line-height:1.5;">${firstHunt?`Caçada: <b>${cycleKills}/14</b> criaturas`:`Novo rastro: <b>${cycleKills}/7</b> criaturas`} · Uivante das Sombras: <b>${status}</b></div>
        <div style="height:7px;background:rgba(255,255,255,.08);border-radius:8px;overflow:hidden;margin:10px 0 12px;"><div style="height:100%;width:${(cycleKills/cycleNeed)*100}%;background:var(--gold);"></div></div>
        <button class="fight-btn" style="width:100%;" ${miniReady?'':'disabled'} onclick="desafiarMiniBossFloresta()">${miniReady?'⚠️ Caçar Uivante das Sombras':(firstHunt?`🔒 Rastrear Uivante (${cycleKills}/14)`:`🔒 Novo rastro (${cycleKills}/7)`)}</button>
        ${fp.miniBossDefeated?`<div style="color:var(--green);font-size:12.5px;line-height:1.45;margin-top:10px;">✓ Alfa da Matilha desbloqueado · Uivante abatido ${fp.miniBossKills} vez(es). Continue a caçada para farmar equipamentos antes do confronto.</div>`:''}
      </div>`;
  })() : '';

  const swampProgressBox = ui.mapIndex===1 ? (()=>{
    const sp = getSwampProgress();
    const target = getSwampMiniBossTarget();
    const firstHunt = (sp.miniBossKills||0)===0;
    const cycleStart = firstHunt ? 0 : target-7;
    const cycleNeed = firstHunt ? 14 : 7;
    const cycleKills = Math.max(0, Math.min(cycleNeed, sp.commonKills-cycleStart));
    const miniReady = sp.commonKills>=target;
    const status = miniReady ? 'LOCALIZADO' : (sp.miniBossDefeated ? 'RASTRO PERDIDO' : 'OCULTO');
    return `
      <div class="explore-box" style="margin-bottom:14px;">
        <div style="font-size:11px;letter-spacing:1.5px;color:var(--gold);margin-bottom:6px;">PROGRESSÃO DA REGIÃO</div>
        <div style="font-weight:700;margin-bottom:6px;">🧌 Caçada no Pântano Podre</div>
        <div style="color:var(--bone-dim);font-size:13px;line-height:1.5;">${firstHunt?`Caçada: <b>${cycleKills}/14</b> criaturas`:`Novo rastro: <b>${cycleKills}/7</b> criaturas`} · Devorador do Charco: <b>${status}</b></div>
        <div style="height:7px;background:rgba(255,255,255,.08);border-radius:8px;overflow:hidden;margin:10px 0 12px;"><div style="height:100%;width:${(cycleKills/cycleNeed)*100}%;background:var(--gold);"></div></div>
        <button class="fight-btn" style="width:100%;" ${miniReady?'':'disabled'} onclick="desafiarMiniBossPantano()">${miniReady?'⚠️ Caçar Devorador do Charco':(firstHunt?`🔒 Rastrear Devorador (${cycleKills}/14)`:`🔒 Novo rastro (${cycleKills}/7)`)}</button>
        ${sp.miniBossDefeated?`<div style="color:var(--green);font-size:12.5px;line-height:1.45;margin-top:10px;">✓ Senhor do Pântano desbloqueado · Devorador abatido ${sp.miniBossKills} vez(es). Continue a caçada para farmar equipamentos antes do confronto final.</div>`:''}
      </div>`;
  })() : '';

  const ownedFieldPotions = [
    ['hp','🧪 Menor +50',"usarConsumivelFora('hp')"],
    ['hp_medium','🧪 Rubra +120',"usarConsumivelFora('hp_medium')"],
    ['hp_major','🧪 Ancestral +250',"usarConsumivelFora('hp_major')"],
    ['mp','💧 Mana P +30',"usarConsumivelFora('mp')"],
    ['mp_medium','💧 Mana M +70',"usarConsumivelFora('mp_medium')"],
    ['mp_major','💧 Mana G +150',"usarConsumivelFora('mp_major')"]
  ].filter(([key]) => (player.consumables[key]||0) > 0);
  const potionRow = ownedFieldPotions.length ? `
    <div class="consumable-row" style="margin-bottom:14px;">
      ${ownedFieldPotions.map(([key,label,action])=>`<button class="consumable-btn" onclick="${action}">${label} (${player.consumables[key]||0})</button>`).join('')}
    </div>
  ` : '';

  return `
    <button class="back-link" onclick="ui.mapIndex=null;render()">&larr; voltar ao território</button>
    <h2 style="margin-bottom:2px;">${m.name}</h2>
    <p style="color:var(--bone-dim);margin:0 0 14px;">${m.sub}</p>
    ${potionRow}
    ${forestProgressBox}
    ${swampProgressBox}
    ${ui.mapIndex===1 && player.forgeProgress && player.forgeProgress.lucas && player.forgeProgress.lucas.forgeUnlocked ? '<div class="explore-box"><h3>FORJA</h3><p>Lucas, o Ferreiro Marcado</p><button class="enter-map-btn" onclick="visitForge()">VISITAR A OFICINA</button></div>' : ''}
    <div class="explore-box">
      <p style="color:var(--bone-dim);font-size:13.5px;margin:0 0 14px;">Os monstros da região aparecem aleatoriamente ao explorar — e nem tudo que se encontra na escuridão é uma criatura viva.</p>
      <button class="enter-map-btn" style="width:100%;" onclick="explorarMapa(${ui.mapIndex})">🌑 Explorar Território</button>
    </div>
    <div class="monster-list" style="margin-top:18px;">${bossRow}</div>
  `;
}

function renderBatalhaTab(){
  if(ui.romarResult) return `<div class="status-card">${ui.romarResult}</div><button class="action-btn" onclick="continueRomarResult()">CONTINUAR</button>`;
  if(ui.monster && ui.monster.romarChoice) return `<div class="status-card"><h3>CHEGA!</h3><p>“Enquanto ainda sou eu...”</p><p>“Vá.”</p></div><div class="battle-actions"><button class="action-btn" onclick="chooseRomarFirst('spared')">RECUAR</button><button class="action-btn secondary" onclick="chooseRomarFirst('attacked')">CONTINUAR LUTANDO</button></div>`;
  if(!ui.inBattle || !ui.monster){
    return `<div class="empty-battle">Nenhuma batalha em andamento.<br>Vá até o <b>Mapa</b> e escolha um inimigo para enfrentar.</div>`;
  }
  const m = ui.monster;
  const map = MAPS[ui.mapIndex];
  const pPct = Math.max(0,(player.hp/player.hpMax)*100);
  const mpPct = Math.max(0,(player.mp/player.mpMax)*100);
  const ePct = Math.max(0,(m.hp/m.hpMax)*100);

  const skills = (SKILLS[player.classKey]||[]).map(s=>{
    const locked = player.level < s.unlockLevel;
    const shownMpCost = getSkillMpCost(s);
    const canBloodCast = player.classKey==='mago' && hasMagMilestone(100) && getMagDomain()==='proibido' && player.hp > (shownMpCost-player.mp);
    const noMp = player.mp < shownMpCost && !canBloodCast;
    const cooldown = ui.skillCooldowns[s.id]||0;
    const onCooldown = cooldown > 0;
    const disabled = locked || noMp || onCooldown || ui.locked;
    let statusText = s.desc;
    if(locked) statusText = `Desbloqueia no nível ${s.unlockLevel}`;
    else if(onCooldown) statusText = `Recarregando · ${cooldown} turno${cooldown>1?'s':''}`;
    return `
      <button class="skill-btn" ${disabled?'disabled':''} onclick="usarSkill('${s.id}')">
        <span>${s.icon} ${s.name} <small>(${shownMpCost} MP)</small></span>
        <small>${statusText}</small>
      </button>`;
  }).join('');

  const buffChips = Object.entries(ui.buffs).map(([key,b])=>{
    if(!b || b.turnsLeft<=0) return '';
    if(key==='atkBoost') return `<span class="arena-buff-chip">💪 Força +${Math.round((b.mult-1)*100)}% · ${b.turnsLeft}t</span>`;
    if(key==='critBoost') return `<span class="arena-buff-chip">🎯 Crítico +${Math.round(b.bonus*100)}% · ${b.turnsLeft}t</span>`;
    if(key==='romarFracture') return `<span class="arena-buff-chip">💔 FRATURA · DEF −60% · 1 ação</span>`;
    if(key==='defBoost') return `<span class="arena-buff-chip">🛡️ Defesa +${Math.round((b.mult-1)*100)}% · ${b.turnsLeft}t</span>`;
    return '';
  }).join('');

  return `
    <div class="battle-arena">
      <div class="combatant">
        <div class="portrait-ring player" id="portrait-player">${classAvatarHtml(player.classKey,'avatar-img-circle')}</div>
        <h4>${player.name} (Nv.${player.level})</h4>
        <div class="mini-bar"><div class="mini-bar-fill player" id="arena-hp-player" style="width:${pPct}%"></div></div>
        <div class="hp-num" id="arena-hp-player-text">${player.hp}/${player.hpMax} HP</div>
        <div class="mini-bar" style="margin-top:5px;"><div class="mini-bar-fill mpbar" id="arena-mp-player" style="width:${mpPct}%"></div></div>
        <div class="hp-num" id="arena-mp-player-text">${player.mp}/${player.mpMax} MP</div>
        ${buffChips ? `<div class="arena-buffs">${buffChips}</div>` : ''}
      </div>
      <div class="vs-glyph">VS</div>
      <div class="combatant">
        <div class="portrait-ring ${map.fam} ${(m.isBoss||m.isMiniBoss)?'fam-boss':''}" id="portrait-enemy">${monsterAvatarHtml(m,'avatar-img-circle')}</div>
        <h4>${m.name}${m.isBoss?' 👑':m.isMiniBoss?' ⚠️':''}</h4>
        <div class="mini-bar"><div class="mini-bar-fill enemy" id="arena-hp-enemy" style="width:${ePct}%"></div></div>
        <div class="hp-num" id="arena-hp-enemy-text">${m.hp}/${m.hpMax} HP</div>
        ${enemyBehaviorChip(m) ? `<div class="arena-enemy-state">${enemyBehaviorChip(m)}</div>` : ''}
      </div>
    </div>
    <div class="battle-actions">
      <button class="action-btn" ${ui.locked?'disabled':''} onclick="playerAttack()">Atacar</button>
      <button class="action-btn secondary" ${ui.locked?'disabled':''} onclick="fleeBattle()">Fugir</button>
      ${ui.mapIndex===0 && m.id==='alfa_matilha' && m.bossPhase===0 && m.packWolfActive ? `<button class="action-btn secondary" ${ui.locked?'disabled':''} onclick="attackPackWolf()">🐺 Atacar Lobo da Matilha · ${m.packWolfHp}/${m.packWolfHpMax} HP</button>` : ''}
    </div>
    ${player.classKey==='mago' && hasMagMilestone(100) && getMagDomain()==='destruidor' ? `<button class="action-btn secondary" style="width:100%;margin:0 0 8px;" onclick="player.overchargeNext=!player.overchargeNext;render()">🔥 Sobrecarga: ${player.overchargeNext?'ATIVA':'DESATIVADA'}</button>` : ''}
    <div class="skills-row">${skills}</div>
    ${(()=>{
      const owned = [
        ['hp','🧪 Menor +50'],['hp_medium','🧪 Rubra +120'],['hp_major','🧪 Ancestral +250'],
        ['mp','💧 Mana P +30'],['mp_medium','💧 Mana M +70'],['mp_major','💧 Mana G +150']
      ].filter(([key]) => (player.consumables[key]||0) > 0);
      return owned.length ? `<div class="consumable-row">${owned.map(([key,label])=>`<button class="consumable-btn" onclick="usarConsumivelBatalha('${key}')">${label} (${player.consumables[key]||0})</button>`).join('')}</div>` : '';
    })()}
    <div class="battle-log" id="battle-log">${battleLog.slice().reverse().map(l=>`<p>${l}</p>`).join('')}</div>
  `;
}

function renderQuestItems(){
  const fragment=player.questItems && player.questItems.fragmento_ferro_runico;
  return `<section class="status-card"><h3>ITENS DE MISSÃO</h3>${fragment ? `<img src="assets/images/quest-items/fragmento_ferro_runico.jpg" class="equip-art-large" style="float:none;display:block;width:100%;max-width:280px;height:auto;box-sizing:border-box;margin:12px auto;" alt="Fragmento de placa de armadura negra com rebites e fissuras rúnicas vermelhas"><h4>Fragmento de Ferro Rúnico</h4><p>Categoria: Item de Missão</p><p>Um fragmento pesado de metal escurecido, arrancado da armadura de Romar.</p><p>Marcas avermelhadas percorrem sua superfície como veias sob o ferro. Mesmo separado da armadura, o metal permanece estranhamente morno.</p><p>Você não sabe quem poderia trabalhar algo assim.</p>` : '<p>Nenhum item de missão.</p>'}</section>`;
}
function renderInventarioTab(){
  const LEFT_COL = ['helmet','necklace','earring','armor','boots'];
  const RIGHT_COL = ['weapon','shield','gloves','accessory','legs'];

  const pdSlot = (slot) => {
    const item = player.equipment[slot];
    const meta = SLOT_META[slot];
    const selected = ui.selectedEquipSlot === slot;
    return `<div class="pd-slot ${item?`rb-${item.rarity}`:'empty'} ${selected?'selected':''}" onclick="selectEquipSlot('${slot}')" title="${item?item.name:meta.label}">${item && itemArtFor(item) ? artImg(itemArtFor(item),'slot-art',item.name) : meta.icon}</div>`;
  };

  const paperdoll = `
    <div class="paperdoll">
      <div class="paperdoll-col">${LEFT_COL.map(pdSlot).join('')}</div>
      <div class="paperdoll-center">
        <div class="character-portrait">${classAvatarHtml(player.classKey,'avatar-img-circle')}</div>
        <div class="character-name">${player.name}</div>
        <div class="character-level">Nível ${player.level}</div>
      </div>
      <div class="paperdoll-col">${RIGHT_COL.map(pdSlot).join('')}</div>
    </div>
  `;

  const selSlot = ui.selectedEquipSlot;
  let equipDetailHtml = `<span class="placeholder">Toque em um espaço de equipamento para ver detalhes.</span>`;
  if(selSlot){
    const item = player.equipment[selSlot];
    const meta = SLOT_META[selSlot];
    if(item){
      equipDetailHtml = `
        ${artImg(itemArtFor(item),'equip-art-large',item.name)}
        <div class="inv-item-main">
          <div class="name rarity-${item.rarity}">${item.name}${item.classReq?` <small style="color:var(--moon);">(${CLASS_LABEL[item.classReq]})</small>`:''} <small style="color:var(--bone-dim)">[${item.rarity}]</small></div>
          <div class="desc">${meta.label} · ${itemDesc(item)}</div>
        </div>
        <div class="inv-actions" style="margin-top:10px;">
          <button class="small-btn" onclick="unequipAndClose('${selSlot}')">Remover</button>
        </div>
      `;
    } else {
      equipDetailHtml = `<span class="placeholder">${meta.label}: vazio.</span>`;
    }
  }

  const invRows = player.inventory.length ? player.inventory.map(item=>{
    const meets = SLOT_ORDER.includes(item.slot) && itemMeetsRequirements(item);
    const reqLabel = itemRequirementLabel(item);
    return `
    <div class="inv-item-row" style="${meets?'':'opacity:.55;'}">
      ${itemArtFor(item) ? artImg(itemArtFor(item),'item-art-thumb',item.name) : `<div class="icon">${SLOT_META[item.slot].icon}</div>`}
      <div class="inv-item-main">
        <div class="name rarity-${item.rarity}">${item.name} <small style="color:var(--bone-dim)">[${item.rarity}]</small></div>
        <div class="desc">${SLOT_META[item.slot].label} · ${itemDesc(item)} · valor ${item.value} 🪙</div>
        ${reqLabel ? `<div class="desc" style="color:${meets?'var(--moon)':'var(--blood-bright)'};">Requer: ${reqLabel}</div>` : ''}
      </div>
      <div class="inv-actions">
        <button class="small-btn equip" ${meets?'':'disabled'} onclick="equipItem('${item.uid}')">Equipar</button>
        <button class="small-btn sell" onclick="sellItem('${item.uid}')">Vender</button>
      </div>
    </div>
  `;}).join('') : `<div class="empty-note">Seu inventário está vazio. Derrote monstros para conseguir itens.</div>`;

  return `
    <h2 style="margin-bottom:18px;">Equipamento &amp; Inventário</h2>
    ${paperdoll}
    <div class="equip-detail">${equipDetailHtml}</div>
    <div class="consumables-board" style="margin-bottom:18px;">
      <h4>CONSUMÍVEIS</h4>
      ${[
        ['hp','Poção de Cura Pequena','+50 HP','hp_small',"usarConsumivelFora('hp')"],
        ['hp_medium','Poção de Cura Média','+120 HP','hp_medium',"usarConsumivelFora('hp_medium')"],
        ['hp_major','Poção de Cura Grande','+250 HP','hp_large',"usarConsumivelFora('hp_major')"],
        ['mp','Poção de Mana Pequena','+30 MP','mp_small',"usarConsumivelFora('mp')"],
        ['mp_medium','Poção de Mana Média','+70 MP','mp_medium',"usarConsumivelFora('mp_medium')"],
        ['mp_major','Poção de Mana Grande','+150 MP','mp_large',"usarConsumivelFora('mp_major')"],
        ['xpbuff','Tônico da Fúria da Caçada','+30% XP · 5min','xp_tonic','usarTonicoFuria()']
      ].map(([key,name,effect,art,action])=>`<div class="consumable-card">${artImg(ITEM_ART[art],'consumable-art',name)}<div><div>${name}</div><div class="consumable-meta">${effect}</div></div><div><b>${player.consumables[key]||0}</b><br><button class="small-btn equip" ${(player.consumables[key]||0)<=0?'disabled':''} onclick="${action}">Usar</button></div></div>`).join('')}
    </div>
    <div class="inv-grid">${invRows}</div>
    ${renderQuestItems()}
    ${renderForgeMaterials()}
  `;
}

function selectEquipSlot(slot){
  ui.selectedEquipSlot = (ui.selectedEquipSlot === slot) ? null : slot;
  render();
}

function unequipAndClose(slot){
  unequipItem(slot);
  ui.selectedEquipSlot = null;
  render();
}

function renderLojaTab(){
  const cards = SHOP_ITEMS.map(p=>{
    let ownedLabel = '';
    if(p.type==='consumable_hp') ownedLabel = `Você tem: <b style="color:var(--bone);">${player.consumables.hp}</b>`;
    else if(p.type==='consumable_hp_medium') ownedLabel = `Você tem: <b style="color:var(--bone);">${player.consumables.hp_medium||0}</b>`;
    else if(p.type==='consumable_hp_major') ownedLabel = `Você tem: <b style="color:var(--bone);">${player.consumables.hp_major||0}</b>`;
    else if(p.type==='consumable_mp') ownedLabel = `Você tem: <b style="color:var(--bone);">${player.consumables.mp}</b>`;
    else if(p.type==='consumable_mp_medium') ownedLabel = `Você tem: <b style="color:var(--bone);">${player.consumables.mp_medium||0}</b>`;
    else if(p.type==='consumable_mp_major') ownedLabel = `Você tem: <b style="color:var(--bone);">${player.consumables.mp_major||0}</b>`;
    return `
    <div class="shop-card">
      ${ITEM_ART[{hp:'hp_small',hp_medium:'hp_medium',hp_major:'hp_large',mp:'mp_small',mp_medium:'mp_medium',mp_major:'mp_large'}[p.id]] ? artImg(ITEM_ART[{hp:'hp_small',hp_medium:'hp_medium',hp_major:'hp_large',mp:'mp_small',mp_medium:'mp_medium',mp_major:'mp_large'}[p.id]],'item-art-thumb',p.name) : `<span class="icon">${p.icon}</span>`}
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      ${ownedLabel ? `<p style="margin-top:-8px;font-size:11.5px;color:var(--moon);">${ownedLabel}</p>` : ''}
      <button class="buy-btn" ${player.coins<p.price?'disabled':''} onclick="buyShopItem('${p.id}')">Comprar · ${p.price} 🪙</button>
    </div>
  `;}).join('');

  const sellRows = player.inventory.length ? player.inventory.map(item=>`
    <div class="sell-row">
      <div class="icon" style="font-size:20px;width:26px;text-align:center;">${SLOT_META[item.slot].icon}</div>
      <div style="flex:1;">
        <span class="rarity-${item.rarity}">${item.name}</span>
        <div style="font-size:12px;color:var(--bone-dim);">${SLOT_META[item.slot].label} · ${itemDesc(item)}</div>
      </div>
      <button class="small-btn sell" onclick="sellItem('${item.uid}')">Vender por ${item.value} 🪙</button>
    </div>
  `).join('') : `<div class="empty-note">Nenhum item para vender no momento.</div>`;

  const gearUnlocked = player.level >= MAPS[FERREIRO_GEAR_UNLOCK_MAP].unlockLevel;
  const gearCards = FERREIRO_BASE_GEAR.map((g,i)=>`
    <div class="shop-card">
      ${g.artKey && ITEM_ART[g.artKey] ? artImg(ITEM_ART[g.artKey],'item-art-thumb',g.name) : `<span class="icon">${g.icon}</span>`}
      <h4>${g.name}</h4>
      <p>${SLOT_META[g.slot].label} · ${[g.atk?`+${g.atk} Força`:'',g.def?`+${g.def} Defesa`:'',g.magia?`+${g.magia} Magia`:'',g.agi?`+${g.agi} Agilidade`:'',g.hp?`+${g.hp} HP`:''].filter(Boolean).join(' · ')}</p>
      <button class="buy-btn" ${player.coins<g.price?'disabled':''} onclick="buyBaseGear(${i})">Comprar · ${g.price} 🪙</button>
    </div>
  `).join('');

  return `
    <h2 style="margin-bottom:4px;">MERCADOR</h2>
    <p style="color:var(--bone-dim);margin:0 0 20px;">"Aço forjado à luz da lua. Traga suas relíquias, saia mais forte."</p>
    <div class="section-title">POÇÕES E TÔNICOS</div>
    <div class="shop-grid">${cards}</div>
    ${gearUnlocked ? `
      <div class="section-title">RELICÁRIOS ANCESTRAIS · itens universais, sem restrição de classe</div>
      <div class="shop-grid">${gearCards}</div>
    ` : `
      <div class="section-title">RELICÁRIOS ANCESTRAIS</div>
      <p style="color:var(--bone-dim);font-size:13px;margin:0 0 24px;">🔒 O mercador só revela seus itens mais raros para quem já provou valor na Cripta Sangrenta (nível ${MAPS[FERREIRO_GEAR_UNLOCK_MAP].unlockLevel}+).</p>
    `}
    <div class="section-title">VENDER ITENS</div>
    ${sellRows}
  `;
}

function renderStatusTab(){
  const c = CLASSES[player.classKey];
  const need = xpToNext(player.level);
  const skillLines = (SKILLS[player.classKey]||[]).map(s=>{
    const locked = player.level < s.unlockLevel;
    const shownMpCost = getSkillMpCost(s);
    return `
      <div class="skill-line ${locked?'locked':''}">
        <div class="sicon">${s.icon}</div>
        <div style="flex:1;">
          <div class="sname">${s.name} <small style="color:var(--mana);">(${shownMpCost} MP)</small></div>
          <div class="sdesc">${locked ? `Desbloqueia no nível ${s.unlockLevel}` : s.desc}</div>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="status-card">
      <div class="status-top">
        <span class="status-emoji">${classAvatarHtml(player.classKey,'avatar-img-circle')}</span>
        <div>
          <div class="status-name">${player.name}</div>
          <div class="status-class">Nível ${player.level} · ${MAPS[Math.min(3,Math.floor((player.level-1)/4))].name}</div>
        </div>
      </div>
      <div class="stat-grid">
        <div class="stat-box"><div class="val">${player.hp}/${player.hpMax}</div><div class="lab">HP</div></div>
        <div class="stat-box"><div class="val">${player.mp}/${player.mpMax}</div><div class="lab">MP</div></div>
        <div class="stat-box"><div class="val">${player.atk}</div><div class="lab">FORÇA</div></div>
        <div class="stat-box"><div class="val">${player.magia}</div><div class="lab">MAGIA</div></div>
        <div class="stat-box"><div class="val">${player.def}</div><div class="lab">DEFESA</div></div>
        <div class="stat-box"><div class="val">${player.agilidade}</div><div class="lab">AGILIDADE</div></div>
        <div class="stat-box"><div class="val">${player.coins}</div><div class="lab">MOEDAS</div></div>
      </div>
      <p class="progress-note">${player.xp} / ${need} XP para o próximo nível · ${Math.round(getDodgeChance()*100)}% esquiva · ${Math.round(getExtraAttackChance()*100)}% ataque extra</p>
      ${player.hp < player.hpMax ? `
        <button class="action-btn secondary" style="width:100%;margin-top:14px;" ${ui.inBattle?'disabled':''} onclick="descansar()">
          🔥 Descansar à sombra — sacrifica ${Math.min(player.xp, Math.round(need*REST_XP_COST_PCT))} XP por +${Math.round(player.hpMax*REST_HEAL_PCT)} HP
        </button>
      ` : ''}
    </div>
    <div class="status-card">
      <h3 style="font-size:15px;color:var(--blood-bright);margin-bottom:12px;">STATUS ATIVOS</h3>
      ${(() => {
        const rows = [];
        const xpRemain = player.xpBuffUntil - Date.now();
        if(xpRemain>0) rows.push(`<div class="skill-line"><div class="sicon">📜</div><div style="flex:1;"><div class="sname">Fúria da Caçada</div><div class="sdesc">+30% XP por abate · acaba em ${msToClock(xpRemain)}</div></div></div>`);
        if(ui.inBattle){
          if(ui.buffs.atkBoost && ui.buffs.atkBoost.turnsLeft>0) rows.push(`<div class="skill-line"><div class="sicon">💪</div><div style="flex:1;"><div class="sname">Força de combate</div><div class="sdesc">+${Math.round((ui.buffs.atkBoost.mult-1)*100)}% · ${ui.buffs.atkBoost.turnsLeft} turno(s)</div></div></div>`);
          if(ui.buffs.critBoost && ui.buffs.critBoost.turnsLeft>0) rows.push(`<div class="skill-line"><div class="sicon">🎯</div><div style="flex:1;"><div class="sname">Foco crítico</div><div class="sdesc">+${Math.round(ui.buffs.critBoost.bonus*100)}% · ${ui.buffs.critBoost.turnsLeft} turno(s)</div></div></div>`);
          if(ui.buffs.defBoost && ui.buffs.defBoost.turnsLeft>0) rows.push(`<div class="skill-line"><div class="sicon">🛡️</div><div style="flex:1;"><div class="sname">Postura defensiva</div><div class="sdesc">+${Math.round((ui.buffs.defBoost.mult-1)*100)}% · ${ui.buffs.defBoost.turnsLeft} turno(s)</div></div></div>`);
        }
        return rows.length ? `<div class="skills-list">${rows.join('')}</div>` : `<p style="font-size:13px;color:var(--bone-dim);margin:0;">Nenhum bônus ativo no momento.</p>`;
      })()}
    </div>
    <div class="status-card">
      <h3 style="font-size:15px;color:var(--blood-bright);margin-bottom:10px;">MARCOS ATIVOS</h3>
      ${(() => {
        const rows=[];
        if(player.classKey==='mago'){
          const mag=getMagInvested();
          if(mag>=25) rows.push(`<div class="skill-line"><div class="sicon">✦</div><div style="flex:1;"><div class="sname">MAG 25 · Afinidade Arcana ✓</div><div class="sdesc">+5% de dano mágico adicional.</div></div></div>`);
          if(mag>=50) rows.push(`<div class="skill-line"><div class="sicon">↺</div><div style="flex:1;"><div class="sname">MAG 50 · Eco Arcano ✓</div><div class="sdesc">Críticos mágicos recuperam 25% do custo base da habilidade em MP.</div></div></div>`);
          if(mag>=75) rows.push(`<div class="skill-line"><div class="sicon">◈</div><div style="flex:1;"><div class="sname">MAG 75 · Poder Concentrado ✓</div><div class="sdesc">Magias com custo base de 14 MP ou mais ignoram 20% da DEF inimiga.</div></div></div>`);
          if(mag>=100){ const d=getMagDomain(); rows.push(`<div class="skill-line"><div class="sicon">☾</div><div style="flex:1;"><div class="sname">MAG 100 · Domínio da Magia ✓</div><div class="sdesc">${d==='destruidor'?'Arcano Destruidor: Sobrecarga disponível (+50% MP, +35% poder).':d==='proibido'?'Arcano Proibido: MP insuficiente pode ser completado com HP.':'Escolha um domínio abaixo para ativar o marco final.'}</div></div></div>`); }
        }
        return rows.length ? `<div class="skills-list">${rows.join('')}</div>` : `<p style="font-size:13px;color:var(--bone-dim);margin:0;">Nenhum marco mecânico ativo. O primeiro marco do Mago é desbloqueado em 25 MAG.</p>`;
      })()}
    </div>
    <div class="status-card">
      <h3 style="font-size:15px;color:var(--blood-bright);margin-bottom:4px;">ATRIBUTOS & BUILD</h3>
      ${(() => {
        const staged = Object.values(ui.pendingAlloc).reduce((a,b)=>a+b,0);
        const available = player.statPoints - staged;
        const defs = [
          ['forca','FOR · Força', player.allocated.forca, '+1% de dano físico a cada 2 pontos. Base para requisitos físicos.'],
          ['agilidade','AGI · Agilidade', player.allocated.agilidade, 'Aumenta mobilidade; influencia esquiva e ataques extras.'],
          ['magia','MAG · Magia', player.allocated.magia, '+1% de poder mágico a cada 2 pontos e desbloqueia Marcos Arcanos.'],
          ['espirito','ESP · Espírito', player.allocated.espirito, '+2 MP máximo por ponto. Base da sustentação mágica.'],
          ['vitalidade','VIT · Vitalidade', player.allocated.vitalidade, '+4 HP máximo por ponto. Base da sobrevivência e futura regeneração.'],
          ['defesa','DEF · Defesa', player.allocated.defesa, '+1 DEF por ponto; mitigação e requisitos de armaduras/escudos.'],
        ];
        return `<p style="font-size:12.5px;color:var(--bone-dim);margin:0 0 8px;">Você recebe <b style="color:var(--gold)">5 pontos por nível</b>. Disponíveis agora: <b style="color:${available>0?'var(--gold)':'var(--bone-dim)'}">${available}</b>.</p>
        <p style="font-size:11.5px;color:var(--bone-dim);margin:0 0 14px;">Use +/− para planejar. Nada é aplicado antes de <b style="color:var(--bone)">Confirmar distribuição</b>.</p>
        <div class="alloc-grid">
          ${defs.map(([key,label,val,desc])=>{
            const pend = ui.pendingAlloc[key]||0;
            return `
            <div class="alloc-row" style="align-items:center;">
              <span class="alloc-label" style="min-width:74px;">${label}<small style="display:block;font-size:9.5px;line-height:1.25;color:var(--bone-dim);font-weight:400;margin-top:2px;max-width:190px;">${desc}</small></span>
              <span class="alloc-val">+${val}${pend>0?` <span style="color:var(--gold)">(+${pend})</span>`:''}</span>
              <button class="small-btn" ${pend<=0?'disabled':''} onclick="stagePoint('${key}',-1)">−</button>
              <button class="small-btn equip" ${available<=0?'disabled':''} onclick="stagePoint('${key}',1)">+</button>
            </div>
          `;}).join('')}
        </div>
        <button class="action-btn" style="width:100%;margin-top:14px;" ${staged<=0?'disabled':''} onclick="confirmAlloc()">Confirmar distribuição${staged>0?` (${staged})`:''}</button>
        <button class="action-btn secondary" style="width:100%;margin-top:8px;" ${ui.inBattle || Object.values(player.allocated).reduce((a,b)=>a+b,0)<=0?'disabled':''} onclick="resetAllocatedStats()">↺ Redefinir atributos — TESTE</button>`;
      })()}
    </div>
    <div class="status-card">
      <h3 style="font-size:15px;color:var(--blood-bright);margin-bottom:8px;">GUIA DE BUILD${player.classKey==='mago'?' · MAGO':''}</h3>
      ${player.classKey==='mago' ? `
        <div class="skills-list">
          <div class="skill-line"><div class="sicon">✦</div><div style="flex:1;"><div class="sname">Poder Arcano</div><div class="sdesc"><b>Magia</b> como prioridade. Busca dano mágico e crítico. Muito poder, pouca margem para erro.</div></div></div>
          <div class="skill-line"><div class="sicon">☾</div><div style="flex:1;"><div class="sname">Conjurador Lunar</div><div class="sdesc"><b>MAG + ESP</b>. Poder mágico com reserva de MP para sustentar habilidades.</div></div></div>
          <div class="skill-line"><div class="sicon">⚔</div><div style="flex:1;"><div class="sname">Mago de Batalha</div><div class="sdesc"><b>MAG + DEF/VIT</b>. Troca parte do dano máximo por sobrevivência e consistência.</div></div></div>
        </div>` : `<p style="font-size:12.5px;color:var(--bone-dim);margin:0;">Nesta build de teste, os caminhos guiados estão sendo validados primeiro no Mago. As outras classes continuam com distribuição livre.</p>`}
      <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line-soft);">
        <div style="font-family:'Cinzel',serif;font-size:11px;color:var(--gold);letter-spacing:.08em;margin-bottom:6px;">MARCOS DE INVESTIMENTO</div>
        <p style="font-size:11.5px;color:var(--bone-dim);line-height:1.55;margin:0;"><b style="color:var(--bone)">25</b> · especialização &nbsp;•&nbsp; <b style="color:var(--bone)">50</b> · nova mecânica &nbsp;•&nbsp; <b style="color:var(--bone)">75</b> · efeito definidor &nbsp;•&nbsp; <b style="color:var(--bone)">100</b> · domínio extremo.</p>
        ${player.classKey==='mago' && getMagInvested()>=100 && !getMagDomain()?`<div class="event-choice-row" style="margin-top:12px;"><button class="event-choice-btn primary" onclick="chooseMagDomain('destruidor')">🔥 Arcano Destruidor</button><button class="event-choice-btn" onclick="chooseMagDomain('proibido')">🩸 Arcano Proibido</button></div>`:''}
        <p style="font-size:10.5px;color:var(--bone-dim);line-height:1.45;margin:8px 0 0;opacity:.8;">Nesta versão, os marcos mecânicos estão sendo validados primeiro em MAG.</p>
      </div>
    </div>
    <div class="status-card">
      <h3 style="font-size:15px;color:var(--blood-bright);margin-bottom:14px;">HABILIDADES</h3>
      <div class="skills-list">${skillLines}</div>
    </div>
  `;
}

function render(){
  renderHUD();
  const content = document.getElementById('content');
  if(ui.tab==='mapa') content.innerHTML = renderMapaTab();
  else if(ui.tab==='batalha') content.innerHTML = renderBatalhaTab();
  else if(ui.tab==='inventario') content.innerHTML = renderInventarioTab();
  else if(ui.tab==='loja') content.innerHTML = renderLojaTab();
  else if(ui.tab==='status') content.innerHTML = renderStatusTab();
  if(ui.inBattle && ui.locked) setActionsLocked(true);
}

document.querySelectorAll('.tab-btn').forEach(b=>{
  b.addEventListener('click', ()=>switchTab(b.dataset.tab));
});

setInterval(()=>{ if(player && ui.tab!=='batalha') renderHUD(); else if(player) renderHUD(); }, 1000);

renderClassSelect();
