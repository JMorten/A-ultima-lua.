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
- **Nota posterior (2026-10-26):** a preservação do Lobisomem Jovem foi substituída por `DEC-2026-10-26-FLO-016`; Lobisomem Feroz e Alfa permanecem preservados.

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
- **Nota posterior (2026-10-26):** o Lobisomem Jovem foi substituído por `DEC-2026-10-26-FLO-016`; Lobisomem Feroz e Alfa permanecem preservados.
- **Nota posterior (2026-10-26):** o escopo do Uivante das Sombras foi resolvido por `DEC-2026-10-26-FLO-017`; Romar e Lobo da Matilha permanecem pendentes.
- **Nota posterior (2026-10-26):** o escopo do Romar foi resolvido por `DEC-2026-10-26-FLO-018`; resta apenas o Lobo da Matilha.
- **Nota posterior (2026-10-27):** o escopo do Lobo da Matilha foi resolvido por `DEC-2026-10-27-FLO-019`. O registro fica encerrado como histórico; nenhuma entidade desta decisão permanece pendente.

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

## DEC-2026-10-26-FLO-016 — Aprovação e validação Safari do Lobisomem Jovem V2

- **Área:** Galeria / Oficina
- **Estado:** aprovado
- **Data:** 2026-10-26
- **Descrição:** aprovar a nova arte do Lobisomem Jovem V2 (homem no início da transformação), o recorte RGBA derivado do arquivo fornecido e a integração na Arena V2. A integração preserva ID, atributos (58/11/4), Instinto de Caça, recompensas e progressão; altera somente imagem, enquadramento e posição. O QA isolado foi publicado e validado no Safari/iPhone pelo responsável.
- **Justificativa:** integrar o Jovem à linguagem visual da Floresta V2 sem alterar combate e preservando a identidade humana parcialmente transformada.
- **Evidência:** autorização e confirmação do responsável; fonte `lobisomem-jovem-v2-aprovado.png` (1536×1024, RGBA, SHA-256 `59F9F30840F7AD224281633EE613E5D1BF7C87B4023036E1606740BCD8753276`); asset `assets/images/enemies/forest/lobisomem_jovem_combat_v2.png` (1536×1024, PNG RGBA, SHA-256 `E26AC2C0C4FE2B15F289C180FAE4BDB28406064174CAF3CF43488D0700D1D6A3`); commit `25ae3fbba448d3e6ce49147bbbfdc51829d738e2`; deployment `860aa1d1-a3cf-4715-a89e-2a07d7e0126b`; 190/190 Node e 71/71 Chromium; capturas em `evidencias/lobisomem-jovem-v2/`.
- **Limite:** a validação Safari é declaração humana; não há captura ou log do iPhone anexado ao repositório.
- **Arquivos conhecidos:** `src/game.js`, `styles/game.css`, asset novo, `tests/forest-v2.test.cjs`, `tests/browser/forest-v2.spec.cjs`, `tests/persistence.test.cjs`.
- **Relação:** substitui `DEC-ND-FLO-007` **somente** para o Lobisomem Jovem; Feroz e Alfa permanecem preservados; não autoriza promoção à produção.

## DEC-2026-10-26-FLO-017 — Aprovação do Uivante das Sombras V2

- **Área:** Galeria / Oficina
- **Estado:** aprovado
- **Data:** 2026-10-26
- **Descrição:** aprovar a nova arte do Uivante das Sombras V2 (lobo espectral de fumaça negra, olhos azuis e garras), o recorte RGBA derivado do arquivo fornecido e a integração na Arena V2. A integração preserva ID, atributos (190/25/12), Presságio Sombrio, Golpe Brutal, Fúria Desesperada, recompensas e progressão; altera somente imagem, enquadramento e posição. A única alteração no arquivo foi a normalização do canal alfa; nenhum redesenho.
- **Justificativa:** o mini-chefe aparecia menor que os lobos comuns e com retângulo de JPEG visível contra a arena. A nova arte restaura a hierarquia visual do território sem tocar em combate ou balanceamento.
- **Evidência:** autorização do responsável; fonte `uivante-sombras-v2-aprovado.png` (1536×1024, RGBA, cantos alpha 0, SHA-256 `1A2BF63B4DB5ED9E78826BE44C7D4635981982A6BC54731CCF04AD9CACAFEDB4`); asset `assets/images/enemies/forest/uivante_sombras_combat_v2.png` (1536×1024, PNG RGBA, 2.027.865 bytes, SHA-256 `E17533A137F583B4BB6BC8A79931D09500EFFBC370791AE1EA1DA85C7FBD2BDF`); commit `bb7197ab0e79844c128589d2160e40c05bab242a`; deployment `7e466fdf-248b-4dd2-b8e7-0230ea425e06`; 191/191 Node e 74/74 Chromium; smoke test público em 320/375/390 sem erros, 404 ou overflow; capturas em `evidencias/uivante-sombras-v2/`.
- **Limite:** não houve teste em Safari/iPhone; a aprovação cobre a arte, o recorte e a integração, não a validação física. Não há captura ou log de dispositivo.
- **Arquivos conhecidos:** `src/game.js`, `styles/game.css`, asset novo, `tests/forest-v2.test.cjs`, `tests/browser/forest-v2.spec.cjs`, `tests/persistence.test.cjs`.
- **Relação:** resolve o escopo do Uivante das Sombras em `DEC-2026-10-25-FLO-013`; preserva a arte JPEG antiga; não autoriza promoção à produção.
- **Nota posterior (2026-10-26):** após revisão do responsável, o enquadramento foi ampliado de `w:0.51`/`h:0.80` para `w:0.58`/`h:0.95` (commit `385bdf5`, deployment `f6b00e93-2405-4cd7-b617-c1efcf5723ca`). A checagem de sobreposição com o Mago passou a comparar silhuetas pintadas por alfa, com tolerância de 4% da largura do palco para a fumaça do mini-chefe; os quatro inimigos da Floresta continuam cobertos. Arte, atributos e comportamento não mudaram.

## DEC-2026-10-26-QLT-018 — Validação física do Uivante das Sombras V2

- **Área:** Oficina / Galeria
- **Estado:** aprovado
- **Data:** 2026-10-26
- **Descrição:** validar no Safari de iPhone físico o deployment `f6b00e93-2405-4cd7-b617-c1efcf5723ca` do projeto isolado `a-ultima-lua-floresta-v2-qa`, com a escala final do Uivante (`w:0.58`/`h:0.95`) e a nova checagem de sobreposição por silhueta pintada.
- **Escopo:** somente QA isolado. Não é produção do jogo; não altera `a-ultima-lua-qa`, GitHub Pages, `main` ou `qa-preview`.
- **Evidência:** declaração do responsável após o teste no dispositivo (“Perfeito prossiga”); deployment `f6b00e93-2405-4cd7-b617-c1efcf5723ca`; URLs `https://a-ultima-lua-floresta-v2-qa.pages.dev/?v=f6b00e93` e `https://f6b00e93.a-ultima-lua-floresta-v2-qa.pages.dev/`; paridade SHA-256 entre o site público e `_qa-dist`; 191/191 Node e 74/74 Chromium; smoke público em 320/375/390 sem erros, 404 ou overflow; capturas em `evidencias/uivante-sombras-v2/`.
- **Limite:** a validação é declaração humana; não há captura nem log do iPhone anexado ao repositório. Não cobre promoção à produção.
- **Relação:** complementa `DEC-2026-10-26-FLO-017`; não autoriza promoção à produção.

## DEC-2026-10-26-FLO-018 — Aprovação do Romar V2 em três estágios

- **Área:** Galeria / Oficina
- **Estado:** aprovado
- **Data:** 2026-10-26
- **Descrição:** aprovar as três novas artes do Romar (estágio 1 com marcas rúnicas nos braços; estágio 2 com a corrupção da runa avançando em veios e rachaduras; estágio 3 ainda humano, com olhos vermelhos e postura agressiva), o recorte RGBA derivado dos arquivos fornecidos e a integração na Arena V2. A integração preserva ID, atributos (300/24/12 e faixas por nível), golpes, Guarda de Ferro, Golpe Pesado, Surto, Fratura, encontro não letal, escolha final e recompensa; altera somente imagem, enquadramento e posição. Aprovado pelo responsável também o rosto resultante, mantido próximo da arte anterior.
- **Justificativa:** o Romar aparecia como retângulo de JPEG com fundo embutido, menor que um lobo comum, apesar de ser um duelo de fim de território. As três artes dão progressão visual legível e ancoragem no chão, sem tocar em combate.
- **Evidência:** autorização do responsável; fontes `romar-v2-aprovado-1.png` (SHA-256 `7569EDFEC5CD630BDE1E6CEF59782A991246F4FA7763912057DF944913BF1F0B`), `-2.png` (`F93D92A36F4862A0990F92EA268817AEB0873D7EFCAFFC41FF799A59ED5AAFA4`) e `-3.png` (`95AA7959841323F53DD578859D0CFFDB45FBE991B8B670D284CE9178B051336F`), todas 1024×1536 RGBA com transparência real e cantos alpha 0; assets `romar_v2_estagio1.png` (`7382D5666C3186CA4849CB9F4E686C0ED628090B516F30627C48AC3B5B178FEE`), `estagio2` (`B9CC5745B42F6BDA46152EAE777C1D21238305F02539150CCA9DD92FB2AA34E7`) e `estagio3` (`B3626F3C324967218D2197381431CECF7259886763F0DDB13B681B2521C506A7`); commit `cbc50b62f4530d11bfb8c1f4877c6c5b8fadf121`; deployment `c5618de6-77a3-42d0-9227-af87129c3eb1`; 192/192 Node e 77/77 Chromium; transições reais por ataque verificadas no QA público em 320/375/390; capturas em `evidencias/romar-v2/`.
- **Limite:** produção autorizada e promovida em `30df194c` (build `9544043`). Reação de impacto (shake) corrigida em `9544043` (o re-render da ação trocava o retrato antes da animação pintar).
- **Arquivos conhecidos:** `src/game.js`, `styles/game.css`, três assets novos, `tests/forest-v2.test.cjs`, `tests/browser/forest-v2.spec.cjs`, `tests/romar-playtest-quest.test.cjs`.
- **Relação:** resolve o escopo do Romar em `DEC-2026-10-25-FLO-013`, que passa a cobrir somente o Lobo da Matilha; preserva as três artes JPEG antigas; não autoriza promoção à produção.
- **Nota posterior (2026-10-26):** após revisão no QA público, a altura do Romar foi reduzida de `h:0.92` para `h:0.78` (commit `7a23369`, deployment `49331648`), deixando folga no topo do palco sem deixá-lo menor que o Mago. Artes, atributos e comportamento não mudaram.
- **Nota posterior (2026-10-27):** validado no Safari/iPhone (`a92987ce`): transições 1→2→3 e reação de impacto confirmadas. Produção pendente.
- **Nota posterior (2026-10-27):** o último item de `FLO-013`, o Lobo da Matilha, foi resolvido por `DEC-2026-10-27-FLO-019`.

## DEC-2026-10-27-FLO-019 — Lobo da Matilha com identidade visual própria

- **Área:** Galeria / Oficina
- **Estado:** aprovado
- **Data:** 2026-10-27
- **Descrição:** aprovar a arte `lobo_matilha_combat_v2.png` e dar ao Lobo da Matilha **identidade visual própria na arena**: ator separado no palco e barra de HP flutuante, além do dano flutuante ao ser atacado. O nome `LOBO DA MATILHA` fica no rótulo acessível do ator e no botão de ataque, **sem texto sobre a arte**. O lobo continua **sem ID de inimigo** e **sem entrada em `MAPS`**: a identidade é só de apresentação, lida de `packWolfActive`, `packWolfHp` e `packWolfHpMax` no Alfa.
- **Justificativa:** era o único “inimigo” do jogo que existia apenas como número — chip de texto e botão, sem retrato, sem nome próprio e sem barra. O responsável escolheu, entre as opções apresentadas, dar identidade visual ao lobo em vez de mantê-lo como recurso invisível do Alfa.
- **Escopo preservado:** HP máximo (8–12% do Alfa), ataque (35% do ATQ-base), esquiva, dano da Caçada Coordenada, quebra da caçada, adiamento da próxima invocação em 3 turnos e o intervalo de invocação (4 ações) **não mudaram**. O Alfa, sua arte JPEG e suas três fases permanecem intactos.
- **Ajustes de apresentação aprovados junto:** o chip do Alfa passa a dizer `MATILHA ATIVA · CAÇADA COORDENADA` (o HP agora vive na barra do lobo) e o botão fica `🐺 Atacar Lobo da Matilha`, sem repetir o HP.
- **Evidência:** autorização do responsável; fonte `pack_wolf_subordinate_cutout.png` (1920×1280 RGBA); asset `lobo_matilha_combat_v2.png` 1000×758 RGBA, SHA-256 `A767B072A0ABC72BF3068F693EFDBF59F74B3A9A85C628C21E73A3C956502F8B`, cantos alpha 0, sem franja magenta após despill; commits `a841181` (ator e placa) e `49f8ed2` (placa sem nome); deployment `a92987ce`; 195/195 Node e 80/80 Chromium; QA público com invocação real em 320/375/390 sem erro nem 404; - **Limite:** produção autorizada e promovida em `30df194c` (build `9544043`).
- **Nota posterior (2026-10-27):** o responsável revisou o ator no Safari e pediu para tirar o nome de cima da arte; a placa ficou só com barra e HP (`49f8ed2`, QA `a92987ce`). `LOBO DA MATILHA` continua no rótulo acessível e no botão de ataque.
- **Nota posterior (2026-10-27):** validado no Safari/iPhone (`a92987ce`): ator, placa sem nome, chip e reação de impacto confirmados. Produção promovida em `30df194c`.
- **Arquivos conhecidos:** `src/game.js`, `styles/game.css`, `assets/images/enemies/forest/lobo_matilha_combat_v2.png`, `_qa/debug.js`, `tests/forest-v2.test.cjs`, `tests/browser/forest-v2.spec.cjs`, manifesto.
- **Relação:** resolve o último item de `DEC-2026-10-25-FLO-013`; complementa `DEC-2026-10-26-FLO-018`; não altera `DEC-ND-FLO-007`.

## DEC-2026-10-27-FLO-020 — Aprovação do Alfa da Matilha V2

- **Área:** Galeria / Oficina
- **Estado:** aprovado
- **Data:** 2026-10-27
- **Descrição:** aprovar a arte `alfa_matilha_combat_v2.png` e dar ao Alfa da Matilha **identidade visual V2**: retrato natural em PNG RGBA com transparência real, caixa própria (`w:0.50`, `h:0.86`, `x:0.68`), além de reações de impacto (shake + flash `alfa-hit-flash`) ao ser atacado. O Alfa continua **sem entrada em `MAPS`** como entidade separada (é o chefe do mapa 0) e preserva ID, atributos (300/30/14), XP, moedas, três fases, Caçada Coordenada, Investida, postura de observação e Lua da Caçada. Apenas imagem, enquadramento e apresentação mudam.
- **Justificativa:** o Alfa aparecia como JPEG com fundo embutido e sem reações de impacto, apesar de ser o chefe do território. A arte V2 dá presença de chefe e o flash de impacto dá feedback de golpe, sem alterar combate.
- **Escopo preservado:** HP 300, ATQ 30, DEF 14, XP 130, moedas 40–60, multiplicadores de perigo, buff da Onda Sombria, três fases (Comandante 100–60%, Fúria ≤60% com Investida ×1.65, Instinto ≤30% com DEF 82%, postura de observação e Lua da Caçada ×2.0), intervalo de invocação do lobo (4 ações), drop por tabela de chefe. JPEG legado preservado.
- **Ajustes de apresentação aprovados junto:** reações de impacto (shake + flash) adicionadas ao retrato do Alfa, reaplicadas após re-render para não serem engolidas pelo redesenho da arena.
- **Evidência:** autorização do responsável; fonte `IMG_4592.jpeg` / `0E840775-...png` (1024×1536); asset `alfa_matilha_combat_v2.png` 1024×1536 RGBA, SHA-256 `6054B4A6238372BE1B8D5DA1B728ABA5ABBCB2357B179230D5C6E9A93D4FEC62`, cantos alpha 0 (exceto silhueta que toca a borda inferior direita); commit `f73cb07`; deployment `9489432e`; 196/196 Node e 22/22 Chromium (forest-v2, WebKit); QA público com enquadramento real em 320/375/390; reação de impacto verificada; capturas em `evidencias/alfa-v2/`.
- **Limite:** produção autorizada e promovida em `30df194c` (build `9544043`); item único de chefe (`generateBossUnique`) continua não integrado.
- **Arquivos conhecidos:** `src/game.js`, `styles/game.css`, `assets/images/enemies/forest/alfa_matilha_combat_v2.png`, `tests/forest-v2.test.cjs`, `tests/persistence.test.cjs`, `tests/browser/forest-v2.spec.cjs`, manifesto.
- **Relação:** substitui a preservação do Alfa em `DEC-ND-FLO-007` (Mago e Lobisomem Feroz permanecem preservados); complementa `DEC-2026-10-27-FLO-019`.

## Rejeitado ou não autorizado

- **DEC-2026-10-16-VIS-R01 — Respiração/idle por escala da imagem inteira:** rejeitado. O efeito foi percebido como zoom artificial. Não integrar sem nova decisão e novas artes adequadas.
- **DEC-ND-GAME-R02 — Mudanças autônomas de design, balanceamento ou progressão:** rejeitado como prática operacional por `AGENTS.md`; exige aprovação do responsável.

## Índice de substituições e complementos

Este índice é navegação; não altera o texto nem o estado original dos registros.

- `DEC-2026-10-25-FLO-008` (pendente) — superada por `DEC-2026-10-25-FLO-009` (recorte aprovado) e `DEC-2026-10-25-FLO-010` (validação física).
- `DEC-2026-10-25-FLO-009` — o item “Safari/iPhone pendente” foi complementado por `DEC-2026-10-25-FLO-010`; o item “não autoriza deploy” permanece válido e é delimitado por `DEC-2026-10-25-QLT-011`; commit, push e produção continuam não autorizados.
- `DEC-2026-10-20-FIX-006` — promoção à produção segue pendente.
- `DEC-ND-FLO-007` — preservação mantida para Mago e Lobisomem Feroz; o Lobisomem Jovem foi substituído por `DEC-2026-10-26-FLO-016`; o Lobo Comum foi executado em `FLO-009`/`FLO-010`; o Alfa foi substituído por `DEC-2026-10-27-FLO-020`.
- `DEC-2026-10-25-FLO-013` — encerrada como histórico: Lobo Cinzento, Lobisomem Jovem, Uivante das Sombras, Romar e Lobo da Matilha foram resolvidos por `DEC-2026-10-25-FLO-014`, `DEC-2026-10-26-FLO-016`, `DEC-2026-10-26-FLO-017`, `DEC-2026-10-26-FLO-018` e `DEC-2026-10-27-FLO-019`; nenhum item permanece pendente.
- `DEC-2026-10-25-FLO-014` — `aprovado` em 2026-10-25; integração commitada e publicada na branch feature; QA isolado e Safari complementados por `QLT-015`; produção não autorizada.
- `DEC-2026-10-25-QLT-015` — `aprovado`; complementa `FLO-014` com o QA isolado publicado e a confirmação Safari; produção não autorizada.
- `DEC-2026-10-26-FLO-016` — `aprovado`; nova arte e integração do Lobisomem Jovem, com QA isolado e Safari confirmados; produção não autorizada.
- `DEC-2026-10-26-FLO-017` — `aprovado`; nova arte e integração do Uivante das Sombras, com QA isolado publicado e conferido por hash; Safari complementado por `QLT-018`; produção não autorizada.
- `DEC-2026-10-26-QLT-018` — `aprovado`; validação física do Uivante no Safari/iPhone sobre o deployment `f6b00e93`; produção não autorizada.
- `DEC-2026-10-26-FLO-018` - `aprovado`; três artes e integração do Romar, com QA isolado e transições reais verificadas; Safari validado; produção promovida em `30df194c`.
- `DEC-2026-10-27-FLO-019` - `aprovado`; arte, ator e barra próprios do Lobo da Matilha, sem nome sobre a arte, com QA isolado e invocação real verificada em 320/375/390; Safari validado; produção promovida em `30df194c`.
- `DEC-2026-10-27-FLO-020` - `aprovado`; arte, retrato natural e reações de impacto (shake + flash) do Alfa da Matilha, com QA isolado e enquadramento real verificado em 320/375/390; Safari validado; produção promovida em `30df194c`.
- `DEC-2026-10-25-DOC-012` — `aprovado` em 2026-10-25; a aprovação cobre a reconciliação documental, não push ou deploy.
