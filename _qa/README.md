# QA V1

Este diretório é exclusivo de QA. Não incluir no artefato de produção.

Cloudflare Pages: framework None, comando `node _qa/build.cjs`, saída `_qa-dist`, raiz vazia. Mesma configuração para previews. Manter o hostname estável para preservar localStorage. O diretório gerado não é versionado. Não há autenticação nesta etapa.

GitHub Pages permanece no build Jekyll atual. `_config.yml` exclui `_qa` e `_qa-dist`. Não adicionar `.nojekyll` nem publicar a raiz bruta em produção: isso invalidaria a exclusão. O HTML original não referencia Debug. A Cloudflare deve publicar apenas `_qa-dist`, nunca a raiz após esta implementação.

O gerador copia os scripts/assets reais sem modificações e acrescenta o painel somente ao HTML gerado. Não há cópia manual do jogo, dependências npm ou bundler.

NOVO PERSONAGEM QA exige confirmação, usa newPlayer, salva pelo checkpoint real e recarrega a página para eliminar callbacks e caches do personagem anterior. Depois use CONTINUAR. Substitui exclusivamente o save desta origem; sem snapshot/importação de produção.

Aplicar define XP no início do nível pelas funções reais, altera investimentos e pontos independentemente e recalcula status. Não concede pontos automaticamente. Limites técnicos: nível 1–100; investimentos/pontos 0–10000. Restauração de HP/MP é explícita. Equipamentos permanecem equipados conforme regras existentes; a interface informa requisitos não atendidos.

Presets MAG alteram allocated.magia e limpam magDomain/overchargeNext. Seleção de Domínio utiliza chooseMagDomain e requer Mago com 100 MAG investidos. Sobrecarga permanece no controle real de combate. Alterações gerais de atributos não limpam Domínio automaticamente: há botão explícito.

Encounters usam MAPS e startBattle já envolvido pela persistência, ignorando somente os gates de entrada do mapa. Recompensas e resultados são reais no laboratório descartável. Não inclui encontros narrativos externos a MAPS.

Operações bloqueadas durante combate, locks, cenas/cards e vitória pendente. Campos podem ser preenchidos, mas execução revalida o estado. Observação do painel não salva nem usa RNG. Schema 5 e reload de combate permanecem inalterados.

Validação: `node --test tests/*.test.cjs`, `node --check _qa/debug.js`, `node --check _qa/build.cjs`, `node _qa/build.cjs`, `git diff --check`. A separação de produção deve também ser conferida no build Jekyll real; testes locais de configuração não substituem esse build.
