/* Script clássico exclusivo do artefato QA; usa os globais reais do jogo. */
const QADebug=(()=>{
  const stats=['forca','agilidade','magia','espirito','vitalidade','defesa'];
  let confirmation=null,observedPlayer=null;
  function idle(){return !ui.inBattle&&!ui.monster&&!ui.locked&&!ui.pendingVictory&&!ui.lucasScene&&!ui.romarResult&&!pendingForestEvent&&!hasPendingRomarDiscovery()&&document.querySelectorAll('.interactive-card').length===0;}
  function requireIdle(){if(!idle())throw Error('Conclua o combate, a cena ou CONTINUAR antes de usar o Debug.');}
  function number(value,max){if(value===''||!Number.isSafeInteger(Number(value))||Number(value)<0||Number(value)>max)throw Error('Valor inteiro fora do limite técnico.');return Number(value);}
  function save(){render();if(!requestCheckpoint())throw Error('Alteração em memória; checkpoint não gravado. Confira HP e armazenamento.');}
  function apply(values){
    requireIdle();if(!player)throw Error('Crie ou continue um personagem QA.');
    const level=number(values.level,100);if(level<1)throw Error('Nível mínimo: 1.');
    const points=number(values.statPoints,10000),allocated={};
    for(const key of stats)allocated[key]=number(values[key],10000);
    player.totalXp=totalXpForLevel(level);recomputeLevelFromXp();player.allocated=allocated;player.statPoints=points;
    ui.pendingAlloc=Object.fromEntries(stats.map(key=>[key,0]));recomputeStats();save();
  }
  function resetMagic(){requireIdle();if(!player)throw Error('Nenhum personagem.');player.magDomain=null;player.overchargeNext=false;save();}
  function preset(value){requireIdle();if(!player)throw Error('Nenhum personagem.');if(![24,25,49,50,74,75,99,100].includes(value))throw Error('Preset inválido.');player.allocated.magia=value;ui.pendingAlloc.magia=0;player.magDomain=null;player.overchargeNext=false;recomputeStats();save();}
  function domain(value){requireIdle();if(!player||!hasMagMilestone(100))throw Error('Requer Mago com 100 pontos investidos em MAG.');if(!['destruidor','proibido'].includes(value))throw Error('Domínio inválido.');chooseMagDomain(value);}
  function restore(){requireIdle();if(!player)throw Error('Nenhum personagem.');recomputeStats();player.hp=player.hpMax;player.mp=player.mpMax;save();}
  function requestNew(key){requireIdle();if(!Object.prototype.hasOwnProperty.call(CLASSES,key))throw Error('Classe inválida.');confirmation=key;return true;}
  function cancelNew(){confirmation=null;}
  function confirmNew(){
    requireIdle();if(!confirmation)return false;
    const key=confirmation;confirmation=null;
    // Reload after persisting a fresh checkpoint clears all old callbacks/UI caches.
    newPlayer(key);normalizeForgeEconomy(player);
    ui.itemSeq=1;ui.pendingAlloc=Object.fromEntries(stats.map(stat=>[stat,0]));
    forestEventCooldown=0;lastForestEventId=null;lastSavedPayload=null;
    if(!requestCheckpoint())throw Error('Não foi possível salvar o novo personagem QA.');
    location.reload();return true;
  }
  function encounters(index){const map=MAPS[index];if(!map)return [];return [...map.monsters.map(template=>({template,isBoss:false,label:'Criatura'})),...(map.miniBoss?[{template:map.miniBoss,isBoss:false,label:'Miniboss'}]:[]),...(map.boss?[{template:map.boss,isBoss:true,label:'Boss'}]:[])];}
  function battle(mapIndex,entryIndex){requireIdle();if(!player||player.hp<=0)throw Error('Crie um personagem e restaure HP.');const entry=encounters(mapIndex)[entryIndex];if(!entry)throw Error('Encontro inválido.');startBattle(mapIndex,entry.template,entry.isBoss);}
  const panel=document.createElement('section');panel.id='qa-panel';
  panel.innerHTML=`<strong>MODO QA — PROGRESSÃO NÃO É VÁLIDA</strong><details><summary>Debug V1 — abrir controles</summary>
    <p>Laboratório descartável. Alterações somente fora de combates e cenas. Limites técnicos: nível 1–100; investimentos/pontos 0–10000.</p>
    <label>Classe do novo personagem<select id="qa-class"></select></label><button id="qa-new">NOVO PERSONAGEM QA</button>
    <div id="qa-confirm" hidden><p>Descartar o personagem e todo o progresso deste laboratório? Esta operação não pode ser desfeita.</p><button id="qa-confirm-new">CONFIRMAR NOVO PERSONAGEM QA</button><button id="qa-cancel">CANCELAR</button></div>
    <fieldset><legend>Personagem — controles independentes</legend><div class="qa-grid">${['level','statPoints',...stats].map(key=>`<label>${({level:'Nível',statPoints:'Pontos disponíveis',forca:'FOR',agilidade:'AGI',magia:'MAG investida',espirito:'ESP',vitalidade:'VIT',defesa:'DEF'})[key]}<input id="qa-${key}" type="number" inputmode="numeric" min="${key==='level'?1:0}" max="${key==='level'?100:10000}" step="1"></label>`).join('')}</div><button id="qa-apply">APLICAR NÍVEL, ATRIBUTOS E PONTOS</button><button id="qa-read">LER VALORES ATUAIS</button><button id="qa-restore">RESTAURAR HP / MP</button></fieldset>
    <fieldset><legend>Marcos de MAG</legend><p>Presets alteram somente MAG investida e limpam Domínio/Sobrecarga. Não alteram pontos disponíveis.</p><div class="qa-presets">${[24,25,49,50,74,75,99,100].map(n=>`<button id="qa-mag-${n}">${n}</button>`).join('')}</div><button id="qa-magic-reset">LIMPAR DOMÍNIO E SOBRECARGA</button><button id="qa-domain-destruidor">DOMÍNIO: ARCANO DESTRUIDOR</button><button id="qa-domain-proibido">DOMÍNIO: ARCANO PROIBIDO</button></fieldset>
    <fieldset><legend>Batalha real — acesso sem requisitos territoriais</legend><label>Território<select id="qa-map"></select></label><label>Inimigo<select id="qa-enemy"></select></label><button id="qa-battle">INICIAR BATALHA</button></fieldset><p id="qa-state"></p><p id="qa-message" role="status" aria-live="polite"></p></details>`;
  document.body.prepend(panel);
  const el=id=>document.getElementById('qa-'+id);
  function options(id,entries){el(id).replaceChildren(...entries.map(([value,text])=>{const option=document.createElement('option');option.value=value;option.textContent=text;return option;}));}
  options('class',Object.entries(CLASSES).map(([key,c])=>[key,c.name]));options('map',MAPS.map((map,i)=>[i,map.name]));
  function enemies(){options('enemy',encounters(Number(el('map').value)).map((entry,i)=>[i,entry.label+' — '+entry.template.name]));}
  enemies();el('map').addEventListener('change',enemies);
  function read(){if(player)for(const key of ['level','statPoints',...stats])el(key).value=stats.includes(key)?player.allocated[key]:player[key];}
  function update(){
    if(player!==observedPlayer){observedPlayer=player;read();}
    const blocked=!idle();for(const button of panel.querySelectorAll('button'))button.disabled=blocked;
    el('confirm').hidden=!confirmation;
    const unmet=player?Object.values(player.equipment).filter(item=>item&&!itemMeetsRequirements(item)).map(item=>item.name):[];
    el('state').textContent=player?`${blocked?'Operações bloqueadas. ':''}${CLASSES[player.classKey].name} · nível ${player.level} · HP ${player.hp}/${player.hpMax} · MP ${player.mp}/${player.mpMax} · MAG investida ${getMagInvested()} / derivada ${player.magia} · Domínio ${getMagDomain()||'nenhum'} · Sobrecarga ${!!player.overchargeNext}. ${unmet.length?'Equipamentos preservados com requisitos não atendidos: '+unmet.join(', '):'Equipamentos existentes preservados.'}`:'Crie um personagem QA ou use CONTINUAR.';
  }
  function bind(id,fn){el(id).addEventListener('click',()=>{try{fn();el('message').textContent='Operação concluída.';read();}catch(error){el('message').textContent=error.message;}update();});}
  bind('new',()=>requestNew(el('class').value));bind('cancel',cancelNew);bind('confirm-new',confirmNew);
  bind('apply',()=>apply(Object.fromEntries(['level','statPoints',...stats].map(key=>[key,el(key).value]))));bind('read',read);bind('restore',restore);
  for(const n of [24,25,49,50,74,75,99,100])bind('mag-'+n,()=>preset(n));
  bind('magic-reset',resetMagic);for(const name of ['destruidor','proibido'])bind('domain-'+name,()=>domain(name));
  bind('battle',()=>battle(Number(el('map').value),Number(el('enemy').value)));
  read();update();setInterval(update,500); // Observation only; never saves or consumes RNG.
  return {apply,preset,domain,resetMagic,restore,requestNew,cancelNew,confirmNew,encounters,battle,idle};
})();
