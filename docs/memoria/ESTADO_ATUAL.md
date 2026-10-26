# Estado atual

**Snapshot documental:** 2026-10-25 (reconciliação documental).
**Checkout documental:** `D:\Projetos\A-ultima-lua`.
**Branch:** `docs/palacio-memoria-v1`, base `9a6545910ed15ed6b23102766b6928e2c8f636dd`. Este documento descreve o estado do worktree; o commit documental correspondente será o seguinte a essa base.
**Natureza:** este arquivo descreve estado. Decisões e aprovações ficam em [DECISOES_APROVADAS.md](DECISOES_APROVADAS.md).

## Como ler

- **Estado atual** reúne o que foi verificado na data e no nível de evidência indicado.
- **Snapshots anteriores** preserva o texto de inspeções antigas, mesmo quando superado; nada ali descreve o presente.
- Nome de arquivo, relatório, commit ou deploy não prova, sozinho, aprovação artística ou de game design.

## Linhas de desenvolvimento (inspeção de 2026-10-25)

| Branch | HEAD | Worktree | Situação no snapshot |
|---|---|---|---|
| `docs/palacio-memoria-v1` | `9a65459` | raiz `D:\Projetos\A-ultima-lua` | Linha documental canônica. `origin/docs/palacio-memoria-v1` está no mesmo commit; o registro desta etapa será o commit seguinte. |
| `qa-preview` | `081fce4` | — | 1 commit à frente e 1 atrás de `origin/qa-preview` (`11bff6c`). |
| `feature/floresta-uivante-v2-etapa1` | `83eb677` | `laboratorios/floresta-uivante-v2-etapa1/checkout` | Lobo Comum V2 commitado e publicado (`4236b84`, `16f4c9c`); Lobo Cinzento V2 commitado localmente em `83eb677`, ainda não publicado. |
| `fix/pos-playtest-v1` | `11bff6c` | `laboratorios/pos-playtest-v1/candidate` | Candidata pós-playtest. |
| `main` | `f7e25ef` | `laboratorios/protocolo-autonomo-v1/main-integracao` | 8 commits à frente de `origin/main` (`4833b5f`). |
| `release/trincheiras-rc1` | `e6a965e` | — | 15 commits à frente de `origin/main`. |
| `docs/protocolo-autonomo-v1` | `990fb38` | `laboratorios/protocolo-autonomo-v1/checkout` | Documentação do protocolo autônomo. |

- A raiz é um **worktree separado**; o código da Floresta V2 não está nela. Evidência de código deve ser lida no worktree da branch `feature/floresta-uivante-v2-etapa1`.
- Não rastreados preservados no checkout documental: `Imagem do ChatGPT 18 de out. de 2026, 12_30_18.jpg`, `lobo-comum-v2-aprovado.png`, `lobo-cinzento-v2-aprovado.png` e `pacote-floresta-v2.zip`.
- Esta documentação não sincroniza, não faz merge e não resolve a divergência entre branches.

## Níveis de evidência

Não confundir os seis níveis abaixo; cada registro deve dizer a qual pertence.

1. **Implementação local** — alteração em worktree, não commitada.
2. **Commit** — conteúdo versionado em um HEAD identificável.
3. **Build QA** — `_qa-dist` gerado localmente a partir do código.
4. **Deploy QA isolado** — publicação em projeto Cloudflare separado, autorizada e delimitada.
5. **Produção** — promoção ao jogo publicado; não autorizada para a Floresta V2.
6. **Aprovação humana física** — validação em Safari/iPhone; não substituível por Chromium.

## Floresta Uivante — estado atual

- O bestiário completo, com IDs, assets, condições de encontro e estados de aprovação, está em [BESTIARIO_FLORESTA_UIVANTE.md](BESTIARIO_FLORESTA_UIVANTE.md). São **oito entidades**.
- **Lobo Comum V2** (`lobo_selvagem`): aparência e recorte aprovados; combate validado no Safari físico pelo responsável em 2026-10-25 (`DEC-2026-10-25-FLO-010`). Integração commitada e publicada na branch `feature/floresta-uivante-v2-etapa1` (`4236b84` e `16f4c9c`).
- **Lobo Cinzento V2** (`lobo_cinzento`): arte, recorte e integração experimental aprovados (`DEC-2026-10-25-FLO-014`); commit local `83eb677` na branch feature, **não publicado**. Atributos, Bote, recompensas e progressão inalterados; arte antiga preservada.
- **QA isolado**: Direct Upload autorizado pelo responsável e publicado em 2026-10-25 no projeto `a-ultima-lua-floresta-v2-qa`, deployment `3e8e9679-2441-46a6-a907-928166b5194e` (`DEC-2026-10-25-QLT-011`). Refere-se ao build do Lobo Comum; não é produção e não alterou `a-ultima-lua-qa` nem GitHub Pages.
- **Produção**: inalterada. Nenhuma promoção autorizada.
- **Lobisomem Jovem, Lobisomem Feroz e Alfa da Matilha**: artes atuais preservadas por `DEC-ND-FLO-007`; sem autorização para substituição.
- **Uivante das Sombras, Romar e Lobo da Matilha**: sem arte V2; permanecem no escopo histórico de `DEC-2026-10-25-FLO-013` (proposto). O Lobo Cinzento foi resolvido por `FLO-014`.
- **Reações visuais**: o motor compartilhado cobre somente os atores das Trincheiras; nenhum inimigo da Floresta tem perfil de dano/recuo/crítico.

## Cartografia

- T1 — Floresta Uivante: implementada; apresentações V2 do Lobo Comum e do Lobo Cinzento aprovadas e commitadas na branch feature. Produção inalterada.
- T2 — Pântano Podre: implementado, incluindo Senhor do Pântano, materiais e fluxo de vitória pendente documentados.
- T3 — Trincheiras Orc: progressão determinística, Xamã ritualístico, Gorthak e apresentação Arena V2.4 implementados na linha QA/release.
- T4 — Cripta Sangrenta: definida no código com inimigos, miniboss e boss; sem evidência de revisão visual V2 equivalente às Trincheiras.
- T5: não existe no checkpoint auditado.

## Oficina

- Aplicação web estática: `index.html`, `styles/game.css`, `src/game.js` e `src/persistence.js`.
- Persistência em `localStorage`, chave `a-ultima-lua.checkpoint`, schema 5 no checkout ativo.
- Arena V2.4 usa cenário, atores, HUD e efeitos em camadas; Trincheiras têm cenário territorial próprio e a Floresta V2 tem cenário próprio na branch feature.
- QA Debug é produzido por `_qa/build.cjs` para `_qa-dist`; a produção normal não referencia o painel de debug.
- Testes Node e Playwright existem. A revalidação de 2026-10-25 registrou **189/189 Node** e **68/68 Chromium**. Números antigos (171/51, 185/61, 188/65) continuam como snapshots históricos.

## Divergências abertas

1. `qa-preview` local (`081fce4`) e `origin/qa-preview` (`11bff6c`) continuam divergentes; reconciliação não decidida.
2. O commit `83eb677` do Lobo Cinzento V2 é **local**; push para `origin/feature/...` pendente.
3. QA isolado e playtest Safari do Lobo Cinzento ainda não realizados; o deployment existente é do Lobo Comum.
4. Escopo visual de Uivante das Sombras, Romar e Lobo da Matilha permanece sem decisão (`FLO-013`, histórico proposto); o Cinzento foi resolvido por `FLO-014`.
5. `PROJECT-CHECKPOINT.md` continua descrevendo um estado de 2026-10-13 e `main`.
6. Contagens de teste antigas continuam citadas em documentos históricos e não devem ser somadas.
7. Laboratórios podem conter propostas ou resultados locais; presença em `laboratorios/` não significa integração ou aprovação.
8. O log de Frenesi foi corrigido para nome dinâmico em `16f4c9c` (D5 resolvido).

**Resolvidas nesta reconciliação:** o Palácio mais recente passou a estar versionado na linha documental (D1); `ARQUITETURA` distingue implementação local, deploy QA e produção (D2); o deploy isolado tem autorização registrada em `QLT-011` (D3); estado atual e snapshots históricos estão separados (D4); a branch ativa foi corrigida (D6); o manifesto deixou de tratar o JPEG antigo do lobo como arte em uso na branch feature (D8).

## Snapshots anteriores — preservado, não representa o estado atual

### Snapshot de 2026-10-25, antes da validação física

- **Data:** 2026-10-25.
- **Worktree:** `laboratorios/floresta-uivante-v2-etapa1/checkout`.
- **Branch de trabalho:** `feature/floresta-uivante-v2-etapa1`.
- **Commit-base:** `11bff6c324ad12a8ad5dcca676418a4fedb6bc0a`.
- A aprovação visual humana do recorte do Lobo Comum V2 foi registrada pelo responsável nesta missão; ela supera somente a pendência visual descrita no snapshot anterior.
- Integração local: arena aprovada da Floresta, Mago original e novo asset de combate do Lobo Comum. Lobisomem Jovem, Lobisomem Feroz e Alfa da Matilha permanecem inalterados.
- Validação repetida antes da publicação: 188/188 testes Node e 65/65 testes Chromium; capturas reais em 320, 375 e 390 px, sem cortes, fundos retangulares, overflow horizontal ou falhas de assets observadas.
- A comparação visual das três larguras foi aprovada pelo responsável para playtest no iPhone.
- QA isolado publicado por Direct Upload, sem push Git: projeto `a-ultima-lua-floresta-v2-qa`, deployment `3e8e9679-2441-46a6-a907-928166b5194e`, URL estável `https://a-ultima-lua-floresta-v2-qa.pages.dev/` e URL imutável `https://3e8e9679.a-ultima-lua-floresta-v2-qa.pages.dev/`.
- O deployment é tecnicamente `production` somente dentro do projeto Cloudflare isolado da Floresta; não alterou `a-ultima-lua-qa`, GitHub Pages nem a produção do jogo.
- Verificação pública: HTTP 200; `index.html`, `src/game.js`, `styles/game.css`, arena e Lobo V2 coincidiram por SHA-256 com `_qa-dist`; Chromium público em 390 x 844 abriu sem erros de console, falhas de requisição ou overflow horizontal.
- Estado: implementação local não commitada; sem push ou merge. Safari/iPhone físico permanece pendente.
- As seções seguintes preservam o snapshot original anterior à integração e devem ser interpretadas historicamente.

*Superado por `DEC-2026-10-25-FLO-010` quanto ao Safari e por `DEC-2026-10-25-QLT-011` quanto à autorização do deploy.*

### Snapshot de 2026-10-25, base documental `b20431f`

**Snapshot documental:** 2026-10-25.
**Checkout inspecionado:** `D:\Projetos\A-ultima-lua`.
**Branch ativa:** `qa-preview`, HEAD `081fce41b4535bd51d39e067d3207b5e7a449298`.

#### Git e linhas de desenvolvimento

- `qa-preview` local está 1 commit à frente e 1 atrás de `origin/qa-preview`. O commit local exclusivo é `081fce4` (proteção de `laboratorios/`); o remoto aponta para a candidata pós-playtest `11bff6c`.
- `main` local está em `f7e25ef`, oito commits à frente de `origin/main` (`4833b5f`). Ele existe em checkout isolado e contém o protocolo autônomo integrado.
- `release/trincheiras-rc1` está em `e6a965e`.
- Existem worktrees isolados para documentação, candidata pós-playtest e integração de `main`.
- Não rastreados preservados no checkout ativo: `Imagem do ChatGPT 18 de out. de 2026, 12_30_18.jpg`, `lobo-comum-v2-aprovado.png` e `pacote-floresta-v2.zip`.
- Esta documentação não sincroniza nem resolve a divergência entre branches.

#### Estado funcional comprovado

##### Cartografia

- T1 — Floresta Uivante: implementada na base histórica; reformulação visual V2 em andamento.
- T2 — Pântano Podre: implementado, incluindo Senhor do Pântano, materiais e fluxo de vitória pendente documentados.
- T3 — Trincheiras Orc: progressão determinística, Xamã ritualístico, Gorthak e apresentação Arena V2.4 implementados na linha QA/release.
- T4 — Cripta Sangrenta: definida no código com inimigos, miniboss e boss. Não há evidência neste snapshot de uma revisão visual V2 equivalente às Trincheiras.
- T5: não existe no checkpoint auditado.

##### Oficina

- Aplicação web estática: `index.html`, `styles/game.css`, `src/game.js` e `src/persistence.js`.
- Persistência em `localStorage`, chave `a-ultima-lua.checkpoint`, schema 5 no checkout ativo.
- Arena V2.4 usa cenário, atores, HUD e efeitos em camadas. Trincheiras têm cenário territorial próprio.
- QA Debug é produzido por `_qa/build.cjs` para `_qa-dist`; a produção normal não referencia o painel de debug.
- Testes Node e Playwright existem. Resultados de relatórios pertencem aos snapshots indicados e não equivalem a uma execução atual.

##### Galeria — Floresta Uivante V2

- Mago original localizado em `assets/images/characters/combat/mago.png`.
- Arena aprovada está em `pacote-floresta-v2.zip`, membro `pacote-floresta-v2/arena-aprovada.jpeg`; não está confirmada como integrada ao jogo.
- Lobo Comum V2 tem aparência aprovada no contexto da tarefa, em `lobo-comum-v2-aprovado.png`.
- Recorte RGBA tecnicamente validado em `laboratorios/lobo-comum-v2-recorte-teste/`; a validação visual final permanece pendente.
- Lobisomem Jovem, Lobisomem Feroz e Alfa da Matilha atuais devem ser preservados. Não há autorização documentada para substituí-los.
- Integração da arena/lobo no jogo, batalha real e playtest no iPhone ainda estão pendentes.

#### Snapshots de QA existentes

- Auditoria final das Trincheiras: 171/171 Node e 51/51 Chromium no snapshot de 2026-10-18; Safari não executado naquela auditoria.
- Candidata pós-playtest `11bff6c`: 185/185 Node e 61/61 Chromium no relatório de 2026-10-20; WebKit/Safari físico pendentes no relatório.
- O usuário posteriormente autorizou e recebeu publicação QA da candidata, mas o checkout ativo local diverge de `origin/qa-preview`. Verificar novamente antes de qualquer nova publicação.

#### Divergências abertas

1. `PROJECT-CHECKPOINT.md` declara um estado de 2026-10-13 e `main`; não descreve toda a sequência visual, a candidata pós-playtest nem a divergência atual de `qa-preview`.
2. O checkpoint antigo afirma que não havia preview QA publicado; relatórios posteriores e o histórico remoto registram publicação QA. Manter o texto antigo como registro histórico.
3. Contagens 150, 162, 171 e 185 testes aparecem em relatórios diferentes. São snapshots de escopos e datas distintos, não um total único atual.
4. Laboratórios podem conter propostas ou resultados locais. Presença em `laboratorios/` não significa integração ou aprovação.
5. O relatório do recorte descreve validação técnica; a aprovação visual humana do Lobo V2 ainda não ocorreu.
