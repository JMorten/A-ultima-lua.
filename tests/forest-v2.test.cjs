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

test('Lobisomens e Alfa continuam apontando para as artes originais', () => {
  assert.match(game, /id:'lobisomem_jovem'.*portrait:'assets\/images\/enemies\/forest\/lobisomem_jovem\.jpg'/);
  assert.match(game, /id:'lobisomem_feroz'.*portrait:'assets\/images\/enemies\/forest\/lobisomem_feroz\.jpg'/);
  assert.match(game, /boss:\{ id:'alfa_matilha'.*portrait:'assets\/images\/enemies\/forest\/alfa_matilha\.jpg'/);
});

test('atributos de combate do primeiro lobo permanecem inalterados', () => {
  assert.match(game, /id:'lobo_selvagem'.*hp:30, atk:6,\s+def:2, xp:12, coinMin:4,\s+coinMax:8,\s+tier:0/);
});
