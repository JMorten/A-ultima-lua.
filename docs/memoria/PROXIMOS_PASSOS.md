# Próximos passos

**Snapshot:** 2026-10-27 (Lobo da Matilha V2).

## Concluído — 2026-10-25 a 2026-10-27

- Aprovação visual do recorte do Lobo Comum V2 — `DEC-2026-10-25-FLO-009`.
- Teste funcional e aprovação visual no Safari de iPhone físico — `DEC-2026-10-25-FLO-010`.
- Autorização e publicação do QA isolado da Floresta V2 — `DEC-2026-10-25-QLT-011`.
- Reconciliação documental do Palácio e criação do bestiário — `DEC-2026-10-25-DOC-012`, aprovado em 2026-10-25.
- Lobo Comum V2 versionado: commits `4236b84` e `16f4c9c` publicados na branch feature.
- Lobo Cinzento V2 aprovado, integrado e publicado: `DEC-2026-10-25-FLO-014`; commit `83eb677` publicado.
- QA isolado do Lobo Cinzento publicado (`45362c1d-ca92-4c0b-b6d4-6b51c258fc9d`) e funcionamento confirmado no Safari/iPhone — `DEC-2026-10-25-QLT-015`.
- Lobisomem Jovem V2 aprovado, integrado e publicado: `DEC-2026-10-26-FLO-016`; commit `25ae3fb`; QA `860aa1d1-a3cf-4715-a89e-2a07d7e0126b`; Safari/iPhone confirmado.
- Uivante das Sombras V2 aprovado, integrado, publicado e validado no Safari/iPhone: `DEC-2026-10-26-FLO-017` e `DEC-2026-10-26-QLT-018`; commits `bb7197a` (arte) e `385bdf5` (escala final `0.58`/`0.95`); QA `f6b00e93-2405-4cd7-b617-c1efcf5723ca`, com paridade SHA-256 entre site público e `_qa-dist`.
- Romar V2 aprovado, integrado e publicado: `DEC-2026-10-26-FLO-018`; commits `cbc50b6` (artes e integração) e `7a23369` (altura final `0.78`); QA `49331648` com os três estágios e transições reais em 320/375/390; Safari/iPhone pendente.
- Lobo da Matilha V2 aprovado, integrado e publicado: `DEC-2026-10-27-FLO-019`; commit `a841181`; QA `34b8ee1a` com invocação real em 320/375/390; ator, nome e barra próprios. Safari/iPhone e produção pendentes.
- Revalidação: **194/194 Node** e **80/80 Chromium** (Chromium 151 do Playwright 1.62.1).

## Pendente — exige decisão humana

1. **Validação física do Lobo da Matilha V2 (prioridade atual):** abrir `https://a-ultima-lua-floresta-v2-qa.pages.dev/?v=34b8ee1a` no Safari do iPhone, usar QA → Debug → novo personagem → CONTINUAR → reabrir QA → **ALFA · COM LOBO DA MATILHA** e conferir ator, placa de HP, chip e ataque ao lobo.
2. **Validação física do Romar V2:** abrir `https://a-ultima-lua-floresta-v2-qa.pages.dev/?v=49331648` no Safari do iPhone, jogar até os estágios 2 e 3 e registrar aprovação ou defeitos.
3. **Reconciliação de linhas Git:** decidir como unir `081fce4` (`qa-preview`) com `origin/qa-preview` (`11bff6c`).
4. **Promoção à produção:** não autorizada para a Floresta V2.
5. **Cobertura documental:** manter bestiário e manifesto sincronizados quando arte ou entidade mudar.

## Fora de escopo até nova decisão

- Reações visuais de dano/recuo/crítico na Floresta: o motor compartilhado cobre somente as Trincheiras.
- Substituição de Lobisomem Feroz e Alfa da Matilha: preservados por `DEC-ND-FLO-007`; o Lobisomem Jovem foi aprovado em `DEC-2026-10-26-FLO-016`.
- Reutilização automática dos assets do Lobo Comum ou do Lobo Cinzento para outra entidade.
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
