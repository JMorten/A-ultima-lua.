const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const game = fs.readFileSync(path.join(root, 'src', 'game.js'), 'utf8');

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex').toUpperCase();
}

test('Floresta V2 usa somente os novos assets visuais aprovados', () => {
  assert.match(game, /arenaBackground:'assets\/images\/backgrounds\/floresta_uivante_arena_v2\.jpeg'/);
  assert.match(game, /id:'lobo_selvagem', name:'Lobo Comum'.*portrait:'assets\/images\/enemies\/forest\/lobo_comum_combat_v2\.png'.*portraitLayout:'natural'/);
  assert.equal(sha256('assets/images/backgrounds/floresta_uivante_arena_v2.jpeg'), '6A5407DEE4B227A6832CA996E923508357903F732560ED9E090BC7CE472C5B77');
  assert.equal(sha256('assets/images/enemies/forest/lobo_comum_combat_v2.png'), 'B39E5D1ABC1DFB9A1297F624B7697AC96D5662446950CF7375F709F5DED6090D');
});

test('Lobisomem Feroz e Alfa continuam apontando para as artes originais', () => {
  assert.match(game, /id:'lobisomem_feroz'.*portrait:'assets\/images\/enemies\/forest\/lobisomem_feroz\.jpg'/);
  assert.match(game, /boss:\{ id:'alfa_matilha'.*portrait:'assets\/images\/enemies\/forest\/alfa_matilha\.jpg'/);
});

test('atributos de combate do primeiro lobo permanecem inalterados', () => {
  assert.match(game, /id:'lobo_selvagem'.*hp:30, atk:6,\s+def:2, xp:12, coinMin:4,\s+coinMax:8,\s+tier:0/);
});

test('Lobo Cinzento V2 usa arte recortada e preserva atributos e Bote', () => {
  assert.match(game, /id:'lobo_cinzento',\s+name:'Lobo Cinzento'.*portrait:'assets\/images\/enemies\/forest\/lobo_cinzento_combat_v2\.png'.*portraitLayout:'natural'/);
  assert.match(game, /id:'lobo_cinzento'.*hp:42, atk:8,\s+def:3, xp:18, coinMin:6,\s+coinMax:10,\s+tier:1/);
  assert.match(game, /m\.id==='lobo_cinzento' && !m\.grayPouncePrepared/);
  assert.match(game, /grayPouncePrepared\)\{ mult=1\.55/);

  const asset = 'assets/images/enemies/forest/lobo_cinzento_combat_v2.png';
  assert.equal(sha256(asset), '5174F63C343350C87E493A79E853A3297E92F63D0EAE05A17681FCBC982A4D86');
  const png = fs.readFileSync(path.join(root, asset));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 1536);
  assert.equal(png.readUInt32BE(20), 1024);
  assert.equal(png[25], 6); // RGBA
});

test('Lobisomem Jovem V2 usa arte recortada e preserva atributos e Instinto de Caça', () => {
  assert.match(game, /id:'lobisomem_jovem',\s*name:'Lobisomem Jovem'.*portrait:'assets\/images\/enemies\/forest\/lobisomem_jovem_combat_v2\.png'.*portraitLayout:'natural'/);
  assert.match(game, /id:'lobisomem_jovem'.*hp:58, atk:11, def:4, xp:26, coinMin:8,\s+coinMax:14,\s+tier:2/);
  assert.match(game, /m\.id==='lobisomem_jovem'/);
  assert.match(game, /m\.youngHuntPrepared=true/);
  assert.match(game, /youngHuntPrepared\)\{ mult=1\.40/);

  const asset = 'assets/images/enemies/forest/lobisomem_jovem_combat_v2.png';
  assert.equal(sha256(asset), 'E26AC2C0C4FE2B15F289C180FAE4BDB28406064174CAF3CF43488D0700D1D6A3');
  const png = fs.readFileSync(path.join(root, asset));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 1536);
  assert.equal(png.readUInt32BE(20), 1024);
  assert.equal(png[25], 6); // RGBA
});

test('Uivante das Sombras V2 usa arte recortada e preserva atributos e Golpe Brutal', () => {
  assert.match(game, /miniBoss:\{\s*id:'uivante_sombras'.*portrait:'assets\/images\/enemies\/forest\/uivante_sombras_combat_v2\.png'.*portraitLayout:'natural'/);
  assert.match(game, /miniBoss:\{\s*id:'uivante_sombras'.*hp:190, atk:25, def:12, xp:85, coinMin:20, coinMax:30/);
  assert.match(game, /m\.id==='uivante_sombras' && !m\.heavyPrepared/);
  assert.match(game, /m\.id==='uivante_sombras' && m\.heavyPrepared/);
  assert.match(game, /m\.atk = Math\.round\(m\.atk \* 1\.20\)/);

  const asset = 'assets/images/enemies/forest/uivante_sombras_combat_v2.png';
  assert.equal(sha256(asset), 'E17533A137F583B4BB6BC8A79931D09500EFFBC370791AE1EA1DA85C7FBD2BDF');
  const png = fs.readFileSync(path.join(root, asset));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 1536);
  assert.equal(png.readUInt32BE(20), 1024);
  assert.equal(png[25], 6); // RGBA
});

test('Romar V2 usa três artes recortadas e preserva estágios e escolha final', () => {
  assert.match(game, /portrait:'assets\/images\/enemies\/forest\/romar_v2_estagio1\.png',portraitLayout:'natural'/);
  assert.match(game, /m\.romarStage=2; m\.portrait='assets\/images\/enemies\/forest\/romar_v2_estagio2\.png'/);
  assert.match(game, /m\.romarStage=3; m\.portrait='assets\/images\/enemies\/forest\/romar_v2_estagio3\.png'/);
  assert.match(game, /romar:\{ x:0\.70, ground:0, w:0\.46, h:0\.78, ax:-0\.5, ay:0 \}/);
  // Mecânica preservada: faixas dos estágios e escolha final.
  assert.match(game, /m\.hp<=m\.hpMax\*0\.65/);
  assert.match(game, /m\.hp<=m\.hpMax\*0\.35/);
  assert.match(game, /function romarFinalChoice\(m\)/);
  assert.match(game, /m\.hp=Math\.max\(m\.hpMax\*0\.20,m\.hp\)/);

  const assets = {
    1: '7382D5666C3186CA4849CB9F4E686C0ED628090B516F30627C48AC3B5B178FEE',
    2: 'B9CC5745B42F6BDA46152EAE777C1D21238305F02539150CCA9DD92FB2AA34E7',
    3: 'B3626F3C324967218D2197381431CECF7259886763F0DDB13B681B2521C506A7',
  };
  for (const [stage, hash] of Object.entries(assets)) {
    const asset = `assets/images/enemies/forest/romar_v2_estagio${stage}.png`;
    assert.equal(sha256(asset), hash, `hash do estágio ${stage}`);
    const png = fs.readFileSync(path.join(root, asset));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16), 1024);
    assert.equal(png.readUInt32BE(20), 1536);
    assert.equal(png[25], 6); // RGBA
  }
});

test('Lobo da Matilha ganha ator próprio na arena sem mudar a mecânica do Alfa', () => {
  const asset = 'assets/images/enemies/forest/lobo_matilha_combat_v2.png';
  assert.equal(sha256(asset), 'A767B072A0ABC72BF3068F693EFDBF59F74B3A9A85C628C21E73A3C956502F8B');
  const png = fs.readFileSync(path.join(root, asset));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 1000);
  assert.equal(png.readUInt32BE(20), 758);
  assert.equal(png[25], 6); // RGBA
  // A arte vive na apresentação: não cria criatura, território nem encontro.
  assert.ok(!/id:'lobo_matilha'/.test(game));
  assert.match(game, /summons:\{\s*packWolf:\{ x:0\.56, ground:0, w:0\.31, h:0\.44, ax:-0\.5, ay:0 \},?\s*\}/);
  assert.match(game, /function renderPackWolfActor\(m\)/);
  assert.match(game, /id="effects-pack-wolf"/);
  // Mecânica do Alfa permanece: invocação, dano e adiamento da próxima invocação.
  assert.match(game, /packWolfHpMax:Math\.max\(8,Math\.round\(hp\*0\.12\)\)/);
  assert.match(game, /Math\.round\(m\.battleBaseAtk\*0\.35\)/);
  assert.match(game, /m\.alphaNextActionTurn=m\.aiTurns\+4/);
  assert.match(game, /m\.alphaNextActionTurn=Math\.max\(m\.alphaNextActionTurn,m\.aiTurns\+3\)/);
});

test('ator do Lobo da Matilha aparece só na fase 0 e mostra nome e barra', () => {
  const el = {style:{},dataset:{},classList:{add(){},remove(){}},addEventListener(){},appendChild(){},remove(){}};
  const c = require('node:vm').createContext({
    console, Date, Math:Object.create(Math), setTimeout(){}, clearTimeout(){}, setInterval(){}, clearInterval(){},
    document:{getElementById:()=>el,querySelectorAll:()=>[],createElement:()=>({...el})}
  });
  require('node:vm').runInContext(game, c);
  const run = s => require('node:vm').runInContext(s, c);
  run('newPlayer("guerreiro");ui.inBattle=true;ui.mapIndex=0;');

  const hidden = run('renderPackWolfActor(null)');
  assert.equal(hidden, '');

  const active = run(`(() => {
    const monster={id:'alfa_matilha',bossPhase:0,packWolfActive:true,packWolfHp:30,packWolfHpMax:60};
    ui.monster=monster;
    return renderPackWolfActor(monster);
  })()`);
  assert.match(active, /LOBO DA MATILHA/);
  assert.match(active, /30\/60 HP/);
  assert.match(active, /width:50\.0%/);
  assert.match(active, /lobo_matilha_combat_v2\.png/);
  assert.match(active, /aria-label="Lobo da Matilha, 30 de 60 pontos de vida"/);

  const laterPhase = run(`(() => {
    const monster={id:'alfa_matilha',bossPhase:1,packWolfActive:true,packWolfHp:30,packWolfHpMax:60};
    ui.monster=monster;
    return renderPackWolfActor(monster);
  })()`);
  assert.equal(laterPhase, '');
});

