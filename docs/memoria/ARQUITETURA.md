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

O palco separa cenário, atores, HUD e efeitos. Retratos naturais usam contenção e ancoragem inferior; o motor de reações atua sobre a superfície do ator e restaura o estado após cancelamento. Trincheiras são a implementação visual mais completa. No commit-base `11bff6c`, a Floresta ainda não tinha apresentação V2; a branch feature recebeu o Lobo Comum em `16f4c9c` e o Lobo Cinzento em `83eb677`, e o QA isolado publicado é um nível distinto de evidência (ver `ESTADO_ATUAL.md` e `DEC-2026-10-25-QLT-011`).

### Floresta Uivante V2 — Lobo Comum e Lobo Cinzento

Na branch `feature/floresta-uivante-v2-etapa1`, baseada em `11bff6c`, o mapa da Floresta recebe `arenaBackground` próprio. O Lobo Comum (`16f4c9c`) e o Lobo Cinzento (`83eb677`) mantêm ID e atributos existentes, trocando somente nome apresentado quando aplicável, asset e layout visual. `COMBAT_PRESENTATION` posiciona ambos à direita; o Mago continua usando seu asset original à esquerda. O Lobo Comum foi validado no Safari físico (`FLO-010`); o Cinzento foi aprovado (`FLO-014`), publicado no QA isolado e confirmado no Safari/iPhone (`QLT-015`). Produção não foi alterada. O inventário e os estados de aprovação das oito entidades da Floresta estão em [BESTIARIO_FLORESTA_UIVANTE.md](BESTIARIO_FLORESTA_UIVANTE.md).

## QA

- Node: arquivos `tests/*.test.cjs`.
- Navegador: `tests/browser/`, Playwright 1.62.1 quando disponível.
- Build QA: `node _qa/build.cjs`, saída `_qa-dist` não versionada.
- Produção não deve carregar QA Debug.
- Artefatos, screenshots e relatórios não comprovam aprovação humana por si só.

## Publicação

GitHub Pages e Cloudflare Pages QA têm fluxos diferentes. `main` é sensível porque também foi configurada como branch de produção do projeto Cloudflare QA em auditorias antigas. Publicar apenas a branch/commit explicitamente autorizados e verificar SHA, build e HTTPS.
