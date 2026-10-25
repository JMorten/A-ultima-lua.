# Próximos passos

## Prioridade 1 — Floresta Uivante V2

1. Obter aprovação visual humana do recorte `lobo-comum-v2-recorte-teste.png` sobre fundo claro e arena.
2. Se aprovado, integrar em checkout isolado apenas a arena, Mago e Lobo Comum. Preservar Lobisomens e Alfa.
3. Confirmar enquadramento, HUD e comandos em 320, 375 e 390 px.
4. Executar Node e Chromium relevantes; registrar resultado como novo snapshot.
5. Publicar em QA somente com autorização e então realizar playtest físico no iPhone/Safari.

## Prioridade 2 — Resolver linhas Git

1. Decidir como reconciliar o commit local `081fce4` com `origin/qa-preview` em `11bff6c`; não sincronizar automaticamente.
2. Decidir se a candidata pós-playtest será incorporada ao release das Trincheiras ou mantida como candidata separada.
3. Atualizar `PROJECT-CHECKPOINT.md` apenas depois da decisão de release, preservando o histórico antigo.

## Prioridade 3 — Cobertura e documentação

- Executar WebKit/Safari quando disponível; não inferir compatibilidade a partir de Chromium.
- Criar checkpoints com o template após mudanças importantes.
- Expandir o manifesto quando uma nova arte entrar em avaliação; estado inicial deve ser `pendente` ou `não_verificado`.

## Decisões humanas pendentes

- Aprovação visual final do recorte do Lobo V2.
- Autorização da integração visual da Floresta V2.
- Estratégia de reconciliação de `qa-preview` local/remoto.
- Promoção de qualquer candidata à produção.
