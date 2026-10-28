# Próximos passos

**Snapshot:** 2026-10-28 — preparação operacional do piloto.

## Concluído localmente

- Integração da Floresta Uivante V2 sobre a base `76ed84f`.
- Sistema genérico de reações de combate conciliado com o ritual do Orc Xamã.
- Correções de QA registradas em `9622f8e`.
- Regressão da Missão 22 aprovada: 196/196 Node, 83/83 Chromium e 83/83 WebKit.
- Backup integral e restauração verificável do piloto realizados na Missão 22.
- Documentação operacional incorporada seletivamente, sem merge da branch documental.

## Próxima etapa — exige autorização

1. Revisar o diff operacional e, se aprovado, criar um commit local exclusivo para documentação e configuração.
2. Substituir o remoto local pela URL GitHub `https://github.com/JMorten/A-ultima-lua..git`.
3. Consultar novamente as referências remotas antes de qualquer publicação.
4. Publicar `integration/floresta-uivante-v2` com upstream, sem force push.
5. Abrir PR para `main` e revisar separadamente; não fazer merge automático.
6. Somente após aprovação do PR, decidir sobre preview ou deploy. Publicação Git e deploy Cloudflare são autorizações distintas.

## Preservar

- Projeto original `D:\Projetos\A-ultima-lua` e seus oito worktrees.
- Backup da Missão 13 e backup do piloto da Missão 22.
- Os 56 arquivos não rastreados da Floresta no original e no backup.
- Relatórios históricos, ainda que mencionem caminhos ou contagens antigas.
- Assets-fonte e evidências que não fazem parte do repositório operacional.

## Fora de escopo nesta preparação

- Push, PR, merge em `main` ou deploy.
- Alterações em Cloudflare, Wrangler ou produção.
- Transferência automática de laboratórios, caches, builds antigos ou dados locais.
- Remoção ou desregistro de qualquer worktree antigo.
