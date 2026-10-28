# Próximos passos

**Snapshot:** 2026-10-28 — Missão 28.

## Concluído localmente

- Integração da Floresta Uivante V2 sobre a base `76ed84f`.
- Sistema genérico de reações de combate conciliado com o ritual do Orc Xamã.
- Correções de QA registradas em `9622f8e`.
- Commit operacional da memória e da configuração do OpenCode concluído em `6e1fd80`.
- Remoto substituído pela URL GitHub `https://github.com/JMorten/A-ultima-lua..git`.
- Branch `integration/floresta-uivante-v2` publicada no GitHub, com upstream configurado para `origin/integration/floresta-uivante-v2`.
- Auditoria remota e auditoria final da integração concluídas nas Missões 25 e 27.
- Regressão da Missão 22 aprovada: 196/196 Node, 83/83 Chromium e 83/83 WebKit.
- Backup integral e restauração verificável do piloto realizados na Missão 22.
- Documentação operacional incorporada seletivamente, sem merge da branch documental.

## Próxima etapa — exige autorização

1. Criar PR de `integration/floresta-uivante-v2` para `main`.
2. Revisar o PR antes de qualquer merge.
3. Validar Safari físico no iPhone.
4. Autorizar merge em `main` separadamente.
5. Avaliar deploy separadamente.
6. Preservar backups e worktrees antigos.

A `main` permanece em `76ed84f74125ab6f578055226b17041c923c6e6f`. Publicação Git e deploy Cloudflare são autorizações distintas.

## Preservar

- Projeto original `D:\Projetos\A-ultima-lua` e seus oito worktrees.
- Backup da Missão 13 e backup do piloto da Missão 22.
- Os 56 arquivos não rastreados da Floresta no original e no backup.
- Relatórios históricos, ainda que mencionem caminhos ou contagens antigas.
- Assets-fonte e evidências que não fazem parte do repositório operacional.

## Fora de escopo nesta preparação

- PR, merge em `main` ou deploy (push da branch de integração concluído na Missão 26).
- Alterações em Cloudflare, Wrangler ou produção.
- Transferência automática de laboratórios, caches, builds antigos ou dados locais.
- Remoção ou desregistro de qualquer worktree antigo.
