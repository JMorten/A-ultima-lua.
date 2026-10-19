# Regras obrigatórias — A Última Lua

- Não tomar decisões de game design sem a aprovação do responsável pelo projeto.
- Preservar o comportamento da VS 1.18 durante futuras refatorações.
- Não adicionar sistema de Vigor/Stamina.
- Priorizar compatibilidade mobile, especialmente iPhone/Safari.
- Eventos interativos, armadilhas e resultados de combate não devem desaparecer automaticamente quando exigirem interação do jogador.
- Resultados de combate devem exigir CONTINUAR.
- Não substituir dificuldade por simples inflação exagerada de HP/ATQ.
- Builds devem ter vantagens e trade-offs reais.
- Evitar equipamentos que sejam apenas versões com números maiores.
- Antes de mudanças grandes, identificar os sistemas afetados.
- Validar a sintaxe JavaScript após alterações.
- Fazer mudanças pequenas, rastreáveis e manter a branch `main` jogável.
- Não alterar mecânicas, balanceamento, atributos, itens ou progressão sem aprovação do responsável pelo projeto.

## Protocolo de desenvolvimento autônomo V1

Este protocolo orienta um único agente. Não configurar nem delegar tarefas a múltiplos agentes nesta versão. As regras anteriores permanecem obrigatórias; a autonomia técnica abaixo não autoriza decisões de game design nem publicação.

### 1. Inspeção e plano de trabalho

- Confirmar o caminho real do repositório, branch, HEAD, worktrees, arquivos staged, alterações locais e arquivos não rastreados antes de editar. Não presumir estado a partir de uma conversa ou relatório antigo.
- Ler este AGENTS.md, PROJECT-CHECKPOINT.md e somente a documentação e o código pertinentes. Se o checkpoint estiver desatualizado, registrar a divergência; não alterar o jogo para fazê-lo coincidir com o documento.
- Mapear o fluxo afetado, seus consumidores, dependências, persistência, apresentação e testes antes de modificar código. Investigar a causa com evidências, sem presumir diagnóstico.
- Para tarefas bem especificadas, elaborar internamente um plano curto com escopo, arquivos previstos, critérios de aceitação, testes e riscos. Prosseguir com escolhas técnicas rotineiras sem solicitar aprovação a cada etapa.
- Solicitar decisão quando faltar uma informação indispensável ou surgir mudança de escopo, design, dados ou destino de publicação. Não repetir pedidos cuja autorização continue válida para a mesma ação e contexto.

### 2. Implementação e correção técnica

- Fazer a menor alteração coerente com o objetivo aprovado. Reutilizar os mecanismos existentes e evitar refatorações, dependências, ferramentas ou funcionalidades não necessárias à missão.
- Corrigir autonomamente falhas técnicas reproduzíveis dentro do escopo autorizado. Não transformar uma correção em mudança de atributos, habilidades, IA, fórmulas, RNG, recompensas, progressão, persistência ou direção artística sem aprovação específica.
- Não remover recursos, enfraquecer testes, forçar resultados ou alterar expectativas apenas para obter uma execução verde. Registrar separadamente defeitos do jogo, limitações da automação e problemas do ambiente.
- Para a mesma falha, tentar no máximo duas abordagens fundamentadas. Cada abordagem deve ter hipótese baseada em evidência, intervenção ou experimento definido e resultado observado. Vários comandos do mesmo experimento não são novas abordagens.
- Se ambas falharem, interromper as tentativas dessa falha e apresentar reprodução, evidências, hipóteses descartadas, estado preservado e decisão ou recurso necessário. Não repetir tentativas equivalentes; continuar somente trabalho independente e seguro que não dependa da falha.

### 3. Proteção do projeto e autorizações

- Não decidir autonomamente game design, balanceamento ou progressão. Preservar as regras aprovadas, inclusive resultados que exigem CONTINUAR e a ausência de Vigor/Stamina.
- Preservar alterações locais, inclusive staged, arquivos não rastreados, laboratórios e backups. Não usar descarte, limpeza, reset destrutivo, stash abrangente ou sobrescrita para obter uma árvore limpa.
- Para uma missão que exija isolamento, usar branch e checkout próprios, confirmando a base. Não trocar a branch do checkout do usuário nem alterar main, qa-preview ou branches de release sem autorização para o destino e a operação.
- Não reescrever commits aprovados, usar force push, alterar remotos ou configurações de publicação sem autorização específica. Criar commits somente quando solicitados ou autorizados, revisando explicitamente os arquivos e hunks incluídos e preservando o índice preexistente.
- Push, merge e deploy exigem autorização explícita aplicável à ação, branch e destino. Autorizar uma correção ou um commit não autoriza publicação. Antes de publicar, reconferir o diff e os testes do conteúdo exato; interromper diante de alterações desconhecidas, conflitos ou falha de um gate obrigatório.
- Proteger saves reais, schema e compatibilidade, assets originais e artes aprovadas. Usar cópias para experimentos e comparar hashes quando houver risco de alteração ou exigência da missão. Não abrir saves de produção em testes nem copiar dados pessoais para evidências.
- Não instalar dependências ou modificar configurações globais fora do escopo autorizado. Reutilizar runtimes existentes; se uma ferramenta indispensável estiver indisponível, registrar o bloqueio antes de propor instalação.

### 4. Validação proporcional e isolada

- Escolher a menor cobertura suficiente pelos sistemas afetados. Documentação apenas: conferir preservação das regras, consistência, escopo do diff e git diff --check; não repetir suítes de gameplay ou navegador sem motivo.
- JavaScript alterado: verificar sintaxe dos arquivos envolvidos e executar os testes Node pertinentes. Persistência, progressão ou integração ampla: executar a suíte Node completa existente. Em PowerShell, enumerar os testes explicitamente: node --test (Get-ChildItem tests -Filter '*.test.cjs' | Sort-Object Name | ForEach-Object FullName).
- Arena, interface ou fluxo de combate: executar os cenários Chromium relevantes, usando a infraestrutura existente; para regressão completa de navegador, usar node tests/browser/run.cjs chromium. Inspecionar configuração e cobertura atuais em vez de confiar em contagens antigas do README.
- Usar contextos de navegador descartáveis e servidor HTTP local. O runner já gera QA em cópia temporária; seus artefatos ficam no checkout que o executa. Usar cópia isolada quando esses arquivos não puderem ser gerados no checkout atual. Nunca executar _qa/build.cjs contra a raiz real para um teste descartável, nem substituir _qa-dist, _qa-dist.zip ou .wrangler existentes.
- O QA Debug pode iniciar encontros ignorando gates territoriais. Para validar progressão ou acesso, verificar também as condições reais do mapa; não considerar um encontro forçado como prova de desbloqueio legítimo.
- Em mudanças visuais, conferir larguras relevantes, enquadramento, sequência de reações, cancelamento e prefers-reduced-motion. Chromium em viewport mobile não comprova Safari/iPhone físico; WebKit, quando já disponível, também não substitui playtest no aparelho.
- Não reinstalar ferramentas para repetir um resultado já válido. Após aprovação dos testes pertinentes, repetir ou ampliar somente por mudança de código, ambiente ou dependência relevante, falha, cobertura insuficiente ou risco ainda não resolvido. Distinguir teste executado agora de evidência reaproveitada.
- Tratar falhas de ambiente com diagnóstico: por exemplo, uma comparação sensível a CRLF não prova defeito de gameplay. Não mudar código ou configuração global para esconder a falha; registrar a condição e qualquer adaptação restrita à cópia de testes.

### 5. Recuperação de tarefas interrompidas

- Antes de retomar, ler o último relatório ou registro da missão e conferir Git e arquivos atuais. Identificar o que foi concluído, o que falhou e qual é a próxima etapa autorizada; não reiniciar automaticamente toda a missão.
- Em tarefas longas ou antes de uma interrupção previsível, manter um registro curto na área isolada da missão: objetivo e autorizações, caminho/branch/HEAD, arquivos e hashes relevantes, comandos e resultados de testes, logs, operações externas concluídas, pendências e próximo passo. Não gravar tokens, credenciais ou saves reais; não atualizar silenciosamente o checkpoint compartilhado fora do escopo.
- Reaproveitar resultados quando o conteúdo testado e as condições relevantes continuarem iguais. Conferir hashes ou diff dos arquivos e dependências afetados; para uma release, vincular a evidência ao commit exato. Se houver mudança ou evidência insuficiente, repetir apenas a cobertura invalidada.
- Antes de repetir uma ação com efeito externo ou Git, verificar se ela já ocorreu: conteúdo do commit/índice, refs local e remota, deployment e URL, conforme a missão. Não duplicar commits ou publicações após timeout ou resposta incerta.
- Encerrar apenas processos de teste identificados como pertencentes à missão. Não matar processos desconhecidos para liberar uma porta. Preservar os artefatos anteriores e registrar a retomada no mesmo histórico da missão.

### 6. Comunicação e conclusão

- Informar progresso por resultados e bloqueios relevantes, sem narrar cada comando. Agrupar leituras independentes; manter alterações, gates de aprovação e ações dependentes em sequência.
- Entregar relatório final curto com alterações e arquivos, testes executados ou reaproveitados, resultados, pendências e riscos. Separar validação automática de aprovação visual humana.
- Informar o estado final do Git e, quando aplicável, branch/commit, destino autorizado e evidências. Declarar publicação somente após confirmar deployment concluído e conteúdo correto por HTTPS; sucesso de push isoladamente não comprova publicação.
- Ao concluir o escopo, parar. Integração, nova missão ou promoção à produção dependem das autorizações correspondentes; não ampliar o trabalho por iniciativa própria.
