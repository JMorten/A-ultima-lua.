# Palácio da Memória — A Última Lua

Este diretório é a referência de continuidade do projeto. Ele não substitui Git, código, testes ou aprovação humana; organiza evidências para que outra IA ou pessoa consiga retomar o trabalho sem transformar hipótese em decisão.

## Ordem de leitura

1. [ESTADO_ATUAL.md](ESTADO_ATUAL.md) — snapshot do checkout e trabalhos em andamento.
2. [DECISOES_APROVADAS.md](DECISOES_APROVADAS.md) — decisões com ID, estado e evidência.
3. Documento da área afetada: [ARQUITETURA.md](ARQUITETURA.md), [MANIFESTO_ARTES.json](MANIFESTO_ARTES.json) ou [PROXIMOS_PASSOS.md](PROXIMOS_PASSOS.md).
4. [HISTORICO_DESENVOLVIMENTO.md](HISTORICO_DESENVOLVIMENTO.md) — cronologia verificável.
5. [CHECKPOINT_TEMPLATE.md](CHECKPOINT_TEMPLATE.md) — modelo para encerrar trabalhos importantes.

## Áreas conceituais

| Área | Conteúdo |
|---|---|
| Biblioteca | História, narrativa, cenas e personagens. |
| Arsenal | Combate, habilidades, atributos e recompensas. |
| Galeria | Artes, identidade visual, proveniência e aprovação. |
| Cartografia | Territórios, encontros, desbloqueios e progressão. |
| Oficina | Arquitetura, persistência, QA, build e publicação. |
| Crônicas | Histórico de decisões, mudanças e divergências. |

As áreas são etiquetas documentais nesta V1. Não criam novas pastas nem mudam a arquitetura do jogo.

## Regra de confiabilidade

Prioridade de evidência: código e conteúdo no commit indicado; testes reproduzíveis; histórico Git; relatório associado ao mesmo snapshot; aprovação humana explicitamente registrada. Nome de arquivo, presença no repositório ou texto antigo não provam aprovação.

Cada registro relevante deve informar ID, data conhecida ou `não determinada`, descrição, justificativa, estado (`aprovado`, `proposto`, `rejeitado` ou `pendente`), evidência, arquivos afetados e relação com decisões anteriores. Conflitos permanecem visíveis até revisão humana.

## Atualização segura

- Conferir branch, HEAD, alterações locais e remotos antes de editar.
- Não reescrever fatos antigos para combinar com o estado atual; adicionar um novo snapshot.
- Distinguir implementação local, commit, push, deploy QA, validação automática e aprovação em iPhone/Safari.
- Atualizar o manifesto somente após recalcular hashes e metadados.
- Nunca marcar como concluído algo que dependa de validação ainda não executada.
