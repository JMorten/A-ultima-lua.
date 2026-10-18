(function(scope){
  'use strict';
  let current=null;
  // Historical filename retained for compatibility; one shared lifecycle for both actors.
  const profiles={
    warlord_gorthak:{prefix:"gorthak",motion:{
    damage:{duration:140,x:4,rotation:.6,glow:.22},
    retreat:{duration:260,x:7,rotation:.2,glow:0},
    critical:{duration:430,x:10.5,rotation:1.5,glow:.58}
    }},
    orc_guerreiro:{prefix:"warrior",motion:{
      damage:{duration:280,x:7,y:-2,rotation:.7,glow:.24,directional:true,followRetreat:false},
      critical:{duration:390,x:14,y:-6,rotation:2,glow:.52,directional:true}
    }},
    orc_batedor:{prefix:"scout",motion:{
      damage:{duration:250,x:8,y:-2,rotation:.8,glow:.22,directional:true,followRetreat:false},
      retreat:{duration:180,x:4,rotation:.15,glow:0},
      critical:{duration:360,x:16,y:-6,rotation:2.2,glow:.55,directional:true}
    }},
    orc_capitao:{prefix:"captain",motion:{
      damage:{duration:260,x:8,y:-2,rotation:.8,glow:.24,directional:true,followRetreat:false},
      critical:{duration:410,x:16,y:-7,rotation:2.1,glow:.56,directional:true}
    }},
    acougueiro_trincheira:{prefix:"butcher",motion:{
      damage:{duration:280,x:9,y:-2,rotation:1,glow:.28,directional:true,followRetreat:false},
      critical:{duration:430,x:18,y:-8,rotation:2.4,glow:.62,directional:true}
    }},
    orc_xama:{prefix:"shaman",motion:{
      damage:{duration:270,x:8,y:-2,rotation:1,glow:.25,directional:true,followRetreat:false},
      critical:{duration:410,x:16,y:-7,rotation:2.2,glow:.58,directional:true}
    }}
  };
  function destroy(){
    if(!current)return;
    const old=current;current=null;
    old.observer?.disconnect();old.animator.destroy();
    old.surface.classList.remove(old.prefix+'-reaction-surface');
    old.glow.remove();old.flash.remove();
  }
  function mount(monster){
    destroy();
    const selected=monster&&profiles[monster.id];
    if(!selected||typeof scope.CombatReactionAnimator!=='function')return;
    const prefix=selected.prefix,profile=selected.motion;
    const surface=document.getElementById('portrait-enemy');
    const effects=document.getElementById('effects-enemy');
    const stage=document.querySelector('.arena-global-effects');
    if(!surface||!effects||!stage)return;
    const glow=document.createElement('div'),flash=document.createElement('div');
    glow.className=prefix+'-impact-glow';flash.className=prefix+'-impact-flash';
    glow.setAttribute('aria-hidden','true');flash.setAttribute('aria-hidden','true');
    effects.appendChild(glow);stage.appendChild(flash);
    surface.classList.add(prefix+'-reaction-surface');
    const animator=new scope.CombatReactionAnimator({root:surface,surface,glow,flash,profile});
    const view={monster,prefix,surface,glow,flash,animator,followRetreat:profile.damage.followRetreat!==false,observer:null};current=view;
    if(typeof MutationObserver!=='undefined'){
      view.observer=new MutationObserver(()=>{if(current===view&&!surface.isConnected)destroy();});
      view.observer.observe(document.getElementById('content'),{childList:true,subtree:true});
    }
  }
  function hit(monster,isCrit){
    const view=current;
    if(!view||view.monster!==monster||view.surface.isConnected===false)return false;
    // Latest hit wins; never queue stale reactions or delay the combat timers.
    const sequence=(view.sequence||0)+1;view.sequence=sequence;
    void view.animator.play(isCrit?'critical':'damage').then(result=>{
      if(!isCrit&&view.followRetreat&&!result.interrupted&&current===view&&view.sequence===sequence&&!view.animator.media.matches)
        void view.animator.play('retreat');
    });
    return true;
  }
  scope.EnemyCombatVisual=Object.freeze({mount,destroy,hit});
  scope.GorthakVisual=scope.EnemyCombatVisual; // Legacy API, not a second animator.
  if(scope.addEventListener)scope.addEventListener('pagehide',destroy);
})(typeof globalThis!=='undefined'?globalThis:this);
