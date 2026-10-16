(function(scope){
  'use strict';
  let current=null;
  const profile={
    damage:{duration:140,x:4,rotation:.6,glow:.22},
    retreat:{duration:260,x:7,rotation:.2,glow:0},
    critical:{duration:430,x:10.5,rotation:1.5,glow:.58}
  };
  function destroy(){
    if(!current)return;
    const old=current;current=null;
    old.observer?.disconnect();old.animator.destroy();
    old.surface.classList.remove('gorthak-reaction-surface');
    old.glow.remove();old.flash.remove();
  }
  function mount(monster){
    destroy();
    if(!monster||monster.id!=='warlord_gorthak'||typeof scope.CombatReactionAnimator!=='function')return;
    const surface=document.getElementById('portrait-enemy');
    const effects=document.getElementById('effects-enemy');
    const stage=document.querySelector('.arena-global-effects');
    if(!surface||!effects||!stage)return;
    const glow=document.createElement('div'),flash=document.createElement('div');
    glow.className='gorthak-impact-glow';flash.className='gorthak-impact-flash';
    glow.setAttribute('aria-hidden','true');flash.setAttribute('aria-hidden','true');
    effects.appendChild(glow);stage.appendChild(flash);
    surface.classList.add('gorthak-reaction-surface');
    const animator=new scope.CombatReactionAnimator({root:surface,surface,glow,flash,profile});
    const view={monster,surface,glow,flash,animator,observer:null};current=view;
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
      if(!isCrit&&!result.interrupted&&current===view&&view.sequence===sequence&&!view.animator.media.matches)
        void view.animator.play('retreat');
    });
    return true;
  }
  scope.GorthakVisual=Object.freeze({mount,destroy,hit});
  if(scope.addEventListener)scope.addEventListener('pagehide',destroy);
})(typeof globalThis!=='undefined'?globalThis:this);
