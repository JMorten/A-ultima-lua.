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

## Rejeitado ou não autorizado

- **DEC-2026-10-16-VIS-R01 — Respiração/idle por escala da imagem inteira:** rejeitado. O efeito foi percebido como zoom artificial. Não integrar sem nova decisão e novas artes adequadas.
- **DEC-ND-GAME-R02 — Mudanças autônomas de design, balanceamento ou progressão:** rejeitado como prática operacional por `AGENTS.md`; exige aprovação do responsável.
