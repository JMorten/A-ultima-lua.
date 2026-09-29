# Persistência local — Fundação da Forja 1.0

## Schema e armazenamento

- Chave localStorage: a-ultima-lua.checkpoint.
- Schema explícito: 4.
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
Não se grava o personagem inteiro enquanto houver combate, monstro, bloqueio de ação, cena de Romar,
escolha final, resultado de Romar, evento normal pendente ou card interativo aberto.

A confirmação final dos cards persiste a ação completa. Vitórias, derrotas, armadilhas,
eventos, descobertas e escolhas de Romar são consolidados após sua interação terminar.
Equipar/desequipar, vender/comprar, consumir fora de combate, descansar, confirmar
atributos e escolher domínio solicitam checkpoint ao concluir, se o estado for seguro.

Recarregar antes da confirmação retorna à progressão do checkpoint anterior.
Durante combate, HP/MP e consumo de poções são persistidos após cada ação;
dano, cura e gastos não são desfeitos. XP, ouro, drops, chefes e demais resultados
aguardam CONTINUAR. Cura por level-up também aguarda a confirmação da vitória.
A exploração pode ser refeita; não há tentativa de retomar animações ou callbacks.
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

## Recursos de combate interrompido

persistCombatResources() grava o mesmo envelope atomicamente, sem restaurar o
combate ou copiar resultados parciais. Os hooks cobrem habilidades, consumíveis,
roubo de vida, ataques inimigos (incluindo callbacks e matilha) e Romar. Não depende
de unload/pagehide. HP/MP são limitados aos máximos do checkpoint. Na janela de
HP zero anterior à resolução da derrota, a recarga mantém zero, fora do combate,
sem registrar derrota nem conceder cura; as ações existentes de recuperação ficam
disponíveis. Romar conserva a recuperação não letal de 20% já aplicada pelo combate.
O schema 3 mantém o mesmo modelo de recursos; saves anteriores permanecem compatíveis.

## Lucas e Forja (schema 3)

A migração inicializa forgeProgress.lucas com version: 1, discovered, forgeUnlocked,
fragmentSeen e waitExplorations. É idempotente; descoberta confirma o desbloqueio.
ui.lucasScene é transitório: reload antes da confirmação final volta ao checkpoint
anterior, sem desbloquear parcialmente a oficina nem consumir o Fragmento.
Recusa confirma espera de três explorações aceitas do Pântano (cliques bloqueados
não contam); após as três, a próxima oportunidade livre reapresenta a cena.
Armadilhas e minibosses mantêm prioridade e seus sorteios originais. Lucas torna-se
elegível após três abates comuns, sem exigir o Devorador. Após descoberta, o acesso
à Forja é permanente no Pântano; reconhecimento posterior do Fragmento ocorre uma vez.
Arte futura: assets/images/npcs/lucas.jpg. Sem esse arquivo, a imagem fica oculta;
nenhuma arte substituta foi adicionada.

## Economia da oficina (schema 4)

materials é um mapa materialId → inteiro não negativo; knownRecipes é uma lista
de IDs únicos, independente do inventário. recipePity reserva contadores inteiros
por ID de receita, sem ativar pity. IDs desconhecidos válidos são preservados para
compatibilidade futura. Quantidades inválidas rejeitam o save sem sobrescrevê-lo.
Saves schema 3 migram sem modificar instâncias ou progresso.

MATERIAL_DEFS registra sucata_ferro, essencia_arcana, fragmento_refinado e reserva
lodo_viscoso / escamas_grande_mae. Não há novos drops. Fragmento de Ferro Rúnico
continua exclusivamente em questItems. RECIPE_DEFS permanece vazio. SALVAGE_PROFILES contém os três perfis aprovados.
A migração atribui somente o metadado salvageProfile, sem alterar valores do item.

Contrato de perfil: {version, yieldsByRarity: {raridade: {materialId: quantidade}}}.
A instância referencia {salvageProfile: {id, version}}. A prévia guarda uid, instância
completa e rendimento; confirmar revalida os três. Equipados, especiais, protegidos,
quest items, consumíveis, uid duplicado e perfil ausente/incompatível são recusados.
Uma gravação localStorage contém remoção e concessão juntas. Somente após sucesso
a memória é substituída; falha preserva o item. Requisição consumida, ausência do uid
e estado transitório da confirmação impedem reaplicação por toque duplo/reload.

Contrato futuro de receita (nenhuma cadastrada): version; ingredients com materialId
e quantity; resultSlot; requirements; fixedPropertiesByRarity; affixRules. Futuras
instâncias fabricadas terão origin: "craft", recipeId, recipeVersion e fixedProperties.
Não há função de fabricação nesta etapa.

### Perfis aprovados e auditoria do Mercador

physical: weapon/shield/helmet/armor/gloves/boots de Arqueiro, Guerreiro ou
Cavaleiro. arcane: os mesmos slots de Mago. hybrid: accessory/necklace/earring
e bracelet legado. Sem classe reconhecida nos slots de classe, ou sem slot
previsto, a instância permanece sem perfil e não é desmontável. Nomes não são
consultados. Perfis existentes não são sobrescritos; uniqueEffect protege o Alfa.

Comum/raro/épico/lendário físicos: 1/2/4/7 Sucatas; arcanos: 1/2/4/7 Essências.
Épicos acrescentam 1 Fragmento Refinado; lendários, 2. Híbridos: comum 1 Sucata;
raro 1 Sucata + 1 Essência; épico 2 + 2 + 1 Refinado; lendário 3 + 3 + 2 Refinados.
Nenhum sorteio é usado.

Mercador: Brinco e Colar custam 120 e revendem por 48; Anel custa 130 e revende
por 52. Todos são comuns/híbridos: desmontar dá apenas 1 Sucata, sem retorno de
moedas. Materiais não são vendáveis e não há fabricação/conversão para fechar
um ciclo de lucro. Não há rota comercial para Essência ou Refinado nesta etapa.
Preços e desbloqueio comercial permanecem inalterados; reauditar ao adicionar
receitas ou venda de materiais.
