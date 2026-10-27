# A ÚLTIMA LUA — PROJECT CHECKPOINT

**Última atualização:** 27/10/2026
**Papel deste arquivo:** ponto de entrada para qualquer agente (Codex, OpenCode, ChatGPT).
O estado canônico fica em `docs/memoria/`. Este arquivo resume e aponta; não duplica.

> Regra: nunca alterar código só para fazê-lo coincidir com este documento.
> Se houver divergência entre documento, Git e testes, **relate antes de editar**.

---

## 1. Onde está a verdade

| Arquivo | O que contém |
|---|---|
| `AGENTS.md` | Regras obrigatórias de desenvolvimento |
| `docs/memoria/ESTADO_ATUAL.md` | Estado verificado, com data e nível de evidência |
| `docs/memoria/PROXIMOS_PASSOS.md` | Pendências que exigem decisão humana |
| `docs/memoria/DECISOES_APROVADAS.md` | Aprovações registradas (não inferir as que não estão lá) |
| `docs/memoria/BESTIARIO_FLORESTA_UIVANTE.md` | Entidades da Floresta, assets e status |
| `docs/memoria/MANIFESTO_ARTES.json` | Artes, hashes e estado de aprovação |
| `docs/memoria/HISTORICO_DESENVOLVIMENTO.md` | Histórico do desenvolvimento |
| `docs/memoria/ARQUITETURA.md` | Como o Palácio funciona |

`PROJECT-CHECKPOINT.md` (este arquivo) existe para o primeiro comando de uma sessão.
Ele **não substitui** o Palácio.

---

## 2. Snapshot Git — 27/10/2026

- **Worktree documental:** `D:\Projetos\A-ultima-lua`
- **Branch:** `docs/palacio-memoria-v1`
- **HEAD:** `01cf700` — *Record hit reactions for Romar and the pack wolf*
- **Remote:** `origin` = `https://github.com/JMorten/A-ultima-lua..git`
  (a branch atual não tem upstream configurado; nada foi enviado nesta atualização)
- **Outras linhas de desenvolvimento:** ver `ESTADO_ATUAL.md` §"Linhas de desenvolvimento".
  Existem worktrees em `laboratorios/` — não sincronizar, não fazer merge e não
  apagar sem autorização.
- **Versão:** VS 1.18 é a baseline funcional oficial (`README.md`).

---

## 3. Estado em 30 segundos

- **T1 — Floresta Uivante:** reformulação visual V2 aprovada para Lobo Comum, Lobo
  Cinzento, Lobisomem Jovem, Uivante das Sombras, Romar e Lobo da Matilha.
  Commits na branch `feature/floresta-uivante-v2-etapa1`, com QA isolado publicado.
  Safari físico confirmado para os quatro primeiros; **Romar e Lobo da Matilha
  aguardam teste no iPhone**.
- **T2 — Pântano Podre:** implementado (Senhor do Pântano, materiais, vitória pendente).
- **T3 — Trincheiras Orc:** progressão determinística, Xamã ritualístico, Gorthak e
  Arena V2.4 implementados na linha QA/release.
- **T4 — Cripta Sangrenta:** definida no código; sem revisão visual V2 equivalente.
- **T5:** não existe.
- **Produção:** inalterada. Nenhuma promoção autorizada.
- **Persistência:** `localStorage`, chave `a-ultima-lua.checkpoint`, schema 5.

---

## 4. Testes — o que foi realmente executado

Executado em 27/10/2026 neste worktree:

```powershell
cd "D:\Projetos\A-ultima-lua"
node --test tests/*.test.cjs
```

Resultado: **171/171 Node** (0 falhas).

Referências registradas no Palácio para o worktree da branch feature:
**195/195 Node**, **80/80 Chromium** e **19/19 WebKit** na suíte `forest-v2`.
Contagens de datas e escopos diferentes **não devem ser somadas**.

Teste em Chromium/WebKit não substitui iPhone físico.

---

## 5. Pendências que exigem decisão humana

1. **Validação física no Safari/iPhone** do Lobo da Matilha e do Romar
   (URL e roteiro em `docs/memoria/PROXIMOS_PASSOS.md`).
2. **Reconciliação de `qa-preview`:** local `081fce4` × `origin/qa-preview` `11bff6c`.
3. **Promoção à produção** da Floresta V2 — não autorizada.
4. **Backup dos arquivos não versionados** (seção 6). Eles existem só neste disco.

---

## 6. Arquivos não versionados (preservados no disco)

Arte aprovada e pacotes de referência, mantidos fora do Git por tamanho:

| Arquivo | Tamanho |
|---|---|
| `lobo-comum-v2-aprovado.png` | 2,6 MB |
| `lobo-cinzento-v2-aprovado.png` | 2,9 MB |
| `lobisomem-jovem-v2-aprovado.png` | 2,3 MB |
| `uivante-sombras-v2-aprovado.png` | 2,2 MB |
| `romar-v2-aprovado-1.png` / `-2` / `-3` | 2,5 / 2,8 / 2,8 MB |
| `pack_wolf_subordinate_cutout.png` | 1,7 MB |
| `comparacao-lobisomem-jovem-v2.png` | 0,8 MB |
| `pacote-floresta-v2.zip` | 5,1 MB |
| `Imagem do ChatGPT 18 de out. de 2026, 12_30_18.jpg` | 0,03 MB |

Total: ~26 MB. Eles estão listados em `.gitignore` para o `git status` ficar limpo.
**Não estão no Git:** se este computador falhar, eles se perdem. Copie para um backup
ou publique em um Release quando houver autorização.

---

## 7. Regra para futuras sessões

1. Ler este arquivo, `AGENTS.md` e `docs/memoria/ESTADO_ATUAL.md`.
2. Rodar `git status` e `git log -5`.
3. Comparar com o snapshot da seção 2.
4. **Relatar divergências antes de modificar qualquer arquivo.**
5. Não inferir aprovação de arte ou de design que não esteja em `DECISOES_APROVADAS.md`.
6. Não apagar trabalho local para "limpar" o repositório.
7. Não sincronizar branches, não fazer merge e não publicar sem autorização.

---

## 8. Como continuar em outro chat

O estado **não fica na conversa**: fica nesta pasta (Git + Palácio da Memória).

1. **Melhor opção:** abrir o agente **dentro de `D:\Projetos\A-ultima-lua`**
   (OpenCode, Codex CLI, Claude Code). Ele lê o Git e o Palácio de verdade.
2. **ChatGPT web:** anexar `PROJECT-CHECKPOINT.md` e
   `docs/memoria/ESTADO_ATUAL.md`, e colar a frase abaixo. Ele orienta; quem edita
   os arquivos é você.
3. Se este chat acabar, o próximo começa por este arquivo.

Frase pronta para colar:

> Estou continuando o projeto A Última Lua em `D:\Projetos\A-ultima-lua`.
> Leia `PROJECT-CHECKPOINT.md`, `AGENTS.md` e `docs/memoria/ESTADO_ATUAL.md`.
> Não sou programador: explique simples, diga onde clicar e rode os comandos você
> mesmo quando possível. O HEAD é `01cf700`, a suíte Node passou 171/171 e nada
> foi publicado nesta atualização.

---

## 9. Histórico

O texto anterior deste checkpoint (13/10/2026, base `7582299`) foi substituído em
27/10/2026 por estar desatualizado — o Palácio já registrava essa divergência.
Ele continua preservado no Git:

```powershell
git show 01cf700:PROJECT-CHECKPOINT.md
```

O conteúdo histórico completo (Trincheiras, Xamã, Gorthak, Arena V2.4, correção da
Retaliação do Sangue) continua em `docs/memoria/HISTORICO_DESENVOLVIMENTO.md` e nos
commits listados em `ESTADO_ATUAL.md`.

**FIM DO CHECKPOINT.**
