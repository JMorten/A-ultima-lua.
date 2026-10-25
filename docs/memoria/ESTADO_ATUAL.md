# Estado atual

**Snapshot documental:** 2026-10-25.
**Checkout inspecionado:** `D:\Projetos\A-ultima-lua`.
**Branch ativa:** `qa-preview`, HEAD `081fce41b4535bd51d39e067d3207b5e7a449298`.

## Git e linhas de desenvolvimento

- `qa-preview` local está 1 commit à frente e 1 atrás de `origin/qa-preview`. O commit local exclusivo é `081fce4` (proteção de `laboratorios/`); o remoto aponta para a candidata pós-playtest `11bff6c`.
- `main` local está em `f7e25ef`, oito commits à frente de `origin/main` (`4833b5f`). Ele existe em checkout isolado e contém o protocolo autônomo integrado.
- `release/trincheiras-rc1` está em `e6a965e`.
- Existem worktrees isolados para documentação, candidata pós-playtest e integração de `main`.
- Não rastreados preservados no checkout ativo: `Imagem do ChatGPT 18 de out. de 2026, 12_30_18.jpg`, `lobo-comum-v2-aprovado.png` e `pacote-floresta-v2.zip`.
- Esta documentação não sincroniza nem resolve a divergência entre branches.

## Estado funcional comprovado

### Cartografia

- T1 — Floresta Uivante: implementada na base histórica; reformulação visual V2 em andamento.
- T2 — Pântano Podre: implementado, incluindo Senhor do Pântano, materiais e fluxo de vitória pendente documentados.
- T3 — Trincheiras Orc: progressão determinística, Xamã ritualístico, Gorthak e apresentação Arena V2.4 implementados na linha QA/release.
- T4 — Cripta Sangrenta: definida no código com inimigos, miniboss e boss. Não há evidência neste snapshot de uma revisão visual V2 equivalente às Trincheiras.
- T5: não existe no checkpoint auditado.

### Oficina

- Aplicação web estática: `index.html`, `styles/game.css`, `src/game.js` e `src/persistence.js`.
- Persistência em `localStorage`, chave `a-ultima-lua.checkpoint`, schema 5 no checkout ativo.
- Arena V2.4 usa cenário, atores, HUD e efeitos em camadas. Trincheiras têm cenário territorial próprio.
- QA Debug é produzido por `_qa/build.cjs` para `_qa-dist`; a produção normal não referencia o painel de debug.
- Testes Node e Playwright existem. Resultados de relatórios pertencem aos snapshots indicados e não equivalem a uma execução atual.

### Galeria — Floresta Uivante V2

- Mago original localizado em `assets/images/characters/combat/mago.png`.
- Arena aprovada está em `pacote-floresta-v2.zip`, membro `pacote-floresta-v2/arena-aprovada.jpeg`; não está confirmada como integrada ao jogo.
- Lobo Comum V2 tem aparência aprovada no contexto da tarefa, em `lobo-comum-v2-aprovado.png`.
- Recorte RGBA tecnicamente validado em `laboratorios/lobo-comum-v2-recorte-teste/`; a validação visual final permanece pendente.
- Lobisomem Jovem, Lobisomem Feroz e Alfa da Matilha atuais devem ser preservados. Não há autorização documentada para substituí-los.
- Integração da arena/lobo no jogo, batalha real e playtest no iPhone ainda estão pendentes.

## Snapshots de QA existentes

- Auditoria final das Trincheiras: 171/171 Node e 51/51 Chromium no snapshot de 2026-10-18; Safari não executado naquela auditoria.
- Candidata pós-playtest `11bff6c`: 185/185 Node e 61/61 Chromium no relatório de 2026-10-20; WebKit/Safari físico pendentes no relatório.
- O usuário posteriormente autorizou e recebeu publicação QA da candidata, mas o checkout ativo local diverge de `origin/qa-preview`. Verificar novamente antes de qualquer nova publicação.

## Divergências abertas

1. `PROJECT-CHECKPOINT.md` declara um estado de 2026-10-13 e `main`; não descreve toda a sequência visual, a candidata pós-playtest nem a divergência atual de `qa-preview`.
2. O checkpoint antigo afirma que não havia preview QA publicado; relatórios posteriores e o histórico remoto registram publicação QA. Manter o texto antigo como registro histórico.
3. Contagens 150, 162, 171 e 185 testes aparecem em relatórios diferentes. São snapshots de escopos e datas distintos, não um total único atual.
4. Laboratórios podem conter propostas ou resultados locais. Presença em `laboratorios/` não significa integração ou aprovação.
5. O relatório do recorte descreve validação técnica; a aprovação visual humana do Lobo V2 ainda não ocorreu.
