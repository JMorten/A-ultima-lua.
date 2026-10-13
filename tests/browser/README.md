# Playwright QA V1 — A Última Lua

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

## Escopo atual

- Inicialização e erros JavaScript.
- Seleção de classes.
- Criação QA e persistência após reload no contexto descartável.
- Combate real pelo QA Debug (Xamã em Trincheiras Orc) e presença dos assets da Arena V2.4 e totens.
- Erros de carregamento de assets e overflow horizontal em 320, 375 e 390 px.

Automação completa do ritual do Xamã e das fases de Gorthak fica fora da V1.

## Artefatos

Relatórios Playwright, traces e screenshot ficam em `tests/browser/artifacts/`. São artefatos novos da PoC e não são saves do jogo.
