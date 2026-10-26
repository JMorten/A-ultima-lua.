# CI e qualidade — branch `chore/ci-qualidade`

**Data:** 26/10/2026  
**Base:** `fix/pos-playtest-v1` (`11bff6c`)  
**Natureza:** infraestrutura de teste e correções pequenas. Nenhuma mecânica, balanceamento, item ou progressão foi alterado.

---

## 1. O que foi adicionado

| Arquivo | Função |
|---|---|
| `.github/workflows/ci.yml` | CI com testes Node, Chromium, **WebKit** e orçamento de assets |
| `.opencode/opencode.jsonc` | Chrome DevTools MCP + permissões |
| `.opencode/agents/` | designer, balance, QA, performance, arte e release |
| `.opencode/commands/` | `/playtest`, `/perf`, `/balance`, `/ship`, `/revisar-jogo` |
| `tools/check-assets.mjs` | Falha se assets crescerem acima do orçamento |
| `tools/optimize-images.py` | Gera WebP/AVIF sem tocar nos originais |
| `tests/browser/package-lock.json` | Instalação reproduzível do Playwright |

## 2. Correções

### 2.1 Scroll no desktop após iniciar batalha

**Problema:** no WebKit, a página permanecia scrollada após clicar na seleção de classe. A arena começava 21–28 px acima da viewport, escondida sob o HUD.

**Correção:** em `startBattle`, no desktop (`min-width: 701px`), `window.scrollTo(0, 0)`. No mobile o comportamento anterior foi preservado porque o layout compacto usa o scroll para manter os controles visíveis.

**Evidência:** `post-playtest.spec.cjs` 1366×768 passou em Chromium e WebKit.

### 2.2 Movimento reduzido no Xamã

**Problema:** em WebKit, o teste de `prefers-reduced-motion` falhava por:
- a mudança de mídia chegar depois de `hit`, limpando `data-reaction-static`;
- três `CSSTransition` de `outline` ficarem ativas no elemento.

**Correção:**
- o teste ativa `reducedMotion` antes de montar o combate, refletindo o uso real;
- o CSS desliga `animation`/`transition` do `portrait-ring` sob `prefers-reduced-motion`.

**Evidência:** teste do Xamã passou em Chromium e WebKit.

### 2.3 CRLF no teste de QA

`tests/qa-build.test.cjs` usava `split('\n')`; com CRLF do Windows, `_config.yml` nunca casava. Trocado por `split(/\r?\n/)`.

## 3. Resultados

| Verificação | Antes | Depois |
|---|---:|---:|
| Node | 185/185 (falhava 1 por CRLF no Windows) | **185/185** |
| Chromium | 61/61 | **61/61** |
| WebKit | 59/61 | **61/61** |
| Assets | 55,69 MB | WebP **11,74 MB** (-78,9%), mantendo as dimensões originais |

O WebKit não existia no fluxo anterior. Esta é a primeira execução real do motor Safari no projeto.

## 4. Como rodar

```powershell
# Node
node --test tests/*.test.cjs

# Browser (Chromium + WebKit)
cd tests/browser
npm install
npx playwright install chromium webkit
npm test

# Só WebKit
node run.cjs webkit

# Orçamento de assets
node tools/check-assets.mjs assets 3200 57

# Otimização (não altera assets/)
python tools/optimize-images.py
```

## 5. Orçamento de assets

O CI usa o teto **15 MB / 600 KB por arquivo**. O total atual é **11,74 MB**.

O script `tools/optimize-images.py` gerou o conjunto de produção:

```
assets/*.webp             11,74 MB (81 arquivos)
assets-original/*         55,69 MB (backup local ignorado)
assets-webp/report.csv    relatório de conversão
```

Nada em `assets-original/` é versionado. A migração de referências e testes foi feita; o jogo usa somente WebP.

## 6. Pendências

- Push da branch e execução do CI no GitHub (não autorizado nesta tarefa).
- Teste físico no Safari/iPhone continua obrigatório para mudanças visuais.
- Decidir se a branch será integrada em `qa-preview`, `feature/floresta-uivante-v2-etapa1` ou `main`.
- Produção não foi tocada.

## 7. Nível de evidência

- Implementação local: **sim** (worktree `D:\Projetos\A-ultima-lua-ci`).
- Commit: **não** (ainda).
- Build QA: **sim** (`_qa-dist`, gerado e descartado).
- Deploy QA: **não**.
- Produção: **não**.
- Aprovação humana física: **não**.
