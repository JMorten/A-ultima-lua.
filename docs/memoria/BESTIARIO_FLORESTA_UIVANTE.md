# Bestiário — Floresta Uivante

**Snapshot:** 2026-10-27 (Lobo da Matilha V2).
**Território:** `MAPS[0]` — “Floresta Uivante / Território dos lobos e lobisomens”.
**Natureza:** inventário documental. Não autoriza mudança de arte, mecânica, balanceamento ou progressão.
**Entidades:** 8 (quatro comuns, um mini-chefe, um chefe, um inimigo especial não letal e uma invocação).

Fontes: `src/game.js` (checkout `081fce4` para mecânica histórica; worktree `feature/floresta-uivante-v2-etapa1`, base `11bff6c`, para a integração V2), `src/persistence.js`, `styles/game.css`, `docs/memoria/MANIFESTO_ARTES.json` e as decisões citadas. Hashes foram recalculados em 2026-10-25; o Lobo da Matilha entrou em 2026-10-27.

## Como interpretar o estado de aprovação

| Estado | Significado |
|---|---|
| `aprovado` | Aprovação humana registrada em decisão com ID. |
| `preservar` | Arte atual deve permanecer; substituição exige nova decisão. |
| `em uso sem aprovação V2` | Arte legada ativa; nenhuma avaliação V2 registrada. |
| `sem decisão` | Nem preservação nem substituição foram decididas. |
| `sem arte` | Entidade não possui retrato próprio. |
| `proposto` | Registro aguardando aceite humano. |

## Resumo das oito entidades

| # | Nome canônico | Nome exibido na V2 | ID interno | Papel | Arte | Aprovação |
|---|---|---|---|---|---|---|
| 1 | Lobo Selvagem | Lobo Comum | `lobo_selvagem` | comum, tier 0 | JPEG legado + PNG V2 | **aprovado** (V2), commitado na branch feature |
| 2 | Lobo Cinzento | Lobo Cinzento | `lobo_cinzento` | comum, tier 1 | JPEG legado + PNG V2 | **aprovado** (V2), QA e Safari confirmados |
| 3 | Lobisomem Jovem | Lobisomem Jovem | `lobisomem_jovem` | comum, tier 2 | JPEG legado + PNG V2 | **aprovado** (V2), QA e Safari confirmados |
| 4 | Lobisomem Feroz | Lobisomem Feroz | `lobisomem_feroz` | comum, tier 3 | JPEG | **preservar** |
| 5 | Uivante das Sombras | Uivante das Sombras | `uivante_sombras` | mini-chefe | JPEG legado + PNG V2 | **aprovado** (V2), QA e Safari confirmados |
| 6 | Alfa da Matilha | Alfa da Matilha | `alfa_matilha` | chefe | JPEG | **preservar** |
| 7 | Romar | Romar | `romar` | especial não letal, 3 estágios | 3 JPEG legado + 3 PNG V2 | **aprovado** (V2), QA publicado |
| 8 | Lobo da Matilha | Lobo da Matilha | *sem ID próprio* | invocação do Alfa | PNG V2 | **aprovado** (V2), QA publicado |

## Modelo de encontro

1. O jogador aciona **Explorar**. A ordem é: armadilha (8%), evento da Floresta (14%, com espera de 2 explorações), descoberta narrativa (12%), tentativa de Romar e, por fim, combate.
2. Comuns usam um pool determinístico por estágio (`pickForestMonster`), não a tabela genérica `pickMonster`.

| Estágio | Abates comuns | Pool (índice) | Probabilidades |
|---|---|---|---|
| Borda da Floresta | 0–4 | `[0,0,0,1]` | 75% Lobo · 25% Lobo Cinzento |
| Trilhas Profundas | 5–9 | `[0,1,1,2]` | 25% Lobo · 50% Cinzento · 25% Jovem |
| Coração da Floresta | 10+ | `[1,2,2,3,3]` | 20% Cinzento · 40% Jovem · 40% Feroz |

Consequência: **o Lobo Comum não aparece após 10 abates comuns** e não retorna. O campo `tier` não pondera spawn; ele influencia a raridade do loot.

3. Multiplicadores de perigo aplicados no início da batalha: comuns ×1.12 HP/ATQ e ×1.05 DEF; mini-chefe ×1.18/×1.18/×1.08; chefe ×1.22/×1.20/×1.10.
4. **Onda Sombria** (0–3 min de cada ciclo de 30 min desde o carregamento) aplica +30% a HP/ATQ/DEF de qualquer encontro.
5. Mini-chefe e chefe **não** entram no sorteio de 6% na Floresta: o mini-chefe tem desafio direto e o chefe é liberado por progressão. O sorteio de 6% vale para Pântano e Cripta.

## 1. Lobo Selvagem / “Lobo Comum” — `lobo_selvagem`

- **Papel:** primeiro inimigo comum, `tier: 0`. XP 12; moedas 4–8.
- **Stats base:** 30 HP · 6 ATQ · 2 DEF. **Efetivos:** 34/7/2; com Onda Sombria 44/9/3.
- **Arte ativa no commit-base:** `assets/images/enemies/forest/lobo_selvagem.jpg` — 480×503, JPEG, SHA-256 `7A9E52279F3A5D8F7BCF707D67DDDF0B4B0B771567192CF191379D3F65822B65`.
- **Arte V2 (branch feature, commit `16f4c9c`):** `assets/images/enemies/forest/lobo_comum_combat_v2.png` — 1536×1024, PNG RGBA, SHA-256 `B39E5D1ABC1DFB9A1297F624B7697AC96D5662446950CF7375F709F5DED6090D`.
- **Encontro:** 75% no estágio 0; 25% no estágio 1; 0% no estágio 2. Também pode receber o buff da Onda Sombria.
- **Comportamento:** **Frenesi** uma única vez ao chegar a ≤35% HP — ATQ ×1.25 e DEF ×0.70, com chip “FRENESI”.
- **Estado:** aparência, recorte e combate **aprovados** (`FLO-009`, `FLO-010`). Integração commitada e publicada na branch `feature/floresta-uivante-v2-etapa1` (`4236b84` e `16f4c9c`). QA isolado autorizado (`QLT-011`); produção não autorizada.
- **Observações:** o nome exibido “Lobo Comum” existe na branch `feature`; o ID, os atributos e os multiplicadores permanecem iguais. O log de Frenesi passou a usar o nome dinâmico em `16f4c9c` (D5 resolvido).
- **Evidência:** `src/game.js:175` (base), `:25` (posicionamento V2), `:1900-1901`, `:1927-1932`; commits `4236b84` e `16f4c9c`; manifesto.

## 2. Lobo Cinzento — `lobo_cinzento`

- **Papel:** comum, `tier: 1`. XP 18; moedas 6–10.
- **Stats base:** 42 HP · 8 ATQ · 3 DEF. **Efetivos:** 47/9/3; com Onda Sombria 61/12/4.
- **Arte legada preservada:** `assets/images/enemies/forest/lobo_cinzento.jpg` — 480×503, JPEG, SHA-256 `B413EBE502BD6CA7A97E985357677A697FE13A1DACB447F62902BB066ED5D58B`.
- **Fonte aprovada:** `lobo-cinzento-v2-aprovado.png` — 1536×1024, PNG RGB, SHA-256 `292A1E045C437B4425BDCF46D8173AE4AB16746B61C6295338C32045A3A52FA4` (fundo quadriculado incorporado, removido no recorte).
- **Arte V2 (branch feature, commit `83eb677`):** `assets/images/enemies/forest/lobo_cinzento_combat_v2.png` — 1536×1024, PNG RGBA, SHA-256 `5174F63C343350C87E493A79E853A3297E92F63D0EAE05A17681FCBC982A4D86`.
- **Encontro:** 25% no estágio 0; 50% no estágio 1; 20% no estágio 2.
- **Transparência real:** o asset V2 é RGBA; os quatro cantos têm alpha 0 e 3,81% dos pixels são borda suave. O xadrez não está incrustado no asset final.
- **Comportamento:** a cada 3ª ação de IA prepara **Bote** (×1.55). O golpe pode ser interrompido por um impacto ≥ max(8, 12% do HP máximo), consumindo a preparação também em esquiva.
- **Estado:** arte legada preservada; nova arte e recorte **aprovados** (`DEC-2026-10-25-FLO-014`). Integração commitada e publicada na branch `feature/...` em `83eb677`. QA isolado `45362c1d-ca92-4c0b-b6d4-6b51c258fc9d` publicado e funcionamento confirmado no Safari/iPhone (`DEC-2026-10-25-QLT-015`). Produção pendente. Atributos, Bote, recompensas e progressão inalterados.
- **Pendência:** o escopo do Cinzento em `FLO-013` foi resolvido por `FLO-014`; o último item restante daquele registro, o Lobo da Matilha, foi resolvido por `FLO-019` em 2026-10-27. Falta apenas promoção à produção, não autorizada.
- **Evidência:** `src/game.js:176`, `:2000-2004`, `:2045`, `:1687-1693`; commits `83eb677`; QA `45362c1d`; 189/189 Node e 68/68 Chromium; `evidencias/lobo-cinzento-v2/`; manifesto.

## 3. Lobisomem Jovem — `lobisomem_jovem`

- **Papel:** comum, `tier: 2`. XP 26; moedas 8–14.
- **Stats base:** 58 HP · 11 ATQ · 4 DEF. **Efetivos:** 65/12/4; com Onda Sombria 85/16/5.
- **Arte legada preservada:** `assets/images/enemies/forest/lobisomem_jovem.jpg` — 480×576, JPEG, SHA-256 `3D6C792EEF5C7F1C20D7267A1C0405A9D0FC34B2F5F244668D1F34B8072E18DD`.
- **Fonte aprovada:** `lobisomem-jovem-v2-aprovado.png` — 1536×1024, PNG RGBA, SHA-256 `59F9F30840F7AD224281633EE613E5D1BF7C87B4023036E1606740BCD8753276` (transparência real; cantos alpha 0).
- **Arte V2 (branch feature, commit `25ae3fb`):** `assets/images/enemies/forest/lobisomem_jovem_combat_v2.png` — 1536×1024, PNG RGBA, SHA-256 `E26AC2C0C4FE2B15F289C180FAE4BDB28406064174CAF3CF43488D0700D1D6A3`.
- **Encontro:** 25% no estágio 1; 40% no estágio 2.
- **Comportamento:** quando o jogador usa uma ação não ofensiva (cura, poção, suporte), ganha **Instinto de Caça** (×1.40) na ação seguinte.
- **Estado:** arte e recorte **aprovados** (`DEC-2026-10-26-FLO-016`); integração commitada e publicada na branch feature (`25ae3fb`), QA isolado `860aa1d1` e Safari/iPhone confirmados. Atributos, Instinto de Caça, recompensas e progressão inalterados. Produção pendente.
- **Preservação:** `FLO-016` substitui `FLO-007` **somente** para o Lobisomem Jovem; Lobisomem Feroz e Alfa permanecem preservados.
- **Evidência:** `src/game.js:178`, `:2312-2315`, `:2047`, `:1956`; commit `25ae3fb`; deployment `860aa1d1`; 190/190 Node e 71/71 Chromium; `evidencias/lobisomem-jovem-v2/`; manifesto.

## 4. Lobisomem Feroz — `lobisomem_feroz`

- **Papel:** comum, `tier: 3`. XP 35; moedas 10–18.
- **Stats base:** 75 HP · 14 ATQ · 6 DEF. **Efetivos:** 84/16/6; com Onda Sombria 109/21/8.
- **Arte:** `assets/images/enemies/forest/lobisomem_feroz.jpg` — 480×720, JPEG, SHA-256 `93A8434B780608B5CB2EF7AB4D86E14832A1D57EB5CF9FF0EC519C42AAF5CB3E`.
- **Encontro:** 40% no estágio 2; ausente nos estágios 0 e 1.
- **Comportamento:** a cada 3º ataque efetivo, **Mordida Profunda** (×1.35), com chip que alterna “à espreita / se aproxima / próximo ataque”.
- **Estado:** **preservar** (`DEC-ND-FLO-007`). Sem V2.
- **Evidência:** `src/game.js:177`, `:1982-1986`, `:1906-1907`; manifesto.

## 5. Uivante das Sombras — `uivante_sombras`

- **Papel:** mini-chefe do território. `tier` ausente; XP 85; moedas 20–30. Drop com chance de 75% e raridade mínima rara.
- **Stats base:** 190 HP · 25 ATQ · 12 DEF. **Efetivos:** 224/30/13; com Onda Sombria 291/39/17.
- **Arte legada preservada:** `assets/images/enemies/forest/uivante_sombras.jpg` — 480×503, JPEG, SHA-256 `9C070D13DF1CA9E209A057A9F199429BB535C8A596DF8D7624E94978DE9BB9D3`.
- **Fonte aprovada:** `uivante-sombras-v2-aprovado.png` — 1536×1024, PNG RGBA, SHA-256 `1A2BF63B4DB5ED9E78826BE44C7D4635981982A6BC54731CCF04AD9CACAFEDB4` (transparência real; cantos alpha 0).
- **Arte V2 (branch feature, commit `bb7197a`):** `assets/images/enemies/forest/uivante_sombras_combat_v2.png` — 1536×1024, PNG RGBA, SHA-256 `E17533A137F583B4BB6BC8A79931D09500EFFBC370791AE1EA1DA85C7FBD2BDF`; 2.027.865 bytes. Somente o canal alfa foi normalizado (0 e 255 estáveis); nenhum redesenho.
- **Encontro:** **somente desafio direto** na tela do território. Primeiro rastro exige **14 abates comuns**; após cada vitória, mais **7**. Não aparece no pool comum nem no sorteio de 6%. A interface mostra “OCULTO / LOCALIZADO / RASTRO PERDIDO”.
- **Comportamento:** **Presságio Sombrio** prepara **Golpe Brutal** (×1.75), anunciado e interrompível; a primeira preparação ocorre em turno aleatório 2–4 e o intervalo seguinte é 2–4 turnos +1. Abaixo de 40% HP recebe **Fúria Desesperada** (ATQ ×1.20, uma vez).
- **Apresentação V2:** `portraitLayout:'natural'`, entrada própria em `COMBAT_PRESENTATION` (`x:0.70`, `w:0.58`, `h:0.95`) e seletor CSS `[data-actor="uivante_sombras"]`. A caixa é maior que a dos lobos comuns e preserva a hierarquia de mini-chefe em todas as larguras, com a cauda de fumaça dentro do palco. Em 375/390 px a fumaça do ombro passa na frente da capa do Mago (sobreposição de silhueta ≤ 4% da largura do palco); em 320 px não há contato.
- **Estado:** arte, recorte e integração **aprovados** (`DEC-2026-10-26-FLO-017`); escala final aprovada pelo responsável em 2026-10-26; commits `bb7197a` e `385bdf5` publicados na branch feature; QA isolado `f6b00e93-2405-4cd7-b617-c1efcf5723ca` publicado, conferido por SHA-256 e **validado no Safari/iPhone** (`DEC-2026-10-26-QLT-018`). Atributos, Presságio Sombrio, Golpe Brutal, Fúria Desesperada, drops e progressão inalterados. Produção pendente.
- **Preservação:** a arte JPEG antiga permanece no repositório e no commit-base. Não há perfil de reação para o Uivante.
- **Evidência:** `src/game.js:28`, `:184`, `:812-814`, `:851-857`, `:1399`, `:1962-1964`, `:2008-2012`, `:2043`, `:2154-2156`; commits `bb7197a` e `385bdf5`; deployments `7e466fdf` e `f6b00e93`; 191/191 Node e 74/74 Chromium; `evidencias/uivante-sombras-v2/`; manifesto.

## 6. Alfa da Matilha — `alfa_matilha`

- **Papel:** chefe do território. XP 130; moedas 40–60. Vitória registra `defeatedBosses[0]` e desbloqueia o Pântano (nível 5). Drop garantido de item pela regra de chefe, com raridade mínima épica.
- **Stats base:** 300 HP · 30 ATQ · 14 DEF. **Efetivos:** 366/36/15; com Onda Sombria 476/47/20.
- **Arte:** `assets/images/enemies/forest/alfa_matilha.jpg` — 480×719, JPEG, SHA-256 `787FFCC285777A98A97EF93E948D502FAC8B101736B6B19E5F8D30DA1AAA7794`.
- **Encontro:** botão **Desafiar** liberado após a **primeira vitória sobre o Uivante das Sombras**. Antes disso, o domínio permanece selado na interface e na função de desafio.
- **Comportamento em três fases:**
  - **Fase 0 — Comandante (100–60%):** convoca o **Lobo da Matilha** na primeira ação e a cada 4 ações enquanto o lobo estiver ativo; o lobo causa **Caçada Coordenada**. Desde a V2 o lobo aparece como ator próprio, com nome e barra acima da arte.
  - **Fase 1 — Fúria da Matilha (≤60%):** prepara **Investida** (×1.65) a cada 3 ações.
  - **Fase 2 — Instinto do Alfa (≤30%):** DEF cai para 82%; ganha **postura de observação** que retalia um ataque precipitado, e uma única **Lua da Caçada** (×2.0).
- **Estado:** **preservar** (`DEC-ND-FLO-007`). Sem V2 e sem reações de impacto.
- **Observação de recompensa:** `generateBossUnique()` existe no código, mas não é chamada em nenhum fluxo de vitória; o drop do Alfa usa a tabela normal de chefe. Item único de chefe **não integrado**.
- **Evidência:** `src/game.js:179`, `:855-868`, `:1606-1631`, `:1960-1977`, `:2077-2083`, `:2451-2466`, `:595`; manifesto.

## 7. Romar — `romar`

- **Papel:** inimigo especial **não letal**, fora de `MAPS[].monsters` e de `defeatedBosses`. Não conta para a caçada da Floresta.
- **Stats:** base 300 HP · 24 ATQ · 12 DEF, com faixa por nível: até 5 → 300/24/12; níveis 6–7 → 324/25/13; nível 8+ → 345/26/13. Não recebe os multiplicadores de perigo nem o buff da Onda Sombria.
- **Artes legadas preservadas:** `romar_15.jpg` (1024×1536, SHA-256 `3A90FFD9…83244`), `romar_30.jpg` (1254×1254, SHA-256 `721CC6F9…C23E2`) e `romar_45.jpg` (1254×1254, SHA-256 `AD2AB773…A110`). Os hashes completos estão no manifesto.
- **Artes V2 (branch feature, commit `cbc50b6`):** `romar_v2_estagio1.png`, `romar_v2_estagio2.png` e `romar_v2_estagio3.png` — 1024×1536, PNG RGBA, transparência real (cantos alpha 0); SHA-256 `7382D566…8FEE`, `B9CC5745…34E7` e `B3626F3C…C506A7`. Somente o canal alfa foi normalizado; nenhum redesenho.
- **Progressão visual:** estágio 1 conserva o rosto e marca apenas os braços manuseados na runa; estágio 2 mostra a corrupção avançando em veios e rachaduras; estágio 3 mantém Romar humano, com olhos vermelhos e postura agressiva.
- **Apresentação V2:** `portraitLayout:'natural'`, entrada própria em `COMBAT_PRESENTATION` (`x:0.70`, `w:0.46`, `h:0.78`), `contain` ancorado na base e fallback em emoji apenas quando a imagem falha. Romar fica mais alto que o Mago, com folga no topo do palco e sem sobrepor a silhueta dele.
- **Encontro:** exige Alfa derrotado (`defeatedBosses` contém 0), escolha final ainda não feita, nenhuma cena pendente e **três descobertas vistas incluindo `runa`**. A chance cresce por tentativa (6% → 100%). Na base `11bff6c`, a primeira pista (`massacre`) é entregue após o primeiro combate comum posterior ao Alfa, com a batalha adiada até **CONTINUAR**; no checkout `081fce4`, as pistas vêm apenas da exploração.
- **Comportamento:** três estágios por HP (65% e 35%); HP travado em 20% no golpe final; escolha **poupar** ou **atacar**. Atacar rende o **Fragmento de Ferro Rúnico**; poupar não rende item. Em ambos os casos, Romar permanece vivo.
- **Estado:** artes, recorte e integração **aprovados** (`DEC-2026-10-26-FLO-018`); commit `cbc50b6` publicado na branch feature; escala final `h:0.78` no commit `7a23369`; QA isolado `49331648`, com transições reais por ataque verificadas em 320/375/390. Mecânica, escolha final e recompensa inalteradas. Safari/iPhone e produção pendentes.
- **Evidência:** `src/game.js:533`, `:1433-1435`, `:1506-1515`, `:26`; `styles/game.css:655-659`; commit `cbc50b6`; deployment `c5618de6`; 192/192 Node e 77/77 Chromium; `evidencias/romar-v2/`; `tests/romar-*.test.cjs`, `tests/forest-v2.test.cjs`, `tests/browser/forest-v2.spec.cjs`; manifesto.

## 8. Lobo da Matilha — ator próprio como invocação

- **Papel:** invocação do Alfa na fase 0. Continua **sem ID de inimigo** e **sem entrada em `MAPS`**: o estado vive em `packWolfActive`, `packWolfHp` e `packWolfHpMax` no Alfa. Desde a V2 ele tem **ator próprio no palco**, com nome e barra flutuantes, renderizados por `renderPackWolfActor()` a partir desses campos.
- **Stats derivados:** HP máximo = máximo entre 8 e 12% do HP efetivo do Alfa (44 sem Onda Sombria; 57 com Onda Sombria). Ataque = 35% do ATQ-base do Alfa (12,6 antes da defesa do jogador). Pode ser esquivado.
- **Encontro:** apenas enquanto o Alfa está na fase 0 e o lobo está ativo; o botão “Atacar Lobo da Matilha” aparece nessa condição. Abatê-lo quebra a Caçada Coordenada e adia a próxima invocação.
- **Arte:** `assets/images/enemies/forest/lobo_matilha_combat_v2.png` — 1000×758, PNG RGBA com transparência real, SHA-256 `A767B072A0ABC72BF3068F693EFDBF59F74B3A9A85C628C21E73A3C956502F8B`. Lobo magro, marrom-acinzentado, olhos âmbar, cicatrizes, contraluz azul; sem magia, coroa ou aura. O recorte original trazia franja magenta, removida por despill antes da entrega.
- **Apresentação:** caixa `w:0.31` com `aspect-ratio:1000/758` (a altura vem da largura), `x:0.56`, `contain` ancorado na base, `z-index:4` (à frente do Alfa). A placa acima da arte mostra **apenas barra e HP**, sem nome sobreposto; `LOBO DA MATILHA` permanece no rótulo acessível do ator e no botão de ataque. Entrada animada uma vez por invocação; `prefers-reduced-motion` remove a animação.
- **Estado:** **aprovado (V2)**, QA publicado em 320/375/390 com invocação real; Safari/iPhone e produção pendentes. Atributos, dano, esquiva e adiamento da invocação **não mudaram**.
- **Evidência:** `src/game.js` (`COMBAT_PRESENTATION.summons`, `renderPackWolfActor`, `combatEffectId('packWolf')`); `styles/game.css` (`.actor-pack-wolf`, `.pack-wolf-tag`); commits `a841181` (ator e placa) e `49f8ed2` (placa sem nome); deployment `26daa4cd`; 194/194 Node e 80/80 Chromium; `evidencias/matilha-v2/`; manifesto.

## Não são entidades do bestiário

- **Eventos da Floresta:** Baú Abandonado, Aventureiro Caído, Santuário Lunar (`src/game.js:1187-1197`).
- **Armadilhas:** Armadilha de Urso (20), Estacas Ocultas (11), Runa Amaldiçoada (6) (`src/game.js:696-700`).
- **Cenas de Romar:** `massacre`, `marcas`, `runa`, `acampamento` — narrativa, não combate.
- **Lucas:** pertence ao Pântano.

## Aprovações e pendências

| Entidade | Aprovação | Decisão | Próximo passo |
|---|---|---|---|
| Lobo Comum | aprovado (visual e Safari) | `FLO-009`, `FLO-010` | commitado e publicado; QA isolado autorizado; produção pendente |
| Lobo Cinzento | aprovado (V2), QA e Safari | `FLO-014`, `QLT-015` | commit e QA publicados; produção pendente |
| Lobisomem Jovem | aprovado (V2), QA e Safari | `FLO-016` | commit e QA publicados; produção pendente |
| Lobisomem Feroz | preservar | `FLO-007` | nenhum |
| Uivante das Sombras | aprovado (V2), QA e Safari | `FLO-017`, `QLT-018` | commit e QA publicados; Safari confirmado; produção pendente |
| Alfa da Matilha | preservar | `FLO-007` | nenhum |
| Romar | aprovado (V2), QA publicado | `FLO-018` | commit e QA publicados; Safari e produção pendentes |
| Lobo da Matilha | aprovado (V2), QA publicado | `FLO-019` | commit e QA publicados; Safari e produção pendentes |

## NÃO VERIFICADO

- Execução nesta missão: **192 Node e 77 Chromium** (Chromium 151 do Playwright 1.62.1). Safari/iPhone de Lobo Comum, Lobo Cinzento, Lobisomem Jovem e Uivante das Sombras confirmados por declaração humana; sem captura ou log dos dispositivos. O Romar V2 **não** foi testado em Safari/iPhone.
- Validação Safari/iPhone: declaração humana (`FLO-010`, `QLT-018`), sem captura ou log do dispositivo no repositório. `FLO-018` não inclui esse nível de evidência.
- Julgamento artístico das artes legadas: não há registro de avaliação; as V2 aprovadas cobrem Lobo Comum, Lobo Cinzento, Lobisomem Jovem, Uivante das Sombras e Romar.
- Paridade SHA-256 entre o deployment público e `_qa-dist`: conferida binariamente para o Uivante V2 (`7e466fdf` e `f6b00e93`) e para o Romar V2 (`c5618de6`); nos deployments anteriores o conteúdo público foi conferido por leitura.
- Comportamento em WebKit: não executado.

## Evidências consultadas

`src/game.js` (linhas citadas), `src/persistence.js`, `styles/game.css`, `docs/memoria/MANIFESTO_ARTES.json`, `docs/memoria/DECISOES_APROVADAS.md`, commits `4236b84`, `16f4c9c`, `83eb677`, `25ae3fb`, `bb7197a`, `385bdf5` e `cbc50b6`, deployments `45362c1d-ca92-4c0b-b6d4-6b51c258fc9d`, `860aa1d1-a3cf-4715-a89e-2a07d7e0126b`, `7e466fdf-248b-4dd2-b8e7-0230ea425e06` e `c5618de6-77a3-42d0-9227-af87129c3eb1`, `tests/miniboss-progression.test.cjs`, `tests/romar-combat.test.cjs`, `tests/romar-discoveries.test.cjs`, `tests/romar-playtest-quest.test.cjs`, `tests/forest-v2.test.cjs`, `tests/browser/forest-v2.spec.cjs`; hashes e dimensões recalculados em 2026-10-25/26.
