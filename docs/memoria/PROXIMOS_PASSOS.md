# Próximos passos

**Snapshot:** 2026-10-25 (reconciliação documental).

## Concluído em 2026-10-25

- Aprovação visual do recorte do Lobo Comum V2 — `DEC-2026-10-25-FLO-009`.
- Teste funcional e aprovação visual no Safari de iPhone físico — `DEC-2026-10-25-FLO-010`.
- Autorização e publicação do QA isolado da Floresta V2 — `DEC-2026-10-25-QLT-011`.
- Reconciliação documental do Palácio e criação do bestiário — `DEC-2026-10-25-DOC-012`, aprovado em 2026-10-25.
- Validação de Chromium registrada no relatório da integração (188/188 Node e 65/65 Chromium). É um snapshot do relatório, não uma execução desta reconciliação.

## Pendente — exige decisão humana

1. **Versionamento da integração V2:** autorizar (ou não) commit da branch `feature/floresta-uivante-v2-etapa1`. Hoje a integração é local e não commitada.
2. **Escopo visual dos demais habitantes da Floresta:** decidir sobre Uivante das Sombras, Lobo Cinzento, Romar e Lobo da Matilha — `DEC-2026-10-25-FLO-013`, `proposto`.
3. **Reconciliação de linhas Git:** decidir como unir o commit local `081fce4` (`qa-preview`) com `origin/qa-preview` em `11bff6c`; não sincronizar automaticamente.
4. **Promoção à produção:** não autorizada para a Floresta V2; exige decisão específica.
5. **Correção textual (D5):** na branch `feature`, o log de Frenesi ainda diz “Lobo Selvagem” embora o nome exibido seja “Lobo Comum”. Não altera mecânica.
6. **Cobertura documental:** manter o bestiário e o manifesto sincronizados quando qualquer arte ou entidade mudar.

## Fora de escopo até nova decisão

- Reações visuais de dano/recuo/crítico na Floresta: o motor compartilhado cobre somente as Trincheiras.
- Substituição de Lobisomem Jovem, Lobisomem Feroz e Alfa da Matilha: preservados por `DEC-ND-FLO-007`.
- Reutilização automática do asset do Lobo Comum para outra entidade.
- Qualquer mudança de mecânica, balanceamento, atributo, item ou progressão.

## Registro anterior — plano de 2026-10-25, antes do playtest físico (preservado)

> ## Atualização incremental — 2026-10-25
>
> - Aprovação visual do recorte: concluída por instrução do responsável.
> - Integração local e validação automática: concluídas na branch `feature/floresta-uivante-v2-etapa1`, base `11bff6c`.
> - Revisão das capturas e publicação no QA isolado: concluídas; deployment `3e8e9679-2441-46a6-a907-928166b5194e` em `https://a-ultima-lua-floresta-v2-qa.pages.dev/`.
> - Próximo passo seguro: playtest físico no Safari/iPhone. Não inferir esse resultado a partir do Chromium.
>
> ## Prioridade 1 — Floresta Uivante V2
>
> 1. Abrir `https://a-ultima-lua-floresta-v2-qa.pages.dev/?v=3e8e9679` no Safari do iPhone.
> 2. Testar a batalha real com Mago e Lobo Comum, conferindo enquadramento, HUD, comandos, transparência e fluidez.
> 3. Registrar aprovação ou defeitos observados sem confundir playtest físico com os 65 testes Chromium já aprovados.
> 4. Somente após o playtest, decidir sobre commit e eventual integração em outra linha Git.
>
> ## Prioridade 2 — Resolver linhas Git
>
> 1. Decidir como reconciliar o commit local `081fce4` com `origin/qa-preview` em `11bff6c`; não sincronizar automaticamente.
> 2. Decidir se a candidata pós-playtest será incorporada ao release das Trincheiras ou mantida como candidata separada.
> 3. Atualizar `PROJECT-CHECKPOINT.md` apenas depois da decisão de release, preservando o histórico antigo.
>
> ## Prioridade 3 — Cobertura e documentação
>
> - Executar WebKit/Safari quando disponível; não inferir compatibilidade a partir de Chromium.
> - Criar checkpoints com o template após mudanças importantes.
> - Expandir o manifesto quando uma nova arte entrar em avaliação; estado inicial deve ser `pendente` ou `não_verificado`.
>
> ## Decisões humanas pendentes
>
> - Validação física da Floresta V2 no Safari/iPhone.
> - Autorização para versionar a integração local após o playtest.
> - Estratégia de reconciliação de `qa-preview` local/remoto.
> - Promoção de qualquer candidata à produção.

*Este bloco é histórico: a validação física foi registrada em `FLO-010` e a autorização do deploy em `QLT-011`.*
