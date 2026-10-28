// Reaction-only adaptation of Gorthak Visual V2. No idle or breathing code.
(function(scope){
  'use strict';
  const REST='translate3d(0,0,0) rotate(0deg)';
  class CombatReactionAnimator {
    constructor({root,surface,glow,flash,profile,mediaQuery}){
      this.root=root;this.surface=surface;this.glow=glow;this.flash=flash;this.profile=profile;
      this.media=mediaQuery||scope.matchMedia('(prefers-reduced-motion: reduce)');
      this.effects=[];this.epoch=0;this.pending=null;this.timer=null;this.destroyed=false;
      this.change=()=>this.interrupt();
      if(this.media.addEventListener)this.media.addEventListener('change',this.change);
      else this.media.addListener(this.change);
    }
    prefersReducedMotion(){
      // WebKit can briefly retain the value of a MediaQueryList created before
      // an emulated or runtime preference change. A fresh query is authoritative.
      return typeof scope.matchMedia==='function'
        ? scope.matchMedia('(prefers-reduced-motion: reduce)').matches
        : !!this.media.matches;
    }
    interrupt(){
      this.epoch++;
      if(this.timer!==null)clearTimeout(this.timer);this.timer=null;
      for(const a of this.effects){a.onfinish=null;a.cancel();}this.effects=[];
      delete this.root.dataset.reaction;
      delete this.root.dataset.reactionStatic;
      if(this.pending){const resolve=this.pending;this.pending=null;resolve({interrupted:true});}
    }
    play(action){
      if(this.destroyed)return Promise.resolve({interrupted:true});
      if(!this.profile[action])throw new RangeError('Reação desconhecida');
      this.interrupt();const token=this.epoch,r=this.profile[action];
      this.root.dataset.reaction=action;
      const promise=new Promise(resolve=>{this.pending=resolve;});
      const finish=()=>{
        if(this.destroyed||token!==this.epoch)return;
        for(const a of this.effects){a.onfinish=null;a.cancel();}this.effects=[];
        this.timer=null;delete this.root.dataset.reaction;delete this.root.dataset.reactionStatic;
        const resolve=this.pending;this.pending=null;if(resolve)resolve({interrupted:false});
      };
      if(this.prefersReducedMotion()||typeof this.surface.animate!=='function'){
        this.root.dataset.reactionStatic='true';
        this.timer=setTimeout(finish,180);
      }else{
        // The same bottom-anchored reaction and cancellation model as laboratory V2.
        const frames=r.directional ? [
          {transform:REST,offset:0,easing:'cubic-bezier(.12,.7,.2,1)'},
          {transform:'translate3d('+r.x+'px,'+(r.y||0)+'px,0) rotate('+r.rotation+'deg)',offset:.24,easing:'linear'},
          {transform:'translate3d('+r.x+'px,'+(r.y||0)+'px,0) rotate('+r.rotation+'deg)',offset:.36,easing:'cubic-bezier(.25,0,.25,1)'},
          {transform:REST,offset:1}
        ] : action==='retreat' ? [
          {transform:REST,offset:0},
          {transform:'translate3d('+r.x+'px,1px,0) rotate('+r.rotation+'deg)',offset:.30},
          {transform:'translate3d('+r.x*.86+'px,0,0) rotate(0deg)',offset:.56},
          {transform:REST,offset:1}
        ] : [
          {transform:REST,offset:0},
          {transform:'translate3d('+r.x+'px,1px,0) rotate('+r.rotation+'deg)',offset:.18},
          {transform:'translate3d('+-r.x*.24+'px,0,0) rotate('+-r.rotation*.22+'deg)',offset:.60},
          {transform:REST,offset:1}
        ];
        const main=this.surface.animate(frames,{duration:r.duration,easing:r.directional?'linear':'cubic-bezier(.2,.65,.3,1)',fill:'none'});
        this.effects.push(main);
        if(r.glow&&this.glow)this.effects.push(this.glow.animate(
          [{opacity:0},{opacity:r.glow,offset:.16},{opacity:0,offset:.74},{opacity:0}],
          {duration:r.duration,fill:'none',easing:'ease-out'}));
        if(action==='critical'&&this.flash)this.effects.push(this.flash.animate(
          [{opacity:0},{opacity:.38,offset:.10},{opacity:0,offset:.36},{opacity:0}],
          {duration:r.duration,fill:'none'}));
        main.onfinish=finish;
      }
      return promise;
    }
    destroy(){
      if(this.destroyed)return;
      this.interrupt();this.destroyed=true;
      if(this.media.removeEventListener)this.media.removeEventListener('change',this.change);
      else this.media.removeListener(this.change);
    }
  }
  if(typeof module==='object'&&module.exports)module.exports=CombatReactionAnimator;
  else scope.CombatReactionAnimator=CombatReactionAnimator;
})(typeof globalThis!=='undefined'?globalThis:this);
