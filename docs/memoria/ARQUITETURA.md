# Arquitetura

## Visão geral

A Última Lua é uma aplicação web estática, sem framework de runtime. `index.html` carrega `styles/game.css` e, nesta ordem, `src/combat-animator.js`, `src/gorthak-visual.js`, `src/game.js` e `src/persistence.js`.

## Componentes

| Área | Responsabilidade | Fontes principais |
|---|---|---|
| Biblioteca | Classes, narrativa, eventos, Romar e Lucas. | `src/game.js`, assets de eventos/NPCs |
| Arsenal | Atributos, combate, habilidades, drops, Xamã e Gorthak. | `src/game.js`, `src/combat-animator.js`, `src/gorthak-visual.js` |
| Galeria | Cenários, retratos, atores e CSS da Arena V2.4. | `assets/images/`, `styles/game.css` |
| Cartografia | `MAPS`, desbloqueios, exploração e progressão territorial. | `src/game.js` |
| Oficina | Persistência, Forja, QA e build de preview. | `src/persistence.js`, `_qa/`, `tests/` |
| Crônicas | Checkpoints, relatórios e este Palácio da Memória. | `PROJECT-CHECKPOINT.md`, `laboratorios/`, `docs/memoria/` |

## Estado e persistência

- Chave: `a-ultima-lua.checkpoint`.
- Schema do checkout ativo: 5.
- `requestCheckpoint()` centraliza gravações seguras; resultados pendentes evitam duplicação de recompensas.
- Saves pertencem à origem do navegador. QA usa contexto e origem descartáveis.
- A candidata pós-playtest adiciona reconciliação de atributos e backup auxiliar; consultar seu relatório antes de portar para outra branch.

## Arena V2.4

O palco separa cenário, atores, HUD e efeitos. Retratos naturais usam contenção e ancoragem inferior; o motor de reações atua sobre a superfície do ator e restaura o estado após cancelamento. Trincheiras são a implementação visual mais completa. No commit-base `11bff6c`, a Floresta ainda não tinha apresentação V2; a branch feature recebeu o Lobo Comum em `16f4c9c`, o Lobo Cinzento em `83eb677`, o Lobisomem Jovem em `25ae3fb`, o Uivante das Sombras em `bb7197a`, o Romar em `cbc50b6` e o Lobo da Matilha em `a841181`, e o QA isolado publicado é um nível distinto de evidência (ver `ESTADO_ATUAL.md` e `DEC-2026-10-25-QLT-011`).

### Floresta Uivante V2 — Lobo Comum, Lobo Cinzento, Lobisomem Jovem, Uivante das Sombras, Romar e Lobo da Matilha

Na branch `feature/floresta-uivante-v2-etapa1`, baseada em `11bff6c`, o mapa da Floresta recebe `arenaBackground` próprio. Lobo Comum (`16f4c9c`), Lobo Cinzento (`83eb677`), Lobisomem Jovem (`25ae3fb`) e o mini-chefe Uivante das Sombras (`bb7197a`) mantêm ID e atributos existentes, trocando somente nome apresentado quando aplicável, asset e layout visual. `COMBAT_PRESENTATION` posiciona os quatro à direita; o Mago continua usando seu asset original à esquerda. O Uivante usa caixa própria (`w:0.58`, `h:0.95`), maior que a dos comuns, para preservar a hierarquia de mini-chefe em telas estreitas; a verificação de sobreposição com o Mago passou a medir silhuetas pintadas (alfa), admitindo até 4% da largura do palco para a fumaça do mini-chefe. O Romar usa render próprio (`.romar-avatar`), três retratos PNG por estágio de HP, `contain` ancorado na base e o mesmo esquema de caixa própria (`w:0.46`, `h:0.78`); o emoji de fallback só aparece quando a imagem falha. Reação de impacto: como `resolveRomarAction()` re-renderiza a arena na mesma ação, `shakeSide()` reaplica o `shake` no retrato novo via `requestAnimationFrame`, para o golpe não ser engolido pelo redesenho.

O **Lobo da Matilha** (`a841181`, placa sem nome em `49f8ed2`) é um caso diferente: não é criatura de `MAPS`, não tem ID de inimigo e não possui estado próprio. `COMBAT_PRESENTATION.summons.packWolf` (`x:0.56`, `w:0.31`) e `renderPackWolfActor()` desenham um **segundo ator** no palco somente quando o Alfa está na fase 0, `packWolfActive` é verdadeiro e `packWolfHp > 0`. O ator lê HP de `packWolfHp`/`packWolfHpMax`, usa `aspect-ratio:1000/758` para que a placa (barra + HP, sem nome sobreposto) acompanhe o topo da arte em qualquer altura de palco e fica em `z-index:4`, à frente do Alfa. O dano flutuante usa `combatEffectId('packWolf')` e o ataque ao lobo sacode o próprio ator (`shakeSide('packWolf')`, com `portrait-pack-wolf` mapeado em `combatPortraitId`), reaplicado após o `render()` da rodada. A entrada animada é controlada por uma variável de apresentação (`packWolfPaint`), para não repetir a cada `render()`; `prefers-reduced-motion` a desliga. Nenhum atributo, dano, esquiva, intervalo de invocação ou regra do Alfa foi alterado.
- **Alfa da Matilha** (`c66f6e1`): agora usa arte V2 (`alfa_matilha_combat_v2.png`, 1024×1536 RGBA, retrato natural, caixa `w:0.50`/`h:0.86`/`x:0.68`) e reage ao golpe com `shake` + flash `alfa-hit-flash`, reaplicados via `requestAnimationFrame`. Stats, três fases, Caçada Coordenada e drop permanecem inalterados; JPEG legado preservado.

Lobo Comum, Lobo Cinzento e Lobisomem Jovem foram validados no Safari físico (`FLO-010`, `QLT-015`, `FLO-016`); o Uivante foi aprovado (`FLO-017`), publicado no QA isolado e validado no Safari/iPhone (`QLT-018`); Romar e Lobo da Matilha foram aprovados (`FLO-018`, `FLO-019`) e publicados no QA isolado, validados no Safari/iPhone e promovidos à produção em `30df194c` (build `9544043`). O `main` foi sincronizado em `76ed84f` (merge da feature) e o push disparou o deploy automático do Pages. O inventário e os estados de aprovação das oito entidades da Floresta estão em [BESTIARIO_FLORESTA_UIVANTE.md](BESTIARIO_FLORESTA_UIVANTE.md).

## QA

- Node: arquivos `tests/*.test.cjs`.
- Navegador: `tests/browser/`, Playwright 1.62.1 quando disponível.
- Build QA: `node _qa/build.cjs`, saída `_qa-dist` não versionada.
- Produção não deve carregar QA Debug.
- Artefatos, screenshots e relatórios não comprovam aprovação humana por si só.

## Publicação

GitHub Pages e Cloudflare Pages QA têm fluxos diferentes. `main` é sensível porque também foi configurada como branch de produção do projeto Cloudflare QA em auditorias antigas. Publicar apenas a branch/commit explicitamente autorizados e verificar SHA, build e HTTPS.
