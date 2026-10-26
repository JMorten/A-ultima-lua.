---
description: Preparar release com preflight, build, tag e deploy
agent: release-manager
subagent: true
---
Prepare o release de $ARGUMENTS.

Siga a skill `release`:
1. Rode o preflight completo.
2. Confirme versão única (tag, código, tela, `/health`).
3. Gere build e calcule SHA-256.
4. Prepare changelog e tag.
5. Pare antes de push/deploy e peça aprovação com diff, testes, destino e rollback.

Nunca publique produção sem aprovação. Nunca declare publicado sem verificar em janela anônima.
