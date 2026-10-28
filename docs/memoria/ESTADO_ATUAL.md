# Estado atual

**Snapshot operacional:** 2026-10-28 — Missão 22.
**Checkout principal em preparação:** `D:\Projetos\01_JOGOS\A_Ultima_Lua`.
**Branch:** `integration/floresta-uivante-v2`.
**HEAD protegido antes das alterações operacionais:** `9622f8e667356634337d23cca90922c3c3c9c156`.
**Base de integração:** `76ed84f74125ab6f578055226b17041c923c6e6f` (`origin/main` no clone piloto), com sete commits adicionais no piloto.

Este arquivo descreve o checkout piloto atual. Os demais documentos deste diretório foram incorporados seletivamente da linha `docs/palacio-memoria-v1` como memória histórica e técnica. Quando houver conflito, este snapshot e o código no HEAD indicado prevalecem para o estado operacional; decisões históricas não devem ser reescritas.

## Segurança e Git

- O piloto é um repositório independente; não compartilha metadados Git com os oito worktrees antigos.
- O remoto `origin` ainda aponta para `D:\Projetos\A-ultima-lua` e não deve ser usado para publicação.
- A URL GitHub verificada é `https://github.com/JMorten/A-ultima-lua..git`; ela ainda não foi configurada no piloto.
- A branch `integration/floresta-uivante-v2` ainda não existe no GitHub e não possui upstream.
- Nenhum push, pull, merge, rebase, deploy ou alteração de remoto foi realizado durante a preparação operacional.

## Conteúdo integrado

- A base `main` em `76ed84f` está incorporada integralmente.
- Os quatro commits da Floresta Uivante V2 até `25a3325` foram preservados por merge em `8f9d91c`.
- `ae350c5` integra o sistema genérico de reações de combate com a proteção ritual do Orc Xamã.
- `9622f8e` corrige os três casos de QA reproduzíveis em Chromium e WebKit.
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

1. Revisar e registrar as alterações operacionais desta missão em commit local separado, se autorizado.
2. Alterar o remoto somente em missão posterior autorizada.
3. Publicar a branch de integração somente após nova autorização e verificação remota.
4. Abrir PR e avaliar integração em `main` em etapa separada.
5. Não remover o projeto original nem os worktrees enquanto a recuperação remota não estiver confirmada.
