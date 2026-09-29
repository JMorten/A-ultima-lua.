# Persistência local — Fundação da Forja 1.0

## Schema e armazenamento

- Chave localStorage: a-ultima-lua.checkpoint.
- Schema explícito: 2.
- Envelope: { schemaVersion, player, itemSeq, world }.
- player conserva os dados permanentes completos e os valores exatos de cada item,
  incluindo uid, requisitos e afixos. Não recalcula equipamento ao carregar.
- world guarda forestEventCooldown e lastForestEventId.
- Campos reservados, sem mecânicas implementadas: materials (objeto),
  knownRecipes (lista), recipePity (objeto) e forgeProgress (objeto).
- O envelope de normalização de versão 0/1 migra para 2 de forma idempotente.
  Antes desta etapa o projeto não possuía save local em disco; não existe importação
  automática de personagens de páginas antigas ou de outros domínios.
- Versões desconhecidas, JSON inválido, personagem malformado e uid duplicado são
  rejeitados, sem apagar os bytes armazenados. A seleção de classe permanece disponível.

## Checkpoint seguro

requestCheckpoint() é o ponto central de gravação. Não é chamado por render().
Os hooks em persistence.js delimitam operações explícitas, com profundidade para
impedir que uma chamada interna grave metade de uma operação externa.

Antes de uma exploração ou combate iniciado em estado seguro, grava-se o personagem.
Não se grava enquanto houver combate, monstro, bloqueio de ação, cena de Romar,
escolha final, resultado de Romar, evento normal pendente ou card interativo aberto.

A confirmação final dos cards persiste a ação completa. Vitórias, derrotas, armadilhas,
eventos, descobertas e escolhas de Romar são consolidados após sua interação terminar.
Equipar/desequipar, vender/comprar, consumir fora de combate, descansar, confirmar
atributos e escolher domínio solicitam checkpoint ao concluir, se o estado for seguro.

Recarregar antes da confirmação retorna ao checkpoint anterior inteiro: recursos,
itens, HP/MP e progresso daquele encontro ainda não são consolidados. A exploração
pode ser refeita; não há tentativa de retomar animações ou callbacks.
Fugir conclui a batalha e pode consolidar os recursos gastos até a fuga.

A carga abre o mapa sem batalha/cenas/buffs/cooldowns de habilidades/atributos pendentes.
HP e MP vêm do checkpoint, sem cura gratuita. O identificador de itens recomeça acima
de todos os uid itN do inventário/equipamentos e do itemSeq salvo.

## Entrada e falhas de armazenamento

Com save válido, a tela oferece CONTINUAR e NOVO JOGO. Novo jogo pede confirmação e
seleção de classe; o save anterior só é substituído quando a nova classe é escolhida.
Cancelar preserva o save anterior. Falhas de escrita (por exemplo quota indisponível)
são tratadas, mostram aviso e não apagam o checkpoint anterior.

O armazenamento é local ao navegador/origem: não é sincronização entre dispositivos.
Limpar dados do site ou usar outra origem não transfere o personagem.

## Migração de slots (schema 2)

Braceletes equipados são movidos inteiros para o inventário; seus bônus deixam de
contribuir para os atributos, e HP/MP atuais são limitados aos novos máximos.
A chave equipment.bracelet é removida e equipment.legs recebe null quando ausente.
Repetir a normalização não move nem desconta o item novamente. Anéis permanecem
inalterados. Braceletes legados são vendáveis, mas não equipáveis. Novos sorteios e
o Mercador não oferecem Braceletes; Pernas é um slot vazio, sem conteúdo gerado.
