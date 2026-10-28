# Estado atual

**Snapshot operacional:** 2026-10-28 — Missão 28.
**Checkout principal em preparação:** `D:\Projetos\01_JOGOS\A_Ultima_Lua`.
**Branch:** `integration/floresta-uivante-v2`.
**HEAD protegido antes das alterações operacionais:** `9622f8e667356634337d23cca90922c3c3c9c156`.
**Base de integração:** `76ed84f74125ab6f578055226b17041c923c6e6f` (`origin/main` no clone piloto), com sete commits adicionais no piloto.

Este arquivo descreve o checkout piloto atual. Os demais documentos deste diretório foram incorporados seletivamente da linha `docs/palacio-memoria-v1` como memória histórica e técnica. Quando houver conflito, este snapshot e o código no HEAD indicado prevalecem para o estado operacional; decisões históricas não devem ser reescritas.

## Segurança e Git

- O piloto é um repositório independente; não compartilha metadados Git com os oito worktrees antigos.
- O remoto `origin` aponta para `https://github.com/JMorten/A-ultima-lua..git` desde a Missão 24.
- A branch `integration/floresta-uivante-v2` foi publicada no GitHub na Missão 26, com upstream configurado para `origin/integration/floresta-uivante-v2`.
- A `main` permanece em `76ed84f74125ab6f578055226b17041c923c6e6f`; nenhum merge em `main` foi realizado.
- O commit operacional `6e1fd80` foi concluído na Missão 23B; as Missões 23, 24, 25, 26 e 27 foram concluídas.
- Push, pull, merge, rebase e deploy em `main` continuam sujeitos a autorização explícita.

## Conteúdo integrado

- A base `main` em `76ed84f` está incorporada integralmente.
- Os quatro commits da Floresta Uivante V2 até `25a3325` foram preservados por merge em `8f9d91c`.
- `ae350c5` integra o sistema genérico de reações de combate com a proteção ritual do Orc Xamã.
- `9622f8e` corrige os três casos de QA reproduzíveis em Chromium e WebKit.
- `6e1fd80` registra a memória operacional e a configuração do OpenCode; a branch foi publicada no GitHub com upstream configurado.
- Os assets ativos da Floresta, Alfa da Matilha, Romar e Lobo da Matilha estão versionados no piloto.
- Os 56 arquivos não rastreados do laboratório original não foram transferidos. Continuam preservados no worktree original e no backup da Missão 13.

## Evidência de qualidade vinculada ao HEAD

| Cobertura | Resultado preservado | Artefato |
|---|---:|---|
| Testes Node | 196/196 | `tests/browser/artifacts/mission22-preparation/node.log` |
| Chromium | 83/83 | `tests/browser/artifacts/mission20-full-approved/chromium.log` |
| WebKit | 83/83 | `tests/browser/artifacts/mission20-full-approved/webkit.log` |

Chromium e WebKit haviam sido aprovados imediatamente antes do commit `9622f8e` e foram repetidos na Missão 22 após as mudanças apenas documentais e operacionais. A suíte Node completa atual contém 196 testes; o conjunto de 138 testes da Missão 20 permanece como evidência histórica. Logs intermediários com falhas continuam preservados como diagnóstico e não substituem os resultados finais.

## Backup operacional

- Backup integral da Missão 22: `C:\Users\jeffe\Documents\Codex\backups\A-Ultima-Lua-Piloto-M22-2026-10-28`.
- O backup inclui `.git`, dependências locais ignoradas e evidências de QA.
- Origem, backup e restauração temporária foram comparados por caminho, tamanho e SHA-256.
- A restauração abriu no mesmo branch e HEAD, com árvore limpa e `git fsck --full --no-dangling` aprovado.

## OpenCode e operação local

- A configuração do projeto fica em `.opencode/opencode.jsonc`.
- Ferramentas compartilhadas devem apontar para o checkout novo, preservando relatórios históricos e o worktree CI.
- O runner Playwright gera uma cópia QA descartável em `%TEMP%` e não depende dos laboratórios antigos.
- O build QA usa `node _qa/build.cjs` e publica somente `_qa-dist`; isso não autoriza deploy.

## Pendências

1. Criar PR de `integration/floresta-uivante-v2` para `main` em etapa separada.
2. Revisar o PR antes de qualquer merge.
3. Validar Safari físico no iPhone.
4. Autorizar merge em `main` separadamente.
5. Avaliar deploy separadamente.
6. Preservar projeto original, backups e worktrees antigos.
