# Histórico de desenvolvimento

## Crônicas verificáveis

- **2026-09-29:** QA Debug isolado e mecânicas do Senhor do Pântano entram no histórico versionado.
- **2026-10-01 a 2026-10-03:** Arena V2, Alerta de Guerra, ritual do Xamã e Gorthak são construídos.
- **2026-10-05:** checkpoint de recuperação, progressão determinística das Trincheiras e correção de persistência do ritual.
- **2026-10-13:** Playwright QA V1, V2 e V3 e atualização de `PROJECT-CHECKPOINT.md`.
- **2026-10-16:** reações de Gorthak e Orc Batedor; V2 do Batedor remove a leitura de tremedeira.
- **2026-10-17:** Orc Guerreiro, ajuste de escala, Orc Capitão e Açougueiro V2.
- **2026-10-18:** Xamã V2, correção de orientação do Guerreiro, release candidate isolada das Trincheiras e protocolo autônomo integrado à `main` local.
- **2026-10-20:** candidata pós-playtest `11bff6c` conclui seis correções e passa pelos testes documentados.
- **2026-10-23:** candidata pós-playtest registrada em `origin/qa-preview`; commit local `081fce4` passa a ignorar/proteger laboratórios no checkout ativo.
- **2026-10-24 a 2026-10-25:** pacote Floresta Uivante V2 auditado; Mago e arena identificados; Lobo V2 recebe recorte RGBA de teste tecnicamente validado, ainda sem aprovação visual final ou integração.
- **2026-10-25 — snapshot incremental:** responsável aprova visualmente o recorte; integração local da arena, Mago e Lobo Comum passa em 188/188 Node e 65/65 Chromium, sem commit, push ou deploy. Safari/iPhone permanece pendente.
- **2026-10-25 — QA isolado da Floresta V2:** comparação mobile aprovada para playtest; 188/188 Node e 65/65 Chromium reconfirmados; Direct Upload publica o deployment `3e8e9679-2441-46a6-a907-928166b5194e` no projeto separado `a-ultima-lua-floresta-v2-qa`. Arquivos essenciais conferidos por SHA-256; sem push, merge ou alteração da produção. Safari/iPhone permanece pendente.
- **2026-10-25 — validação física e autorização de QA:** o responsável confirma teste funcional e aprovação visual do Lobo Comum V2 no Safari de iPhone físico (`FLO-010`); a autorização do deploy no projeto isolado `a-ultima-lua-floresta-v2-qa` é registrada em `QLT-011`. Produção e linhas Git permanecem inalteradas.
- **2026-10-25 — reconciliação documental:** estado atual e snapshots históricos são separados; o bestiário da Floresta (oito entidades) e os hashes recalculados entram no Palácio; nenhuma decisão anterior é reescrita (`DOC-012`, `aprovado`). Documentos preparados no worktree documental, aguardando autorização para versionar.
- **2026-10-25 — Lobo Comum V2 versionado:** commits `4236b84` (portabilidade CRLF) e `16f4c9c` (arena e Lobo Comum) são publicados na branch `feature/floresta-uivante-v2-etapa1`; a integração deixa de ser local. Safari permanece registrado em `FLO-010`.
- **2026-10-25 — Lobo Cinzento V2 aprovado e integrado:** `FLO-014` registra a aprovação da arte e do recorte RGBA derivado da fonte fornecida; commit `83eb677` na branch feature, com 189/189 Node e 68/68 Chromium. Arte antiga preservada; sem produção.
- **2026-10-25 — QA isolado do Lobo Cinzento V2:** deployment `45362c1d-ca92-4c0b-b6d4-6b51c258fc9d` publicado no projeto `a-ultima-lua-floresta-v2-qa`; hashes conferidos, HTTP 200 e funcionamento confirmado no Safari/iPhone (`QLT-015`). Produção inalterada.
- **2026-10-26 — Lobisomem Jovem V2 aprovado e publicado:** `FLO-016` registra a nova arte, o recorte RGBA e a integração; commit `25ae3fb` publicado na branch feature; QA `860aa1d1-a3cf-4715-a89e-2a07d7e0126b` com 190/190 Node e 71/71 Chromium; Safari/iPhone confirmado. `FLO-007` permanece para Feroz e Alfa. Produção inalterada.

## Como interpretar

- Uma data de commit prova versionamento, não aprovação artística.
- Um relatório local prova o que ele mediu no snapshot indicado, não o estado de outra branch.
- Um deploy QA não é produção.
- Aprovação automática em Chromium não substitui playtest físico no Safari/iPhone.
