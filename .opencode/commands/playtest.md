---
description: Playtest estruturado de um dos três jogos
agent: qa-playtester
subagent: true
---
Faça um playtest de $ARGUMENTS.

Siga a skill `playtest`:
1. Leia a documentação de estado/playtest do jogo.
2. Confirme commit, branch, build/URL e versão exibida.
3. Rode os testes automatizados disponíveis.
4. Jogue o roteiro e capture screenshots, console, network e FPS.
5. Teste mobile/WebKit quando for jogo web.
6. Entregue o relatório com bugs por severidade.

Não altere código de jogo. Se encontrar um bug crítico, entregue um repro mínimo antes de propor correção.
