# Decisões e estados

Registros desta V1 usam datas somente quando confirmadas por commit ou relatório. `Não determinada` significa que a evidência disponível não permite fixar a data da decisão humana.

Um commit ou teste comprova implementação e comportamento, mas não comprova sozinho aprovação artística ou de game design. Quando a aprovação veio do responsável durante uma missão, a fonte é indicada como `instrução do responsável`; os commits e relatórios associados servem como evidência técnica complementar.

## DEC-2026-10-05-T3-001 — Progressão determinística das Trincheiras

- **Área:** Cartografia / Arsenal
- **Estado:** aprovado
- **Descrição:** sete vitórias comuns liberam o desafio direto ao Orc Xamã; derrotar o Xamã libera Gorthak; novas sequências de sete vitórias permitem novo desafio.
- **Justificativa:** tornar o progresso verificável e remover o Xamã do sorteio aleatório comum.
- **Evidência:** instrução do responsável preservada em `laboratorios/release-trincheiras-rc1/RELATORIO_RELEASE_CANDIDATE_TRINCHEIRAS.md` (decisões aprovadas de sete vitórias e desafio direto); commit `7c8784a`; testes de persistência e navegador.
- **Arquivos conhecidos:** `src/game.js`, `src/persistence.js`, testes relacionados.
- **Relação:** depende do ritual do Xamã e antecede a apresentação visual V2.

## DEC-2026-10-05-T3-002 — Ritual do Orc Xamã

- **Área:** Arsenal
- **Estado:** aprovado
- **Descrição:** Xamã começa inalvejável; Totem de Sangue causa retaliação ao dano efetivo no Totem da Essência; Totem da Essência armazena energia ao atacar o Totem de Sangue; o Xamã desperta após destruir ambos.
- **Justificativa:** encontro em fases, com persistência idempotente.
- **Evidência:** comportamento mantido no release candidate aprovado das Trincheiras; commits `cf966c1`, `3e1b884`, `84bad86`; checkpoint e testes QA V2.
- **Arquivos conhecidos:** `src/game.js`, `src/persistence.js`, assets dos Totens e Xamã.
- **Relação:** requisito para a progressão T3 e apresentação do Xamã V2.

## DEC-2026-10-03-T3-003 — Gorthak em três fases

- **Área:** Arsenal
- **Estado:** aprovado
- **Descrição:** fases Comandante, Fúria de Guerra e Último Avanço, com regras documentadas de ataques e fuga.
- **Justificativa:** boss final das Trincheiras com comportamento próprio.
- **Evidência:** comportamento mantido no release candidate aprovado das Trincheiras; commit `4833b5f`; Playwright QA V3; `PROJECT-CHECKPOINT.md`.
- **Arquivos conhecidos:** `src/game.js`, testes Gorthak.
- **Relação:** desbloqueado após a primeira vitória contra o Xamã.

## DEC-2026-10-18-VIS-004 — Reações visuais das Trincheiras

- **Área:** Galeria / Oficina
- **Estado:** aprovado
- **Descrição:** dano, recuo e crítico usam o motor compartilhado; não usar respiração ou idle artificial; respeitar movimento reduzido e limpar animações ao encerrar/reconstruir o combate.
- **Justificativa:** melhorar leitura de impacto sem alterar cálculo de combate.
- **Evidência:** instrução do responsável informando aprovação visual no Safari/iPhone; commits `1e85b91` a `e6a965e` e auditoria final comprovam o conteúdo técnico correspondente.
- **Arquivos conhecidos:** `src/combat-animator.js`, `src/gorthak-visual.js`, `src/game.js`, `styles/game.css`.
- **Relação:** substitui os experimentos de respiração rejeitados; não muda mecânicas.

## DEC-ND-UX-005 — Resultados exigem CONTINUAR

- **Área:** Oficina / Arsenal
- **Estado:** aprovado
- **Data:** não determinada
- **Descrição:** vitórias, derrotas e resultados interativos não desaparecem automaticamente; recompensas e penalidades são consolidadas ao confirmar.
- **Justificativa:** evitar perda de informação e garantir persistência idempotente.
- **Evidência:** `AGENTS.md`, `PERSISTENCE.md`, testes de vitória pendente.
- **Arquivos conhecidos:** `src/game.js`, `src/persistence.js`.
- **Relação:** base para o retorno automático ao Mapa da candidata pós-playtest.

## DEC-2026-10-20-FIX-006 — Candidata pós-playtest V1

- **Área:** Arsenal / Cartografia / Oficina
- **Estado:** aprovado para QA; promoção à produção pendente
- **Descrição:** reconciliação do orçamento de atributos após perda de nível, informação de penalidade, retorno ao Mapa, layout móvel de combate, primeira aparição de Romar e redução dos drops aleatórios do Tônico de XP.
- **Justificativa:** corrigir falhas observadas no playtest sem perder saves legítimos.
- **Evidência:** commit `11bff6c`; `laboratorios/pos-playtest-v1/RELATORIO_POS_PLAYTEST_V1.md`; `origin/qa-preview` no snapshot.
- **Arquivos conhecidos:** descritos no relatório da candidata.
- **Relação:** descendente do QA visual das Trincheiras; não está contida no HEAD local ativo `081fce4`.

## DEC-ND-FLO-007 — Preservação da Floresta Uivante V2

- **Área:** Galeria
- **Estado:** aprovado
- **Data:** não determinada
- **Descrição:** usar o Mago original; preservar Lobisomens e Alfa da Matilha; não substituir artes sem aprovação; arena e Lobo Comum V2 precisam de integração isolada e revisão no iPhone.
- **Justificativa:** modernizar a apresentação sem descaracterizar artes existentes.
- **Evidência:** instrução do responsável na missão Floresta Uivante V2 e arquivos locais inspecionados.
- **Arquivos conhecidos:** `assets/images/characters/combat/mago.png`, artes atuais da Floresta, pacote e laboratório do Lobo.
- **Relação:** complementa a Arena V2.4; integração ainda pendente.

## DEC-2026-10-25-FLO-008 — Recorte do Lobo Comum V2

- **Área:** Galeria
- **Estado:** pendente
- **Descrição:** o recorte preserva RGB e silhueta e contém alpha 0–255; falta aprovação visual humana antes de integrá-lo.
- **Justificativa:** separar o ator do fundo sem recriar a arte.
- **Evidência:** `laboratorios/lobo-comum-v2-recorte-teste/RELATORIO_RECORTE.md` e hashes no manifesto.
- **Arquivos conhecidos:** fonte e recorte listados em `MANIFESTO_ARTES.json`.
- **Relação:** depende de DEC-ND-FLO-007; não autoriza substituição de asset.

## DEC-2026-10-25-FLO-009 — Aprovação do recorte e integração local da Floresta V2

- **Área:** Galeria / Oficina
- **Estado:** aprovado para integração local; QA e produção pendentes
- **Descrição:** aprovar visualmente o recorte RGBA do Lobo Comum V2 e integrá-lo como o primeiro inimigo comum da Floresta, com o Mago original à esquerda e a arena aprovada como fundo territorial.
- **Justificativa:** modernizar o primeiro combate da Floresta sem alterar mecânicas ou substituir Lobisomens e Alfa.
- **Evidência:** instrução do responsável em 2026-10-25; hashes do manifesto; 188/188 Node; 65/65 Chromium; capturas em 320, 375 e 390 px.
- **Arquivos conhecidos:** `src/game.js`, `styles/game.css`, novos assets de combate da Floresta e testes relacionados.
- **Relação:** supera a pendência visual de `DEC-2026-10-25-FLO-008`; preserva `DEC-ND-FLO-007`; não autoriza commit, push, deploy ou produção.

## DEC-2026-10-25-FLO-010 — Validação física do Lobo Comum V2 no Safari/iPhone

- **Área:** Galeria / Oficina
- **Estado:** aprovado
- **Data:** 2026-10-25
- **Descrição:** o responsável confirmou teste funcional e aprovação visual do combate da Floresta V2 no Safari de um iPhone físico. O build continha o Mago original à esquerda, a arena V2 como fundo e o Lobo Comum V2 com recorte RGBA; foram verificados enquadramento, HUD, comandos, transparência e fluidez. O nome exibido no build validado era “Lobo Comum”.
- **Justificativa:** é a única validação capaz de encerrar a pendência de Safari; Chromium não a substitui.
- **Evidência:** instrução do responsável registrada nesta missão. Não há captura, vídeo ou log do dispositivo anexado ao repositório; o registro é declaração humana, não medição automática.
- **Limite:** a aprovação cobre o build da Floresta V2 submetido ao teste; não autoriza commit, push, merge ou promoção à produção.
- **Arquivos conhecidos:** `docs/memoria/*`; nenhum arquivo de código.
- **Relação:** supera a pendência de Safari de `DEC-2026-10-25-FLO-009` e de `PROXIMOS_PASSOS`; não altera `DEC-ND-FLO-007`.

## DEC-2026-10-25-QLT-011 — Autorização do deploy QA isolado da Floresta V2

- **Área:** Oficina
- **Estado:** aprovado
- **Data:** 2026-10-25
- **Descrição:** o responsável autorizou a publicação por Direct Upload no projeto Cloudflare isolado `a-ultima-lua-floresta-v2-qa`, deployment `3e8e9679-2441-46a6-a907-928166b5194e`, acessível em `https://a-ultima-lua-floresta-v2-qa.pages.dev/` e em `https://3e8e9679.a-ultima-lua-floresta-v2-qa.pages.dev/`. O deployment foi publicado em 2026-10-25 sob essa autorização.
- **Escopo:** somente QA isolado. Não autoriza produção, promoção, push Git ou merge; não altera `a-ultima-lua-qa`, GitHub Pages nem a produção do jogo. O rótulo técnico `production` do Cloudflare vale apenas dentro do projeto isolado.
- **Justificativa:** permitir o playtest físico sem promover o jogo.
- **Evidência:** instrução do responsável; URL pública acessível servindo `src/game.js` com o asset e o cenário da Floresta V2; `_qa-dist/src/game.js` byte-idêntico ao `src/game.js` do worktree (`0F907729287C5E1413EB177E87FCF5307468681F8C1D70857F82005F6FE705F3`).
- **Relação:** complementa `DEC-2026-10-25-FLO-009`, que trata da integração local e não incluía autorização de deploy. A autorização de deploy é um ato próprio, registrado neste ID, e não altera o texto de `FLO-009`.

## DEC-2026-10-25-DOC-012 — Reconciliação do Palácio da Memória

- **Área:** Crônicas / Oficina
- **Estado:** aprovado
- **Data:** 2026-10-25
- **Descrição:** consolidar na branch `docs/palacio-memoria-v1` o estado documental mais recente, que existia apenas como arquivos não rastreados no worktree da Floresta; separar estado atual de snapshots históricos; corrigir o manifesto; criar o bestiário da Floresta; registrar `FLO-010` e `QLT-011`; corrigir a branch ativa e o nível de evidência do deploy.
- **Justificativa:** eliminar as divergências D1–D4, D6 e D8 da auditoria independente sem reescrever decisões antigas.
- **Evidência:** auditoria independente desta sessão; hashes recalculados em 2026-10-25; refs Git registradas; backup dos documentos anteriores em `C:\Users\jeffe\AppData\Local\Temp\opencode\palacio-2026-10-25`.
- **Arquivos conhecidos:** `ESTADO_ATUAL.md`, `DECISOES_APROVADAS.md`, `ARQUITETURA.md`, `PROXIMOS_PASSOS.md`, `HISTORICO_DESENVOLVIMENTO.md`, `MANIFESTO_ARTES.json`, `README.md`, `BESTIARIO_FLORESTA_UIVANTE.md` (novo).
- **Relação:** não altera o texto de nenhuma decisão anterior; adiciona índice de substituições. Não autoriza commit, push ou deploy por si só.

## DEC-2026-10-25-FLO-013 — Escopo visual pendente dos demais habitantes da Floresta

- **Área:** Galeria
- **Estado:** proposto
- **Data:** 2026-10-25
- **Descrição:** Uivante das Sombras, Lobo Cinzento, Romar e Lobo da Matilha permanecem sem arte V2 e sem decisão de substituição. Lobisomem Jovem, Lobisomem Feroz e Alfa da Matilha permanecem preservados por `DEC-ND-FLO-007`.
- **Justificativa:** impedir que a aprovação do Lobo Comum seja interpretada como autorização para substituir os demais.
- **Evidência:** `BESTIARIO_FLORESTA_UIVANTE.md`; `MANIFESTO_ARTES.json`; `src/game.js`.
- **Arquivos conhecidos:** `src/game.js`, assets da Floresta, manifesto.
- **Relação:** complementa `DEC-ND-FLO-007` e `DEC-2026-10-25-FLO-009`; qualquer arte nova exige decisão específica.
- **Resolução parcial (2026-10-25):** o escopo do Lobo Cinzento foi resolvido por `DEC-2026-10-25-FLO-014`; Uivante das Sombras, Romar e Lobo da Matilha permanecem pendentes.

## DEC-2026-10-25-FLO-014 — Aprovação do Lobo Cinzento V2

- **Área:** Galeria / Oficina
- **Estado:** aprovado
- **Data:** 2026-10-25
- **Descrição:** aprovar visualmente a arte fornecida do Lobo Cinzento V2, o recorte RGBA derivado dela e a integração experimental na arena Floresta Uivante V2. A integração preserva o ID, os atributos (42/8/3), o Bote, as recompensas e a progressão; altera somente retrato, enquadramento e posição na arena.
- **Justificativa:** diferenciar visualmente o tier 1 do Lobo Comum sem inflar atributos, sem substituir Lobisomens e Alfa e sem reutilizar a arte do Comum.
- **Evidência:** aprovação do responsável nesta missão; fonte `lobo-cinzento-v2-aprovado.png` (SHA-256 `292A1E045C437B4425BDCF46D8173AE4AB16746B61C6295338C32045A3A52FA4`); asset `assets/images/enemies/forest/lobo_cinzento_combat_v2.png` (1536×1024, PNG RGBA, SHA-256 `5174F63C343350C87E493A79E853A3297E92F63D0EAE05A17681FCBC982A4D86`); commit `83eb67781e3ce4293238ca6ef43d4067298d96ce`; 189/189 Node e 68/68 Chromium; capturas em `evidencias/lobo-cinzento-v2/`.
- **Arquivos conhecidos:** `src/game.js`, `styles/game.css`, asset novo, `tests/forest-v2.test.cjs`, `tests/browser/forest-v2.spec.cjs`, `tests/persistence.test.cjs`.
- **Relação:** resolve o escopo do Lobo Cinzento em `DEC-2026-10-25-FLO-013`; preserva `DEC-ND-FLO-007`; não autoriza push, deploy ou produção.

## DEC-2026-10-25-QLT-015 — QA isolado e validação Safari do Lobo Cinzento V2

- **Área:** Oficina / Galeria
- **Estado:** aprovado
- **Data:** 2026-10-25
- **Descrição:** publicar o pacote QA gerado exclusivamente do commit `83eb67781e3ce4293238ca6ef43d4067298d96ce` no projeto Cloudflare Pages isolado `a-ultima-lua-floresta-v2-qa` e validar o site no Safari de iPhone físico. O deployment `45362c1d-ca92-4c0b-b6d4-6b51c258fc9d` foi publicado na branch de produção `floresta-v2-qa` desse projeto isolado.
- **Escopo:** somente QA isolado. Não é produção do jogo; não altera `a-ultima-lua-qa`, GitHub Pages, `main` ou `qa-preview`.
- **Evidência:** autorização do responsável; confirmação “Tudo funcionando” após o teste físico; deployment `45362c1d-ca92-4c0b-b6d4-6b51c258fc9d`; URLs `https://45362c1d.a-ultima-lua-floresta-v2-qa.pages.dev/` e `https://a-ultima-lua-floresta-v2-qa.pages.dev/`; hashes publicados conferem com o pacote; HTTP 200; 189/189 Node e 68/68 Chromium; smoke test sem erros, 404 ou overflow.
- **Limite:** a validação Safari é declaração humana; não há captura ou log do iPhone anexado ao repositório.
- **Relação:** complementa `DEC-2026-10-25-FLO-014`; não autoriza promoção à produção.

## Rejeitado ou não autorizado

- **DEC-2026-10-16-VIS-R01 — Respiração/idle por escala da imagem inteira:** rejeitado. O efeito foi percebido como zoom artificial. Não integrar sem nova decisão e novas artes adequadas.
- **DEC-ND-GAME-R02 — Mudanças autônomas de design, balanceamento ou progressão:** rejeitado como prática operacional por `AGENTS.md`; exige aprovação do responsável.

## Índice de substituições e complementos

Este índice é navegação; não altera o texto nem o estado original dos registros.

- `DEC-2026-10-25-FLO-008` (pendente) — superada por `DEC-2026-10-25-FLO-009` (recorte aprovado) e `DEC-2026-10-25-FLO-010` (validação física).
- `DEC-2026-10-25-FLO-009` — o item “Safari/iPhone pendente” foi complementado por `DEC-2026-10-25-FLO-010`; o item “não autoriza deploy” permanece válido e é delimitado por `DEC-2026-10-25-QLT-011`; commit, push e produção continuam não autorizados.
- `DEC-2026-10-20-FIX-006` — promoção à produção segue pendente.
- `DEC-ND-FLO-007` — preservação mantida; a integração do Lobo Comum foi executada localmente (`FLO-009`) e validada (`FLO-010`).
- `DEC-2026-10-25-FLO-013` — permanece `proposto`; o escopo do Lobo Cinzento foi resolvido por `DEC-2026-10-25-FLO-014`; Uivante das Sombras, Romar e Lobo da Matilha seguem pendentes.
- `DEC-2026-10-25-FLO-014` — `aprovado` em 2026-10-25; integração commitada e publicada na branch feature; QA isolado e Safari complementados por `QLT-015`; produção não autorizada.
- `DEC-2026-10-25-QLT-015` — `aprovado`; complementa `FLO-014` com o QA isolado publicado e a confirmação Safari; produção não autorizada.
- `DEC-2026-10-25-DOC-012` — `aprovado` em 2026-10-25; a aprovação cobre a reconciliação documental, não push ou deploy.
