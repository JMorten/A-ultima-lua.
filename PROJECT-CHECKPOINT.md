# A ÚLTIMA LUA — PROJECT CHECKPOINT

Última atualização: 05/10/2026

## FINALIDADE

Este documento registra o ponto atual de continuidade do projeto.

Ele deve permitir reconstruir o estado do desenvolvimento mesmo se o
histórico do ChatGPT ou Codex for perdido ou dessincronizado.

Nunca alterar código apenas para fazê-lo coincidir com este documento.

Quando houver divergência, comparar o checkpoint com Git, código e testes
e apresentar a divergência antes de qualquer modificação.

---

## ESTADO GIT

Branch:
main

Último commit versionado confirmado:

4833b5f69fd14fe72c68919b84ed500704677898
Build Gorthak boss encounter

Working tree conhecido:

Modificados:
- src/game.js
- tests/persistence.test.cjs

Não rastreados:
- .wrangler/
- _qa-dist.zip

Nada staged na última inspeção.

As alterações locais existentes são importantes e NÃO devem ser
descartadas.

---

## ESTADO ATUAL

Implementados:

- Arena V2.4
- Orc Batedor / Alerta de Guerra
- Orc Xamã como miniboss
- ritual do Xamã com dois Totens
- Warlord Gorthak V1 com três fases
- progressão determinística das Trincheiras existente localmente
- sistemas anteriores da Floresta Uivante
- Pântano Podre
- Romar
- Lucas
- Forja

Territórios existentes:

T1 — Floresta Uivante
T2 — Pântano Podre
T3 — Trincheiras Orc
T4 — Cripta Sangrenta

Não existe T5 implementado neste checkpoint.

---

## TRINCHEIRAS ORC

Inimigos comuns:

- Orc Batedor
- Orc Guerreiro
- Orc Capitão
- Açougueiro da Trincheira

Miniboss:

- Orc Xamã

Boss:

- Warlord Gorthak

A organização antiga em que Xamã era comum e Açougueiro era miniboss
não representa mais o estado atual.

---

## PROGRESSÃO T3 — LOCAL / NÃO COMMITADA

O working tree contém:

7 vitórias contra os quatro Orcs comuns válidos
→ desafio direto ao Orc Xamã
→ vitória contra Xamã
→ Gorthak desbloqueado.

Após cada vitória contra Xamã:

7 novas vitórias comuns
→ Xamã disponível novamente.

Também está implementado:

- botão de desafio direto ao Xamã;
- verificação do requisito;
- Xamã excluído do sorteio aleatório de exploração;
- UI "Patrulhas rompidas: X/7";
- Gorthak anteriormente derrotado permanece liberado;
- compatibilidade não inventa vitória contra Xamã.

Essas alterações existem localmente e NÃO pertencem ao commit 4833b5f.

Não descartar esse trabalho.

A implementação técnica está confirmada.

Devido à perda parcial do histórico de conversa, não presumir uma
aprovação final de game design além do que estiver documentado.

---

## ORC XAMÃ

Base:

HP 360
ATQ 48
DEF 20
XP 240
Moedas 75–105

Começa em transe e não pode ser atacado diretamente.

Totem de Sangue:
150 HP
10 DEF

Totem da Essência:
150 HP
10 DEF

Ritual:

Atacar o Totem da Essência enquanto o Totem de Sangue existe:
→ Retaliação do Sangue
→ 20% do dano efetivamente removido retorna ao jogador.

Atacar o Totem de Sangue enquanto o Totem da Essência existe:
→ 20% do dano efetivamente removido é armazenado como energia no Xamã.

Overkill não aumenta esses efeitos.

Quando ambos são destruídos:

- ritual termina;
- energia armazenada é aplicada;
- Xamã desperta;
- arte muda;
- combate direto começa.

O despertar não concede ataque gratuito.

Totens não fornecem XP, moedas ou drops próprios.

---

## GORTHAK V1

Implementado e versionado no HEAD atual.

Base:

HP 740
ATQ 72
DEF 30
XP 300
Moedas 150–220

Fase 1 — Comandante:

2 ataques normais
→ preparação
→ Golpe Demolidor ×1,8

Fase 2 — Fúria de Guerra em HP <= 65%:

normal
→ Golpe Pesado ×1,25
→ preparação
→ Golpe Demolidor ×1,8

Fase 3 — Último Avanço em HP <= 30%:

ATQ efetivo +25%
DEF efetiva -30%

A entrada na fase final cancela Demolidor pendente e abandona os
ciclos anteriores.

Primeira tentativa de fuga na fase final:

SEM ESCAPATÓRIA

Não consome ação, HP ou MP.
Depois disso, fuga fica desabilitada.

Não considerar Golpe Demolidor interruptível sem implementação
específica.

---

## ARENA V2.4

A arquitetura atual suporta:

- background compartilhado;
- atores independentes;
- artwork separado;
- efeitos separados;
- HUD separado;
- atores adicionais;
- Totens;
- fases;
- preparações;
- apresentação responsiva/mobile-first.

Trincheiras possuem background territorial próprio.

A migração visual dos demais territórios e combatentes ainda é parcial.

---

## PERSISTÊNCIA

Schema:
5

localStorage:
a-ultima-lua.checkpoint

O save é local por navegador/origem.

Não existe sincronização automática de save entre dispositivos.

Vitória pendente possui persistência para impedir reroll e duplicação de
recompensas.

Combate ativo não é retomado após reload.

---

## BUG CONHECIDO — RETALIAÇÃO DO SANGUE

STATUS:
CONFIRMADO / NÃO CORRIGIDO

Reprodução mais recente:

HP inicial:
100

Ataque básico causa:
40 de dano efetivo ao Totem da Essência

Retaliação:
8 HP

HP em memória:
92

HP no checkpoint:
100

Após reload simulado:
100

Causa identificada:

playerAttack()
→ resolveShamanRitualHit()

Esse caminho contorna o hook combatResourceAction utilizado pelo fluxo
normal de resolvePlayerHit().

A perda de HP acontece em memória, mas não é imediatamente persistida.

usarSkill() possui hook próprio.

Portanto, não generalizar esse bug para skills sem evidência adicional.

O bug ainda NÃO possui correção nem teste de regressão específico.

---

## TESTES

Última execução registrada:

145/145 testes passando.

Essa é a referência verde mais recente conhecida.

A última inspeção não executou novamente a suíte completa.

A reprodução do bug da Retaliação foi feita separadamente e não integra
a suíte atual.

Após corrigir esse bug:

- criar teste de regressão;
- executar novamente a suíte completa.

---

## FORJA

Implementados:

- Lucas
- oficina
- materiais
- desmontagem
- conhecimento permanente de receitas

Ainda não implementados:

- crafting efetivo
- fabricação do Anel da Grande Mãe Lua
- propriedades finais do Anel
- sistema final de raridade de crafting

Não transformar referências futuras de crafting em decisões finais sem
aprovação.

---

## PONTOS DE ATENÇÃO

- Não perder as alterações locais da progressão T3.
- Não usar _qa-dist.zip como build atual sem nova validação.
- Testes automatizados não substituem playtest real no iPhone/Safari.
- Save localStorage não sincroniza automaticamente entre dispositivos.
- Parte do histórico recente do ChatGPT foi perdida/dessincronizada.
- Decisões existentes somente na conversa perdida não devem ser
  reconstruídas por suposição.

---

## PONTO DE RETOMADA

Estado técnico:

4833b5f
+ progressão T3 local
+ última referência 145/145 testes
+ bug conhecido da Retaliação do Sangue.

Ordem de trabalho já combinada:

1. Preservar o working tree.
2. Criar e proteger este checkpoint.
3. Decidir/consolidar a progressão T3.
4. Corrigir persistência da Retaliação do Sangue.
5. Criar teste de regressão.
6. Executar suíte completa.
7. Realizar playtest real no iPhone/Safari.
8. Fechar tecnicamente o ciclo das Trincheiras.
9. Somente depois escolher a próxima etapa de game design.

---

## REGRA PARA FUTURAS SESSÕES

Ao retomar o projeto:

1. Ler PROJECT-CHECKPOINT.md.
2. Executar git status.
3. Identificar HEAD.
4. Comparar alterações posteriores ao checkpoint.
5. Ler commits posteriores.
6. Executar testes quando apropriado.
7. Relatar divergências antes de modificar qualquer arquivo.

Nunca apagar trabalho local para fazer o repositório coincidir com este
checkpoint.

---

## MANUTENÇÃO DO CHECKPOINT

Atualizar este documento após etapas relevantes quando houver:

- novo commit;
- feature concluída;
- decisão de design aprovada;
- playtest;
- bug encontrado ou corrigido;


- alteração importante ainda não commitada;
- mudança na referência de testes;
- mudança no próximo passo.

Não registrar brainstorming como decisão aprovada.
Não reescrever silenciosamente decisões antigas.
Quando uma decisão mudar, preservar a mudança de direção de forma clara.

FIM DO CHECKPOINT.
