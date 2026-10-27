# Playwright QA V3 — Gorthak (sobre V1 + V2)

PoC isolada de testes de navegador. Os testes não acessam domínio de produção e criam um contexto novo do navegador por teste. O personagem QA e seu `localStorage` existem somente para a origem local descartável.

## Ambiente

- Node.js 24.x (compatibilidade observada no laboratório).
- Playwright fixado em `1.62.1` em `package.json`.
- Chromium: o runner detecta Google Chrome em `Program Files`/`Program Files (x86)`; se não o encontrar, usa o Chromium do Playwright. É possível indicar outro executável por `AUL_CHROME_EXECUTABLE`.
- WebKit: executado somente se o binário Playwright já estiver instalado. O runner não baixa navegadores.

## Execução sem instalação local

O `run.cjs` procura Playwright em `tests/browser/node_modules`, `node_modules` da raiz, `AUL_PLAYWRIGHT_NODE_MODULES` e no runtime Node distribuído pelo Codex. Ele exige exatamente a versão 1.62.1. Na máquina de origem, foi encontrado o pacote do runtime Codex; nenhum pacote foi instalado no projeto.

Na raiz do repositório:

```powershell
node .\tests\browser\run.cjs chromium
node .\tests\browser\run.cjs webkit
node .\tests\browser\run.cjs all
```

Se existir outra cópia local já instalada:

```powershell
$env:AUL_PLAYWRIGHT_NODE_MODULES = 'C:\caminho\existente\node_modules'
node .\tests\browser\run.cjs all
```

Instalação voluntária e local da dependência, se necessária e autorizada:

```powershell
Set-Location .\tests\browser
npm install --save-dev --save-exact playwright@1.62.1
npx playwright install chromium webkit
```

Não execute a instalação de navegadores em ambientes que não possam baixar componentes. `npm` não estava disponível no ambiente desta execução; não houve instalação automática.

## Isolamento de build e dados

O runner copia somente `index.html`, `src`, `styles`, `assets` e `_qa` para uma pasta temporária do sistema. Executa `_qa/build.cjs` apontando para essa cópia, nunca para a raiz real. O servidor HTTP escuta exclusivamente em `127.0.0.1:4179` e serve somente o `_qa-dist` temporário. A pasta temporária é removida ao término. Os arquivos `.wrangler/`, `_qa-dist.zip` e o `_qa-dist` existente não são usados nem substituídos.

Cada teste recebe um `BrowserContext` novo, sem estado persistente. Nenhum save real é carregado. A rota externa de fontes Google é atendida localmente por CSS vazio para evitar dependência de rede.

## Cobertura V1 + V2 + V3

- Inicialização e erros JavaScript.
- Seleção de classes.
- Criação QA e persistência após reload no contexto descartável.
- Combate real do Xamã pelo QA Debug, seleção/ataque de Totens, inatingibilidade durante o ritual, retaliação de 20% do dano efetivo, sifão de energia, despertar e aplicação do bônus.
- Ação de cura não elegível para retaliação, e recarga durante ritual conforme o schema 5 sem restaurar combate nem duplicar a perda de HP.
- Arena V2.4 e assets dos Totens, sem falhas de carregamento ou erros JavaScript.
- Gorthak: três fases nos limiares reais (65% e 30% de HP), telegraph/resolução do Golpe Demolidor, Golpe Pesado e ausência de estado preparado acumulado na fase final.
- Reload em combate e vitória pendente com verificação de HP, XP/moedas e ausência de recompensa duplicada.
- Erros de carregamento de assets e overflow horizontal em 320, 375 e 390 px.

Os cenários usam o QA Debug visível e a interface real de combate. Os atributos de QA são aplicados por seus controles próprios, gravados apenas no `localStorage` do contexto descartável. Nenhum resultado é forçado por alteração direta de estado interno. A cobertura de Gorthak usa os limiares reais do código (65% e 30% do HP atual/max) e não injeta estado de combate. Valores de atributos de QA são definidos pelos controles visíveis do QA Debug em contexto descartável.

Execução: 14 testes Playwright em Chromium, além da suíte Node existente. WebKit só roda se o binário já estiver instalado; o runner não baixa browsers.

## Artefatos

Relatórios Playwright, traces e screenshot ficam em `tests/browser/artifacts/`. São artefatos novos da PoC e não são saves do jogo.


## Candidata pós-playtest V1 (20/10/2026)

O runner aceita filtros adicionais do Playwright, sem instalar ferramentas:

```powershell
node tests/browser/run.cjs chromium post-playtest.spec.cjs
node tests/browser/run.cjs chromium
node --test (Get-ChildItem tests -Filter '*.test.cjs' | Sort-Object Name | ForEach-Object FullName)
```

O novo arquivo cobre derrota por ataques reais, remoção de pontos, confirmação para Mapa, vitória pendente/reload sem duplicação, primeira pista de Romar antes do combate e sua confirmação após reload. As pré-condições são criadas somente em armazenamento descartável; os resultados usam os handlers reais. Os testes anteriores que usam atributos arbitrários pelo QA Debug continuam úteis em memória; ao recarregar, qualquer orçamento excedente é reconciliado pela mesma proteção dos saves normais, sem bypass de produção.

Layouts: 320×568, 375×667, 390×664, 390×844 e 1366×768; ritual com MP insuficiente em 320×568 e 320×664. Os controles têm área mínima de 44px. Em alturas curtas ou encontros com mais opções, a região de comandos pode rolar internamente mantendo o palco visível. Descrições completas de habilidades continuam na aba Status; custo e motivo da indisponibilidade permanecem no botão. O teste de estabilidade de posição aguarda a animação finita de entrada já existente. O histórico está em uma seção expansível; as asserções de conteúdo leem textContent para continuar verificando todos os ataques e fases mesmo quando ela está recolhida.

As capturas ficam em artifacts/post-playtest-*.png. Chromium em viewport mobile não comprova Safari físico. WebKit só é usado quando já instalado; nenhuma dependência deve ser baixada automaticamente.

### Playtest local da candidata

Abra PowerShell na raiz deste checkout candidato. Crie uma cópia QA única no TEMP, nunca execute o builder contra o checkout:

```powershell
$qaPreviewRoot = Join-Path $env:TEMP ('ultima-lua-playtest-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $qaPreviewRoot
foreach ($entry in @('index.html','src','styles','assets','_qa')) { Copy-Item -LiteralPath $entry -Destination $qaPreviewRoot -Recurse }
node -e "require(process.argv[1]).build(process.argv[2])" (Join-Path $qaPreviewRoot '_qa/build.cjs') $qaPreviewRoot
$env:AUL_QA_DIST = Join-Path $qaPreviewRoot '_qa-dist'
node tests/browser/server.cjs
```

Acesse http://127.0.0.1:4179 em um perfil descartável, sem importar saves reais. Finalize o servidor com Ctrl+C. Não execute ao mesmo tempo que a suíte usa a porta 4179. A publicação HTTPS para iPhone exige autorização posterior.

Checklist humano: provocar derrota com pontos livres e distribuídos; confirmar o nível e a remoção informados; recuperar níveis sem exceder 5×(nível−1); confirmar vitória e derrota para o Mapa; derrotar o Alfa e iniciar um combate comum na Floresta para ver a primeira pista; recarregar durante essa cena; testar magias/MP baixo/Totens/Gorthak com barras do Safari abertas e fechadas. Verificar toque, rolagem interna, textos e enquadramento sem reduzir a escala do sistema.
