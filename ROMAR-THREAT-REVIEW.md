# Romar — ameaça contra DEF (nível 7)

Base analisada antes da implementação: de991756c4f2c6589deb279d07ec1279ddf664e1.
Não há save do segundo playtest disponível nesta tarefa; os cenários abaixo são reconstruções plausíveis, não atributos observados daquele jogador.

## Fórmula e cenários

Romar: HP 324, ATQ 25,2, DEF 12,6 (inalterados).
Cavaleiro 7: HP 195 e DEF round(12 + 2,8 × 6) = 29 antes de pontos/equipamento.
Postura: DEF efetiva = round(DEF × 1,25).
Dano por acerto = max(1, round(max(1, round(max(1, ATQ − DEFef × (1 − penetração) / 2) × variância)) × multiplicador × (1 − redução))).
Variância: [0,85; 1,15). Esquiva continua anulando o golpe; redução de dano de afixos continua limitada a 35%.

Equipamento comum da floresta com roll 1,2: armadura, escudo, elmo, botas, acessório e colar somam 17 DEF e 27 HP pelas fórmulas existentes. Isso produz 222 HP sem pontos em vitalidade.
- Base: 29 DEF, 195 HP.
- Intermediário: 29 + 17 equipamentos + 4 pontos = 50 DEF, 222 HP (demais pontos não contados).
- Defensivo: 29 + 17 equipamentos + 30 pontos = 76 DEF, 222 HP. Os seis níveis concedem 30 pontos.

## Antes: dano central (variância 1, sem esquiva/afixos)

| DEF | Postura | DEF efetiva | Normal | Quebra | Surto | Ruptura |
|---:|:---:|---:|---:|---:|---:|---:|
|29|não|29|11|17|21|22|
|29|sim|36|7|14|18|14|
|50|não|50|1|10|9|2|
|50|sim|63|1|6|3|2|
|76|não|76|1|2|2|2|
|76|sim|95|1|1|2|2|

Multiplicadores antigos: normal/Quebra 1; Surto 1,5; agressivo 1,75; Ruptura 2. Penetração antiga: Quebra 40%, Surtos 25%, Ruptura 0%. Multiplicar depois da mitigação mantém Ruptura no piso de dano contra a build defensiva.

## Critérios e valores

A calibração usa mitigação residual, não uma meta fixa de HP perdido. Referência conservadora: 95 DEF efetiva.
- Quebra: deixar a defesa absorver no máximo 40% do ATQ exige p >= 1 − (2 × 0,40 × 25,2 / 95) = 78,78%. Adotado 80%, multiplicador 1 inalterado.
- Energia rúnica: absorção de no máximo 30% exige p >= 84,08%. Adotado 85% para ambos os Surtos e Ruptura. Surtos mantêm multiplicadores 1,5 e 1,75.
- Ruptura: mesma mitigação rúnica, mas pico acima do dobro do Surto agressivo. O menor multiplicador inteiro acima de 2 × 1,75 é 4. Isso diferencia o erro de não interromper sem aumentar o ATQ global.
- Fratura: para a resposta normal sair do piso mesmo contra 95 DEF, preservando ao menos 20% do ATQ antes da variância, eficiência residual deve ser <= 2 × 0,80 × 25,2 / 95 = 42,44%. Adotado 40% de eficiência (redução temporária de 60%). Não altera o atributo permanente nem remove Postura.

## Depois: dano central

| DEF efetiva | Normal | Quebra | Surto | Agressivo | Ruptura |
|---:|---:|---:|---:|---:|---:|
|29|11|22|35|40|92|
|36|7|22|35|40|92|
|50|1|20|32|37|84|
|63|1|19|30|35|80|
|76|1|18|30|35|80|
|95|1|16|27|32|72|

Com Postura e 50 DEF, faixas: normal 1; Quebra 16–22; Surto 26–36; agressivo 30–42; Ruptura 68–96 (31–43% dos 222 HP). Com 76 DEF e Postura, Ruptura 60–84. Um Cavaleiro saudável sobrevive inclusive sem equipamento (Ruptura máxima 104 versus 195 HP), antes de afixos ou esquiva.
Fratura: 63 → 25,2 DEF efetiva, resposta normal central 13; 95 → 38, resposta normal 6. Postura continua multiplicando DEF e volta à eficiência integral se ainda durar após Fratura.

## Duração e resposta

Quebra aplica Fratura somente após acertar Postura ativa; o próprio golpe não aproveita a Fratura recém-aplicada. O contador interno começa em 2 porque o tick da resposta de aplicação acontece imediatamente; ao devolver o controle ao jogador resta 1. A próxima ação válida e sua resposta usam o efeito, que expira ao final. Reaplicar não acumula redução. Renderizações e ações rejeitadas não o consomem. Transições, preparação ou interrupção também consomem essa ação, mesmo sem dano. Fuga, escolha final e derrota limpam o efeito.

Telegraphs, ação de resposta, esquiva, vulnerabilidade e interrupção permanecem. O limiar da Ruptura é 12% de 324 = 38,88, portanto 39 de dano inteiro. Interromper mantém o Surto agressivo na resposta seguinte. Ataques normais, Pressão ofensiva e Golpe Pesado não recebem penetração nova.

## Validação

`node --test tests/*.test.cjs`: 39 testes aprovados, incluindo 216 combinações de dano (DEF, Postura, variância, afixos e seis ações), duração de Fratura por ataque/skill/poção, reaplicação, esquiva, limpeza, limiar 38/39, consequências e regressões de IA, scaling, descobertas e pity.
`node --check src/game.js` e `git diff --check`: aprovados.
A validação automatizada não substitui um novo playtest humano para avaliar a dificuldade percebida.
