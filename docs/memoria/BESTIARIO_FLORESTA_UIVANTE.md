# Bestiário — Floresta Uivante

**Snapshot:** 2026-10-25 (reconciliação documental).
**Território:** `MAPS[0]` — “Floresta Uivante / Território dos lobos e lobisomens”.
**Natureza:** inventário documental. Não autoriza mudança de arte, mecânica, balanceamento ou progressão.
**Entidades:** 8 (quatro comuns, um mini-chefe, um chefe, um inimigo especial não letal e uma invocação).

Fontes: `src/game.js` (checkout `081fce4` para mecânica histórica; worktree `feature/floresta-uivante-v2-etapa1`, base `11bff6c`, para a integração V2), `src/persistence.js`, `styles/game.css`, `docs/memoria/MANIFESTO_ARTES.json` e as decisões citadas. Hashes foram recalculados em 2026-10-25.

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
| 1 | Lobo Selvagem | Lobo Comum | `lobo_selvagem` | comum, tier 0 | JPEG legado + PNG V2 | **aprovado** (V2), integração local não commitada |
| 2 | Lobo Cinzento | Lobo Cinzento | `lobo_cinzento` | comum, tier 1 | JPEG | em uso sem aprovação V2; sem decisão |
| 3 | Lobisomem Jovem | Lobisomem Jovem | `lobisomem_jovem` | comum, tier 2 | JPEG | **preservar** |
| 4 | Lobisomem Feroz | Lobisomem Feroz | `lobisomem_feroz` | comum, tier 3 | JPEG | **preservar** |
| 5 | Uivante das Sombras | Uivante das Sombras | `uivante_sombras` | mini-chefe | JPEG | em uso, não reavaliado; sem decisão |
| 6 | Alfa da Matilha | Alfa da Matilha | `alfa_matilha` | chefe | JPEG | **preservar** |
| 7 | Romar | Romar | `romar` | especial não letal, 3 estágios | 3 JPEG | em uso sem avaliação documentada |
| 8 | Lobo da Matilha | Lobo da Matilha | *sem ID próprio* | invocação do Alfa | **sem arte** | não se aplica; sem arte |

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
- **Arte V2 (worktree, não commitada):** `assets/images/enemies/forest/lobo_comum_combat_v2.png` — 1536×1024, PNG RGBA, SHA-256 `B39E5D1ABC1DFB9A1297F624B7697AC96D5662446950CF7375F709F5DED6090D`.
- **Encontro:** 75% no estágio 0; 25% no estágio 1; 0% no estágio 2. Também pode receber o buff da Onda Sombria.
- **Comportamento:** **Frenesi** uma única vez ao chegar a ≤35% HP — ATQ ×1.25 e DEF ×0.70, com chip “FRENESI”.
- **Estado:** aparência, recorte e combate **aprovados** (`FLO-009`, `FLO-010`). Integração local (arena, `COMBAT_PRESENTATION`, CSS, testes) não commitada. QA isolado autorizado (`QLT-011`); produção não autorizada.
- **Observações:** o nome exibido “Lobo Comum” existe apenas na branch `feature`; o ID, os atributos e os multiplicadores permanecem iguais. O log de Frenesi ainda usa o texto fixo “Lobo Selvagem” — inconsistência textual pendente (D5).
- **Evidência:** `src/game.js:174` (base), `:25` (posicionamento V2), `:1900-1901`, `:1927-1932`; `git diff` da branch feature; manifesto.

## 2. Lobo Cinzento — `lobo_cinzento`

- **Papel:** comum, `tier: 1`. XP 18; moedas 6–10.
- **Stats base:** 42 HP · 8 ATQ · 3 DEF. **Efetivos:** 47/9/3; com Onda Sombria 61/12/4.
- **Arte:** `assets/images/enemies/forest/lobo_cinzento.jpg` — 480×503, JPEG, SHA-256 `B413EBE502BD6CA7A97E985357677A697FE13A1DACB447F62902BB066ED5D58B`.
- **Encontro:** 25% no estágio 0; 50% no estágio 1; 20% no estágio 2.
- **Comportamento:** a cada 3ª ação de IA prepara **Bote** (×1.55). O golpe pode ser interrompido por um impacto ≥ max(8, 12% do HP máximo), consumindo a preparação também em esquiva.
- **Estado:** arte legada em uso; **sem aprovação V2 e sem decisão** de preservação ou substituição. Classificação no manifesto: `em_uso_sem_aprovacao_v2_documentada`.
- **Pendência:** entra em `FLO-013` (proposto). Não reutilizar o asset do Lobo Comum sem decisão.
- **Evidência:** `src/game.js:175`, `:1949-1953`, `:1634-1647`; manifesto.

## 3. Lobisomem Jovem — `lobisomem_jovem`

- **Papel:** comum, `tier: 2`. XP 26; moedas 8–14.
- **Stats base:** 58 HP · 11 ATQ · 4 DEF. **Efetivos:** 65/12/4; com Onda Sombria 85/16/5.
- **Arte:** `assets/images/enemies/forest/lobisomem_jovem.jpg` — 480×576, JPEG, SHA-256 `3D6C792EEF5C7F1C20D7267A1C0405A9D0FC34B2F5F244668D1F34B8072E18DD`.
- **Encontro:** 25% no estágio 1; 40% no estágio 2.
- **Comportamento:** quando o jogador usa uma ação não ofensiva (cura, poção, suporte), ganha **Instinto de Caça** (×1.40) na ação seguinte.
- **Estado:** **preservar** (`DEC-ND-FLO-007`). Sem V2.
- **Evidência:** `src/game.js:176`, `:2259-2264`, `:1995`; manifesto.

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
- **Arte:** `assets/images/enemies/forest/uivante_sombras.jpg` — 480×503, JPEG, SHA-256 `9C070D13DF1CA9E209A057A9F199429BB535C8A596DF8D7624E94978DE9BB9D3`.
- **Encontro:** **somente desafio direto** na tela do território. Primeiro rastro exige **14 abates comuns**; após cada vitória, mais **7**. Não aparece no pool comum nem no sorteio de 6%. A interface mostra “OCULTO / LOCALIZADO / RASTRO PERDIDO”.
- **Comportamento:** **Presságio Sombrio** prepara **Golpe Brutal** (×1.75), anunciado e interrompível; a primeira preparação ocorre em turno aleatório 2–4 e o intervalo seguinte é 2–4 turnos +1. Abaixo de 40% HP recebe **Fúria Desesperada** (ATQ ×1.20, uma vez).
- **Estado:** arte legada em uso, **não reavaliada**; sem decisão de preservação ou substituição. É o inimigo da Floresta com menor cobertura documental.
- **Pendência:** `FLO-013` (proposto). Não há arte V2 nem perfil de reação.
- **Evidência:** `src/game.js:180`, `:761-764`, `:800-809`, `:1345`, `:1954-1958`, `:2098-2103`, `:2778-2797`; `tests/miniboss-progression.test.cjs`; manifesto.

## 6. Alfa da Matilha — `alfa_matilha`

- **Papel:** chefe do território. XP 130; moedas 40–60. Vitória registra `defeatedBosses[0]` e desbloqueia o Pântano (nível 5). Drop garantido de item pela regra de chefe, com raridade mínima épica.
- **Stats base:** 300 HP · 30 ATQ · 14 DEF. **Efetivos:** 366/36/15; com Onda Sombria 476/47/20.
- **Arte:** `assets/images/enemies/forest/alfa_matilha.jpg` — 480×719, JPEG, SHA-256 `787FFCC285777A98A97EF93E948D502FAC8B101736B6B19E5F8D30DA1AAA7794`.
- **Encontro:** botão **Desafiar** liberado após a **primeira vitória sobre o Uivante das Sombras**. Antes disso, o domínio permanece selado na interface e na função de desafio.
- **Comportamento em três fases:**
  - **Fase 0 — Comandante (100–60%):** convoca o **Lobo da Matilha** na primeira ação e a cada 4 ações enquanto o lobo estiver ativo; o lobo causa **Caçada Coordenada**.
  - **Fase 1 — Fúria da Matilha (≤60%):** prepara **Investida** (×1.65) a cada 3 ações.
  - **Fase 2 — Instinto do Alfa (≤30%):** DEF cai para 82%; ganha **postura de observação** que retalia um ataque precipitado, e uma única **Lua da Caçada** (×2.0).
- **Estado:** **preservar** (`DEC-ND-FLO-007`). Sem V2 e sem reações de impacto.
- **Observação de recompensa:** `generateBossUnique()` existe no código, mas não é chamada em nenhum fluxo de vitória; o drop do Alfa usa a tabela normal de chefe. Item único de chefe **não integrado**.
- **Evidência:** `src/game.js:179`, `:855-868`, `:1606-1631`, `:1960-1977`, `:2077-2083`, `:2451-2466`, `:595`; manifesto.

## 7. Romar — `romar`

- **Papel:** inimigo especial **não letal**, fora de `MAPS[].monsters` e de `defeatedBosses`. Não conta para a caçada da Floresta.
- **Stats:** base 300 HP · 24 ATQ · 12 DEF, com faixa por nível: até 5 → 300/24/12; níveis 6–7 → 324/25/13; nível 8+ → 345/26/13. Não recebe os multiplicadores de perigo nem o buff da Onda Sombria.
- **Artes:** `romar_15.jpg` (1024×1536, SHA-256 `3A90FFD9…83244`), `romar_30.jpg` (1254×1254, SHA-256 `721CC6F9…C23E2`) e `romar_45.jpg` (1254×1254, SHA-256 `AD2AB773…A110`). Os hashes completos estão no manifesto.
- **Encontro:** exige Alfa derrotado (`defeatedBosses` contém 0), escolha final ainda não feita, nenhuma cena pendente e **três descobertas vistas incluindo `runa`**. A chance cresce por tentativa (6% → 100%). Na base `11bff6c`, a primeira pista (`massacre`) é entregue após o primeiro combate comum posterior ao Alfa, com a batalha adiada até **CONTINUAR**; no checkout `081fce4`, as pistas vêm apenas da exploração.
- **Comportamento:** três estágios por HP (65% e 35%); HP travado em 20% no golpe final; escolha **poupar** ou **atacar**. Atacar rende o **Fragmento de Ferro Rúnico**; poupar não rende item. Em ambos os casos, Romar permanece vivo.
- **Estado:** artes em uso **sem avaliação documentada**; agora listadas no manifesto, mas sem decisão de aprovação V2. `FLO-013` cobre a decisão de escopo.
- **Evidência:** `src/game.js:1372-1384`, `:1412-1431`, `:1452-1459`, `:952-996`; `src/persistence.js:233-257`; `tests/romar-*.test.cjs`.

## 8. Lobo da Matilha — sem ID próprio

- **Papel:** invocação do Alfa na fase 0. Não tem retrato, barra própria na arena, entrada em `MAPS` ou ID de inimigo; o estado vive em campos `packWolfActive`, `packWolfHp`, `packWolfHpMax` do Alfa.
- **Stats derivados:** HP máximo = máximo entre 8 e 12% do HP efetivo do Alfa (44 sem Onda Sombria; 57 com Onda Sombria). Ataque = 35% do ATQ-base do Alfa (12,6 antes da defesa do jogador). Pode ser esquivado.
- **Encontro:** apenas enquanto o Alfa está na fase 0 e o lobo está ativo; o botão “Atacar Lobo da Matilha” aparece nessa condição. Abatê-lo quebra a Caçada Coordenada e adia a próxima invocação.
- **Estado:** **sem arte**. Aprovação não se aplica. Se ganhar identidade visual, exige decisão própria (`FLO-013`).
- **Evidência:** `src/game.js:1346`, `:1960-1966`, `:2029-2053`, `:2957`; manifesto (`entidades_sem_arte`).

## Não são entidades do bestiário

- **Eventos da Floresta:** Baú Abandonado, Aventureiro Caído, Santuário Lunar (`src/game.js:1187-1197`).
- **Armadilhas:** Armadilha de Urso (20), Estacas Ocultas (11), Runa Amaldiçoada (6) (`src/game.js:696-700`).
- **Cenas de Romar:** `massacre`, `marcas`, `runa`, `acampamento` — narrativa, não combate.
- **Lucas:** pertence ao Pântano.

## Aprovações e pendências

| Entidade | Aprovação | Decisão | Próximo passo |
|---|---|---|---|
| Lobo Comum | aprovado (visual e Safari) | `FLO-009`, `FLO-010` | autorização para versionar a integração |
| Lobo Cinzento | sem V2, sem decisão | `FLO-013` (proposto) | decidir preservar ou substituir |
| Lobisomem Jovem | preservar | `FLO-007` | nenhum |
| Lobisomem Feroz | preservar | `FLO-007` | nenhum |
| Uivante das Sombras | não reavaliado | `FLO-013` (proposto) | decidir arte V2 |
| Alfa da Matilha | preservar | `FLO-007` | nenhum |
| Romar | sem avaliação documentada | `FLO-013` (proposto) | decidir escopo e avaliar artes |
| Lobo da Matilha | sem arte | `FLO-013` (proposto) | decidir se terá arte própria |

## NÃO VERIFICADO

- Execução atual das suítes (188 Node / 65 Chromium): números de relatório, não medidos nesta reconciliação.
- Validação Safari/iPhone: declaração humana (`FLO-010`), sem captura ou log do dispositivo no repositório.
- Julgamento artístico de Romar e das artes legadas: não há registro de avaliação.
- Paridade SHA-256 entre o deployment público e `_qa-dist`: o conteúdo público foi conferido por leitura, não por hash de download binário.
- Comportamento em WebKit: não executado.

## Evidências consultadas

`src/game.js` (linhas citadas), `src/persistence.js`, `styles/game.css`, `docs/memoria/MANIFESTO_ARTES.json`, `docs/memoria/DECISOES_APROVADAS.md`, `tests/miniboss-progression.test.cjs`, `tests/romar-combat.test.cjs`, `tests/romar-discoveries.test.cjs`, `tests/romar-playtest-quest.test.cjs`; hashes e dimensões recalculados em 2026-10-25.
