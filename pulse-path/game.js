// Keep touch holds inside the game; preserve desktop menus and editable fields.
(function () {
  var lastTouch = -Infinity;
  function rememberTouch(event) {
    if (event.type === 'touchstart' || event.pointerType === 'touch') lastTouch = Date.now();
  }
  document.addEventListener('touchstart', rememberTouch, { capture: true, passive: true });
  document.addEventListener('pointerdown', rememberTouch, { capture: true, passive: true });
  document.addEventListener('contextmenu', function (event) {
    var editable = event.target && event.target.closest && event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])');
    if (!editable && (event.pointerType === 'touch' || Date.now() - lastTouch < 2000)) event.preventDefault();
  }, true);
}());

(function(){
  'use strict';
  if(!window.LearningGate||!window.PulseCore){document.body.innerHTML='<main style="padding:24px;font:20px Arial;color:white">↻ <a style="color:white" href="./">Volver a cargar el juego</a></main>';return;}
  var C=window.PulseCore,$=function(id){return document.getElementById(id);},canvas=$('world'),ctx=canvas.getContext('2d');
  var width=0,height=0,dpr=1,state=C.create(0,'easy'),selected=0,difficulty='easy',assist=false,repeat=true,held=false,jumpQueued=false,playing=false,paused=false,familyPaused=false,gateLocked=true,sound=false,audio=null,deferredInstall=null,completed=[false,false,false],best=[0,0,0],particles=[],last=0,accumulator=0,lastBeat=-1;
  try{var saved=JSON.parse(localStorage.getItem('pulse-path-progress-v1')||'null');if(saved&&Array.isArray(saved.completed))completed=completed.map(function(_,i){return saved.completed[i]===true;});if(saved&&Array.isArray(saved.best))best=best.map(function(_,i){return Math.max(0,Math.min(100,Number(saved.best[i])||0));});}catch(ignore){}
  function save(){try{localStorage.setItem('pulse-path-progress-v1',JSON.stringify({completed:completed,best:best}));}catch(ignore){}}
  function clearInput(){held=false;jumpQueued=false;}
  function tone(freq,duration){if(!sound||gateLocked||familyPaused||paused)return;try{if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();var osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,audio.currentTime);gain.gain.setValueAtTime(.045,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration);}catch(ignore){}}
  function mute(){if(audio&&audio.state==='running'){var result=audio.suspend();if(result&&result.catch)result.catch(function(){});}}
  function sceneFont(size) {
    return size + 'px "' + (window.FamilyV2 && FamilyV2.fontFamily || 'Family School') + '", cursive';
  }
  // The native scene also works without the optional family shell.
  function nightScene() {
    return window.FamilyV2 && typeof FamilyV2.theme === 'function'
      ? FamilyV2.theme() === 'dark' : document.documentElement.getAttribute('data-family-theme') === 'dark';
  }
  function decorativeMotion() {
    return window.FamilyV2 && typeof FamilyV2.motionAllowed === 'function'
      ? FamilyV2.motionAllowed() : !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function resize(){width=window.innerWidth;height=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--family-height'))||window.innerHeight;dpr=Math.min(window.devicePixelRatio||1,1);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=width+'px';canvas.style.height=height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);}
  function menu(){playing=false;paused=false;state=C.create(selected,difficulty);clearInput();$('menu').hidden=false;$('result').hidden=true;$('pause-panel').hidden=true;$('jump').hidden=true;$('level-label').textContent='';$('progress').firstElementChild.style.width='0%';$('progress').setAttribute('aria-valuenow','0');updateMenu();mute();}
  function updateMenu(){Array.prototype.forEach.call(document.querySelectorAll('[data-level]'),function(button){var i=Number(button.dataset.level);button.classList.toggle('selected',i===selected);button.setAttribute('aria-pressed',String(i===selected));button.querySelector('small').textContent=completed[i]?'★':String(i+1);});$('best').textContent=completed[selected]?'★ ★ ★':best[selected]>0?'⚑ '+best[selected]+'%':'';}
  function start(retry){raceInstance++;state=retry?C.restore(state):C.create(selected,difficulty);playing=true;paused=false;particles=[];accumulator=0;last=performance.now();lastBeat=-1;clearInput();$('menu').hidden=true;$('result').hidden=true;$('pause-panel').hidden=true;$('jump').hidden=false;$('level-label').textContent=C.levels[selected].icon+' '+(selected+1)+' / 3';$('pause').setAttribute('aria-label','Pausar partida');}
  function pause(value){if(!playing||state.status!=='playing')return;paused=value;clearInput();accumulator=0;last=performance.now();$('pause-panel').hidden=!value;$('pause').setAttribute('aria-label',value?'Continuar partida':'Pausar partida');if(value)mute();}
  function burst(color){if(!decorativeMotion())return;for(var i=0;i<6;i++)particles.push({x:state.x+15,y:state.y+15,vx:Math.cos(i*2.4)*(35+i*5),vy:Math.sin(i*2.4)*(35+i*5),life:.65,color:color});}
  function finish(won){clearInput();$('jump').hidden=true;best[selected]=Math.max(best[selected],Math.min(100,Math.floor(state.x/C.levels[selected].length*100)));if(won){completed[selected]=true;award('finish-'+selected,3);}save();$('result-symbol').textContent=won?'🏆':'🚩 ↻';$('result-stars').textContent=won?'★ '+state.stars.length+' / '+C.levels[selected].stars.length:'⚑ '+Math.floor(state.checkpoint/C.levels[selected].length*100)+'%';$('next').hidden=!won;$('retry').setAttribute('aria-label',won?'Volver a jugar este circuito':'Reintentar desde el punto de control');$('result').hidden=false;burst(won?'#ffe082':'#ffae9f');tone(won?784:170,.22);}
  function update(dt){if(gateLocked||familyPaused||paused||!playing||document.hidden)return;var events=C.step(state,dt,{jump:jumpQueued,held:held,repeat:repeat,assist:assist});jumpQueued=false;events.forEach(function(event){if(event==='jump')tone(370,.08);if(event==='star'){tone(880,.09);award('star-'+selected+'-'+state.stars[state.stars.length-1],1);}if(event==='portal')tone(520,.15);if(event==='crash'||event==='win')finish(event==='win');});particles.forEach(function(p){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy-=180*dt;p.life-=dt;});particles=particles.filter(function(p){return p.life>0;});var progress=Math.min(100,Math.floor(state.x/C.levels[selected].length*100));$('progress').firstElementChild.style.width=progress+'%';$('progress').setAttribute('aria-valuenow',String(progress));var beat=Math.floor(state.t*1.8);if(beat!==lastBeat&&state.status==='playing'){lastBeat=beat;tone(beat%4===0?130:210,.035);}}
  function star(x,y,r,color){ctx.beginPath();for(var i=0;i<10;i++){var a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;var px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);}ctx.closePath();ctx.fillStyle=color;ctx.fill();}
  function render(){
    var level=C.levels[playing?state.level:selected],scale=Math.max(.65,Math.min(1.1,width/700,height/420)),ground=height*.75,anchor=width<450?76:width*.23,camera=playing?state.x:30;
    var night=nightScene(),sceneryCamera=decorativeMotion()?camera:30;
    var sky=ctx.createLinearGradient(0,0,0,ground);sky.addColorStop(0,night?'#101c36':'#77b8d6');sky.addColorStop(1,night?'#4a4c70':'#efe3c8');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
    if(night)for(var j=0;j<24;j++){var sx=((j*137.43-sceneryCamera*.055)%width+width)%width,sy=25+(j*71.7)%Math.max(30,ground-90);ctx.fillStyle=j%3?'#b6c7e1':'#fff1c8';ctx.fillRect(sx,sy,j%5===0?2:1,j%5===0?2:1);}
    ctx.fillStyle=night?'#e2e9f3':'#fff3c8';ctx.beginPath();ctx.arc(width*.78,height*.25,Math.min(44,height*.09),0,Math.PI*2);ctx.fill();
    // Layered mineral cliffs and faceted foreground pillars; no blur passes.
    for(var layer=0;layer<3;layer++){
      ctx.beginPath();ctx.moveTo(0,ground);
      for(var q=-1;q<width/140+2;q++){var xx=q*140-((sceneryCamera*(.045+layer*.045))%140),top=ground-65-layer*17-(q*q*13+layer*19)%58;ctx.lineTo(xx,ground-40);ctx.lineTo(xx+40,top);ctx.lineTo(xx+85,top+12);ctx.lineTo(xx+130,ground-45);}
      ctx.lineTo(width,ground+10);ctx.closePath();ctx.fillStyle=night?['#465572','#334760','#25394e'][layer]:['#a6b6bd','#7b9ca9','#537f92'][layer];ctx.fill();
    }
    var deck=ctx.createLinearGradient(0,ground,0,height);deck.addColorStop(0,night?'#33465a':'#6b8793');deck.addColorStop(1,night?'#142436':'#354f66');ctx.fillStyle=deck;ctx.fillRect(0,ground,width,height-ground);
    ctx.fillStyle=night?'#a4ded8':'#e3f0db';ctx.fillRect(0,ground,width,4);ctx.fillStyle='#10273580';ctx.fillRect(0,ground+5,width,6);
    for(var gx=-1;gx<width/80+2;gx++){var gxx=gx*80-(sceneryCamera*scale%80);ctx.fillStyle=night?'#597589':'#abc2c4';ctx.fillRect(gxx,ground+17,2,Math.max(0,height-ground-17));ctx.fillStyle='#162c4240';ctx.fillRect(gxx+9,ground+19,54,5);}
    function screen(x){return anchor+(x-camera)*scale;}
    level.obstacles.forEach(function(o){var x=screen(o.x),w=o.w*scale,h=o.h*scale;if(x+w<-20||x>width+20)return;if(o.type==='gap'){ctx.fillStyle=night?'#080f21':'#213647';ctx.fillRect(x,ground-2,w,height-ground+2);ctx.fillStyle='#eacb8c';ctx.fillRect(x-5,ground,5,8);ctx.fillRect(x+w,ground,5,8);ctx.strokeStyle='#fa9cba';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x,ground+27);ctx.moveTo(x+w,ground);ctx.lineTo(x+w,ground+27);ctx.stroke();}else if(o.type==='spike'){ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x+w/2,ground-h);ctx.lineTo(x+w,ground);ctx.closePath();ctx.fillStyle=night?'#885978':'#9e5367';ctx.fill();ctx.beginPath();ctx.moveTo(x+w/2,ground-h);ctx.lineTo(x+w,ground);ctx.lineTo(x+w*.48,ground-h*.18);ctx.closePath();ctx.fillStyle=night?'#513654':'#683d54';ctx.fill();ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x+w/2,ground-h);ctx.lineTo(x+w,ground);ctx.closePath();ctx.strokeStyle=night?'#ffbfce':'#ffe5d4';ctx.lineWidth=2;ctx.stroke();}else{ctx.fillStyle=night?'#385b70':'#5b8290';ctx.fillRect(x,ground-h,w,h);ctx.fillStyle='#122c4555';ctx.fillRect(x+w*.72,ground-h,w*.28,h);ctx.fillStyle=night?'#c4ede2':'#e6f1cf';ctx.fillRect(x,ground-h,w,5);ctx.fillStyle='#152d4560';ctx.fillRect(x+4,ground-h+10,Math.max(1,w-8),3);ctx.strokeStyle=level.color;ctx.lineWidth=2;ctx.strokeRect(x,ground-h,w,h);ctx.fillStyle='#8cdedb55';ctx.fillRect(x+5,ground-h+5,Math.max(1,w-10),4);}});
    level.portals.forEach(function(p){var x=screen(p.x);if(x<-50||x>width+50)return;ctx.save();ctx.translate(x,ground-55*scale);ctx.scale(.55,1);ctx.strokeStyle=level.color;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,55*scale,0,Math.PI*2);ctx.stroke();ctx.restore();ctx.fillStyle='#e1edff';ctx.font=sceneFont(26);ctx.textAlign='center';ctx.fillText(p.icon,x,ground-128*scale);});
    level.checkpoints.forEach(function(x){if(!x)return;var px=screen(x);if(px<-40||px>width+40)return;ctx.strokeStyle='#92b3c6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px,ground);ctx.lineTo(px,ground-56*scale);ctx.stroke();ctx.fillStyle=state.checkpoint>=x?'#82e7c8':'#789bb3';ctx.beginPath();ctx.moveTo(px,ground-56*scale);ctx.lineTo(px+25*scale,ground-46*scale);ctx.lineTo(px,ground-36*scale);ctx.fill();});
    level.stars.forEach(function(s,i){if(state.stars.indexOf(i)>=0&&playing)return;var x=screen(s.x);if(x<0||x>width)return;star(x,ground-s.y*scale,9*scale,level.accent);});
    var finishX=screen(level.length);if(finishX<width+50&&finishX>-50){ctx.strokeStyle='#ffdf8a';ctx.lineWidth=4;ctx.strokeRect(finishX,ground-120*scale,65*scale,120*scale);ctx.fillStyle='#ffdf8a';ctx.font=sceneFont(28);ctx.textAlign='center';ctx.fillText('★',finishX+32*scale,ground-133*scale);}
    var px=anchor+15*scale,py=ground-(state.y+15)*scale;
    if(state.status!=='crashed'||!playing){ctx.save();ctx.translate(px,py);ctx.rotate(playing?state.rotation:0);ctx.fillStyle=level.color;ctx.shadowColor=level.color;ctx.shadowBlur=0;ctx.fillRect(-15*scale,-15*scale,30*scale,30*scale);ctx.strokeStyle=night?'#e9fff3':'#234958';ctx.lineWidth=2;ctx.strokeRect(-15*scale,-15*scale,30*scale,30*scale);ctx.fillStyle='#ffffff70';ctx.fillRect(-12*scale,-12*scale,24*scale,4*scale);ctx.fillStyle='#15345155';ctx.fillRect(10*scale,-8*scale,5*scale,23*scale);ctx.shadowBlur=0;ctx.fillStyle='#163d4b';ctx.fillRect(-9*scale,-5*scale,5*scale,5*scale);ctx.fillRect(4*scale,-5*scale,5*scale,5*scale);ctx.fillRect(-5*scale,5*scale,10*scale,3*scale);ctx.restore();}
    (decorativeMotion()?particles:[]).forEach(function(p){ctx.globalAlpha=p.life/.65;ctx.fillStyle=p.color;ctx.fillRect(screen(p.x),ground-p.y*scale,4,4);});ctx.globalAlpha=1;
  }
  function frame(now){requestAnimationFrame(frame);var dt=last?Math.min((now-last)/1000,.1):0;last=now;gate.check();if(!gateLocked&&!familyPaused&&!paused&&playing&&!document.hidden){accumulator+=dt;while(accumulator>=C.STEP){update(C.STEP);accumulator-=C.STEP;}}else accumulator=0;render();}
  function down(event){if(gateLocked||familyPaused||paused||!playing||state.status!=='playing')return;if(event.button>0)return;event.preventDefault();held=true;jumpQueued=true;try{event.currentTarget.setPointerCapture(event.pointerId);}catch(ignore){}}
  [canvas,$('jump')].forEach(function(el){el.addEventListener('pointerdown',down);el.addEventListener('pointerup',function(){held=false;});el.addEventListener('pointercancel',clearInput);el.addEventListener('lostpointercapture',function(){if(held)clearInput();});});
  window.addEventListener('keydown',function(e){if(familyPaused||(e.target.closest&&e.target.closest('input,select,textarea,dialog')))return;if(e.code==='Space'||e.code==='ArrowUp'){if(gateLocked||familyPaused||paused||!playing||state.status!=='playing')return;e.preventDefault();if(!e.repeat)jumpQueued=true;held=true;}if(e.code==='Escape'&&!gateLocked)pause(!paused);});window.addEventListener('keyup',function(e){if(e.code==='Space'||e.code==='ArrowUp')held=false;});window.addEventListener('blur',function(){clearInput();if(playing&&state.status==='playing'&&!gateLocked)pause(true);});document.addEventListener('visibilitychange',function(){clearInput();last=performance.now();accumulator=0;if(document.hidden)mute();});
  Array.prototype.forEach.call(document.querySelectorAll('[data-level]'),function(button){button.onclick=function(){selected=Number(button.dataset.level);state=C.create(selected,difficulty);updateMenu();};});
  $('play').onclick=function(){start(false);};$('home').onclick=menu;$('result-menu').onclick=menu;$('pause').onclick=function(){pause(!paused);};$('resume').onclick=function(){pause(false);};$('restart').onclick=function(){start(false);};$('retry').onclick=function(){start(state.status!=='won');};$('next').onclick=function(){selected=(selected+1)%3;start(false);};
  $('difficulty').onclick=function(){difficulty=difficulty==='easy'?'normal':'easy';this.textContent=difficulty==='easy'?'🐢':'🐇';this.setAttribute('aria-label',difficulty==='easy'?'Dificultad tranquila. Cambiar dificultad':'Dificultad normal. Cambiar dificultad');};$('assist').onclick=function(){assist=!assist;this.setAttribute('aria-pressed',String(assist));this.setAttribute('aria-label',assist?'Desactivar ayuda de salto':'Activar ayuda de salto');};$('hold').onclick=function(){repeat=!repeat;this.setAttribute('aria-pressed',String(repeat));this.setAttribute('aria-label',repeat?'Desactivar salto continuo al mantener pulsado':'Activar salto continuo al mantener pulsado');};
  $('help').onclick=function(){$('help-panel').setAttribute('slot','family-settings');this.parentNode.appendChild($('help-panel'));$('help-panel').hidden=false;};$('close-help').onclick=function(){$('help-panel').hidden=true;};$('sound').onclick=function(){sound=!sound;this.textContent=sound?'🔊':'🔇';this.setAttribute('aria-pressed',String(sound));this.setAttribute('aria-label',sound?'Desactivar sonido':'Activar sonido');if(sound)tone(440,.15);else mute();};
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredInstall=e;$('install').hidden=false;});$('install').onclick=function(){if(deferredInstall){deferredInstall.prompt();deferredInstall=null;this.hidden=true;}};
  document.addEventListener('DOMContentLoaded', function () {
    if (window.FamilyV2 && FamilyV2.fontReady) FamilyV2.fontReady.then(function () { render(); });
  });
  addEventListener('familyv2:appearance', function () { render(); });
  // Independent of manual/help pause and the educational gate.
  var raceInstance=0;
  function award(id,points){id='run-'+raceInstance+':'+id;if(window.FamilyV2){FamilyV2.touch();FamilyV2.award(id,points);}}
  function familyPause(){familyPaused=true;clearInput();accumulator=0;last=performance.now();mute();}
  function familyResume(){familyPaused=false;clearInput();accumulator=0;last=performance.now();}
  window.addEventListener('familyv2:pause',familyPause);
  window.addEventListener('familyv2:resume',familyResume);
  document.addEventListener('DOMContentLoaded',function(){if(window.FamilyV2)FamilyV2.register({pause:familyPause,resume:familyResume,home:menu});resize();});
  var gate=LearningGate.mount({gameId:'pulse-path',onLock:function(){gateLocked=true;clearInput();accumulator=0;mute();},onUnlock:function(){gateLocked=false;clearInput();accumulator=0;last=performance.now();}});
  if(new URLSearchParams(location.search).has('test'))Object.defineProperty(window,'__pulse',{value:Object.freeze({read:function(){return JSON.parse(JSON.stringify({state:state,selected:selected,difficulty:difficulty,assist:assist,repeat:repeat,playing:playing,paused:paused,familyPaused:familyPaused,sound:sound,gateLocked:gateLocked,completed:completed,best:best}));}})});
  window.addEventListener('resize',function(){requestAnimationFrame(resize);});resize();updateMenu();requestAnimationFrame(frame);
  if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).catch(function(){});
}());
