# A ÚLTIMA LUA — PROJECT CHECKPOINT

Última atualização: 13/10/2026

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

Último commit versionado confirmado antes da atualização documental:

7582299fc91af188683f4f80e862102d6e867af5
Add Playwright Gorthak boss QA V3

Histórico recente (ordem cronológica):

- 4833b5f69fd14fe72c68919b84ed500704677898 — Build Gorthak boss encounter
- 6619bc72bbe947f63da8487dbeea449bbf30ec8c — Add project recovery checkpoint
- 7c8784ab0ad3139b2d5a0620d1711314e695b8de — Build deterministic Trenches progression
- 3e1b884031f9d94641ba866e2e63bd86d4206992 — Fix Shaman ritual retaliation persistence
- 1079f50985cdaed59cb20c5d730e281231f8addb — Add isolated Playwright browser QA V1
- 84bad8626fd81a4990da6ba3a005943964ccced4 — Add Playwright Shaman ritual QA V2
- 7582299fc91af188683f4f80e862102d6e867af5 — Add Playwright Gorthak boss QA V3

Working tree conhecido:

Após o commit da Playwright QA V3, os demais arquivos rastreados estavam limpos.
Esta atualização documental é o único arquivo staged para consolidação.

Não rastreados:
- .wrangler/
- _qa-dist.zip

Antes deste commit documental, somente PROJECT-CHECKPOINT.md estava staged; não havia alterações rastreadas unstaged.

A referência remota foi consultada diretamente: origin/main = 4833b5f69fd14fe72c68919b84ed500704677898. A branch main local contém seis commits posteriores a essa referência (listados acima), além deste commit do checkpoint. Nenhum push ou deploy foi realizado.

---

## ESTADO ATUAL

Implementados:

- Arena V2.4
- Orc Batedor / Alerta de Guerra
- Orc Xamã como miniboss
- ritual do Xamã com dois Totens
- Warlord Gorthak V1 com três fases
- progressão determinística das Trincheiras implementada e commitada
- Playwright QA V1, V2 e V3 versionadas em tests/browser/
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

## PROGRESSÃO T3 — IMPLEMENTADA E COMMITADA

A implementação versionada contém:

7 vitórias contra os quatro Orcs comuns válidos
→ desafio direto ao Orc Xamã
→ vitória contra Xamã
→ Gorthak desbloqueado permanentemente.

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

Na criação deste checkpoint, essas alterações eram locais e não pertenciam
ao commit 4833b5f. Após revisão aprovada, foram versionadas em:

7c8784ab0ad3139b2d5a0620d1711314e695b8de
Build deterministic Trenches progression

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

## BUG CORRIGIDO — RETALIAÇÃO DO SANGUE

STATUS:
CORRIGIDO / COMMITADO / VALIDADO AUTOMATICAMENTE
Validação humana da correção no iPhone/Safari ainda pendente.

Reprodução histórica antes da correção:

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

Esse caminho contornava o hook combatResourceAction utilizado pelo fluxo
normal de resolvePlayerHit().

A perda de HP acontecia em memória, mas não era imediatamente persistida.

usarSkill() possui hook próprio.

Portanto, não generalizar esse bug para skills sem evidência adicional.

Correção versionada em:
3e1b884031f9d94641ba866e2e63bd86d4206992
Fix Shaman ritual retaliation persistence

Wrapper condicional de playerAttack() na camada de persistência, aplicando
combatResourceAction somente ao ataque básico válido durante o ritual.
A condição é capturada antes do ataque, preservando inclusive a persistência
quando o segundo Totem é destruído nessa ação.

A correção:
- não altera src/game.js;
- não altera Schema 5;
- não altera regras de combate;
- não adiciona persistência aos Totens, Retaliação ou timers;
- não duplica persistência de skills;
- não adiciona hook redundante ao ataque básico normal.

Regressão automatizada confirmada: HP em memória e checkpoint ficam em 92
após a ação; reload mantém 92 e não retoma o combate ou ritual.

---

## TESTES

Última execução registrada:

150/150 testes aprovados.

Essa é a referência verde mais recente conhecida.

Referência anterior: 145/145 testes passando antes da correção.

A reprodução histórica foi inicialmente feita separadamente da suíte.
Com a correção, foram adicionados cinco testes cobrindo:

- Retaliação e persistência imediata;
- ataque bloqueado;
- isolamento de skill e ataque normal;
- destruição do segundo Totem;
- Retaliação letal e vitória pendente/idempotência.

A suíte completa passou após a correção. A revisão final e esta atualização
documental não executaram novamente a suíte.

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

## QA DE NAVEGADOR E PUBLICAÇÃO (13/10/2026)

QA Debug é acrescentado somente pelo gerador _qa/build.cjs ao artefato _qa-dist. O HTML de produção não referencia o painel. O _config.yml do Jekyll exclui _qa, _qa-dist e os testes QA; não adicionar .nojekyll nem publicar a raiz bruta.

A configuração Cloudflare Pages consultada em modo somente leitura identifica o projeto a-ultima-lua-qa, conectado ao repositório JMorten/A-ultima-lua., branch de produção main, previews habilitados para todas as branches, raiz vazia, comando node _qa/build.cjs e saída _qa-dist. O projeto Cloudflare é separado do destino GitHub Pages do jogo, embora a implantação de main seja o ambiente production dentro desse projeto QA. O deployment mais recente consultado é de 04/10/2026, commit 4833b5f, e não há deployments preview registrados. A URL do projeto é https://a-ultima-lua-qa.pages.dev.

Nesta auditoria, node --test tests/*.test.cjs passou 150/150. O runner Playwright não foi validado: a primeira execução encontrou bloqueio de permissão ao escrever em artifacts existente; cópias temporárias isoladas encontraram a porta 4179 ocupada, e a tentativa com porta alternativa permaneceu sem resultado e foi interrompida. WebKit não está instalado. O runner existente compila as entradas em diretório temporário, mas grava os resultados no diretório de artefatos do checkout que o executa; a próxima tentativa deve ocorrer numa cópia descartável e com porta livre.

O próximo deploy seguro requer uma branch Git não-prod separada: main é a branch de produção do projeto Cloudflare QA. Não existe branch QA local ou remota nesta auditoria. O _config.yml exclui os artefatos QA do build Jekyll; as configurações remotas atuais do GitHub Pages não foram confirmadas nesta auditoria. Criar/enviar a branch depende de autorização separada; nenhum push, deploy ou alteração de configuração foi feito.

---

## PONTOS DE ATENÇÃO

- Preservar os commits da progressão T3 e da correção da Retaliação.
- Não usar _qa-dist.zip como build atual sem nova validação.
- Testes automatizados não substituem playtest real no iPhone/Safari.
- Save localStorage não sincroniza automaticamente entre dispositivos.
- Parte do histórico recente do ChatGPT foi perdida/dessincronizada.
- Decisões existentes somente na conversa perdida não devem ser
  reconstruídas por suposição.

---

## PONTO DE RETOMADA

Estado técnico antes da consolidação documental:

7582299
+ seis commits locais posteriores a origin/main (4833b5f)
+ QA Playwright V1–V3 versionada
+ suíte Node: 150/150 nesta auditoria
+ execução Playwright pendente por restrições de artefatos/porta; WebKit ausente
+ configuração Cloudflare QA identificada, sem deploy preview atual.

Etapas concluídas desde o checkpoint original:

- Working tree preservado e checkpoint criado/versionado.
- Progressão T3 revisada, aprovada e commitada.
- Persistência da Retaliação corrigida, revisada e commitada.
- Testes de regressão adicionados e suíte completa aprovada.

Próximo passo: após autorização expressa, criar e enviar uma branch não-prod para preview QA no Cloudflare. Manter pendente a validação real das Trincheiras no iPhone/Safari.

Objetivos do playtest:
- progressão 0/7 → Xamã;
- botão de desafio;
- ritual e Totens;
- Retaliação;
- despertar do Xamã;
- desbloqueio de Gorthak;
- fases de Gorthak;
- recorrência do Xamã;
- comportamento de reload/checkpoint;
- Arena V2.4 e layout mobile.

As Trincheiras ainda NÃO estão completamente encerradas: falta validação
humana em dispositivo real. Após essa validação, fechar tecnicamente o
ciclo e somente depois escolher a próxima etapa de game design.

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
