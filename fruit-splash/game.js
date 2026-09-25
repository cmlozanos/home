(function () {
  'use strict';
  if (!window.LearningGate) { document.body.textContent = '↻ Recarga para cargar el reto'; return; }
  var learningLocked = true, learningGate, learningAudioWasRunning = false;
  var canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
  var $ = function (id) { return document.getElementById(id); };
  var core = window.FruitCore, clamp = core.clamp;
  var width = 1000, height = 900, dpr = 1, state = 'menu', mode = 'garden';
  var fruits = [], pieces = [], drops = [], rings = [], pointers = new Map();
  var score = 0, lives = 3, elapsed = 0, nextSpawn = .35, combo = 0, lastSlice = -10;
  var comboUntil = 0, flash = 0, audio = null, sound = false, lastTime = 0, nextId = 1;
  var accumulator = 0, saved = {}, reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lowPower = (navigator.hardwareConcurrency || 4) <= 4, maxDrops = lowPower ? 75 : 140;
  var colors = ['#f35d65','#f5b23d','#c4dc71','#ec7095','#74bea1','#de9fd3'];
  var sprites = [], slicedSprites = [], backdrop = document.createElement('canvas');
  var soundUse = $('sound').querySelector('use');
  function icon(name) { return '<svg aria-hidden="true"><use href="#i-' + name + '"/></svg>'; }
  try { var data=JSON.parse(localStorage.getItem('fruit-splash-v1') || '{}');saved=data&&typeof data==='object'&&!Array.isArray(data)?data:{}; } catch (ignore) {}
  function best() { return Number.isFinite(saved[mode]) ? saved[mode] : 0; }
  function record() {
    saved[mode] = Math.max(best(), score);
    try { localStorage.setItem('fruit-splash-v1', JSON.stringify(saved)); } catch (ignore) {}
    $('best').textContent = best();
  }
  function circle(c,x,y,r,fill) { c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fillStyle=fill; c.fill(); }
  function leaf(c,x,y,a,scale) {
    c.save(); c.translate(x,y); c.rotate(a); c.scale(scale,scale); c.fillStyle='#9bbf5e';
    c.beginPath(); c.moveTo(0,0); c.bezierCurveTo(-14,-25,4,-49,28,-49); c.bezierCurveTo(40,-16,17,0,0,0); c.fill();
    c.strokeStyle='#537c47'; c.lineWidth=2; c.beginPath(); c.moveTo(0,0); c.lineTo(23,-41); c.stroke(); c.restore();
  }
  function paintFruit(c,type,inside) {
    c.save(); c.translate(100,100);
    var shade=c.createRadialGradient(-25,-32,4,10,10,87);
    shade.addColorStop(0,['#ffb09b','#ffe19c','#ebf8a1','#ffbbcb','#bee3a4','#f3d1ff'][type]);
    shade.addColorStop(.55,colors[type]);shade.addColorStop(1,['#c53052','#e4832f','#80ac4b','#d4467d','#438f70','#925eac'][type]);
    if(type===0){
      c.beginPath();c.moveTo(0,-57);c.bezierCurveTo(-100,-102,-100,14,-26,75);c.bezierCurveTo(-5,93,10,93,30,71);c.bezierCurveTo(106,3,88,-92,0,-57);c.fillStyle=shade;c.fill();
      for(var j=0;j<4;j++)for(var i=0;i<4-j;i++){c.save();c.translate(-48+j*13+i*28,-26+j*25);c.rotate(-.2);c.fillStyle='#ffe49c';c.beginPath();c.ellipse(0,0,2.7,5,0,0,Math.PI*2);c.fill();c.restore();}
      if(!inside){leaf(c,-6,-56,-1.05,.78);leaf(c,-6,-56,.6,.8);leaf(c,-6,-54,1.8,.65);}
    }else{
      circle(c,0,5,77,shade);
      if(type===1){for(var k=0;k<24;k++){var a=k*2.4,r=25+(k%3)*16;circle(c,Math.cos(a)*r,Math.sin(a)*r+5,1.3,'rgba(160,90,12,.22)');}}
      if(type===2||type===4){for(var stripe=-2;stripe<=2;stripe++){c.strokeStyle=type===4?'rgba(32,99,72,.28)':'rgba(83,127,56,.25)';c.lineWidth=7;c.beginPath();c.ellipse(0,5,Math.abs(stripe)*20+6,73,0,-Math.PI/2,Math.PI/2);c.stroke();}}
      if(!inside){c.strokeStyle='#6c5a34';c.lineWidth=8;c.beginPath();c.moveTo(0,-66);c.quadraticCurveTo(-6,-87,7,-92);c.stroke();leaf(c,4,-71,.8,.75);}
      if(inside){
        circle(c,0,5,68,type===4?'#ee6b75':type===2?'#bedc71':type===1?'#ffe3a5':type===5?'#efe0bc':'#ffd0b4');
        if(type===1){for(var s=0;s<8;s++){c.save();c.translate(0,5);c.rotate(s*Math.PI/4);c.fillStyle='#ffb741';c.beginPath();c.moveTo(5,5);c.arc(0,0,60,.1,Math.PI/4-.1);c.closePath();c.fill();c.restore();}}
        else if(type===2||type===4){for(var seed=0;seed<12;seed++){var angle=seed*Math.PI/6;c.save();c.translate(Math.cos(angle)*40,Math.sin(angle)*40+5);c.rotate(angle);c.fillStyle=type===4?'#542d38':'#45643f';c.beginPath();c.ellipse(0,0,5,2.5,0,0,Math.PI*2);c.fill();c.restore();}if(type===2)circle(c,0,5,19,'#f7f2c2');}
        else{circle(c,0,5,20,'#a66e4d');circle(c,-4,1,13,'#cc9767');}
      }
    }
    if(!inside){c.save();c.translate(-32,-35);c.rotate(-.6);c.fillStyle='rgba(255,255,234,.35)';c.beginPath();c.ellipse(0,0,10,20,0,0,Math.PI*2);c.fill();c.restore();}
    c.restore();
  }
  for(var t=0;t<6;t++){var outer=document.createElement('canvas'),inner=document.createElement('canvas');outer.width=inner.width=200;outer.height=inner.height=200;paintFruit(outer.getContext('2d'),t,false);paintFruit(inner.getContext('2d'),t,true);sprites.push(outer);slicedSprites.push(inner);}
  function drawBackground() {
    backdrop.width=canvas.width;backdrop.height=canvas.height;
    var c=backdrop.getContext('2d');c.scale(canvas.width/width,canvas.height/height);
    var g=c.createRadialGradient(width*.5,height*.45,20,width*.5,height*.4,Math.max(width,height)*.8);
    g.addColorStop(0,'#23594b');g.addColorStop(.58,'#123f37');g.addColorStop(1,'#082e2d');c.fillStyle=g;c.fillRect(0,0,width,height);
    c.strokeStyle='rgba(158,201,150,.035)';c.lineWidth=1;
    for(var x=25;x<width;x+=46)for(var y=15;y<height;y+=46){c.beginPath();c.moveTo(x-3,y);c.lineTo(x+3,y);c.moveTo(x,y-3);c.lineTo(x,y+3);c.stroke();}
    c.fillStyle='rgba(6,33,28,.3)';c.beginPath();c.moveTo(0,height);c.lineTo(0,height-45);c.quadraticCurveTo(width*.3,height-170,width,height-35);c.lineTo(width,height);c.fill();
    var corners=[[0,0,.8],[width,0,2.3],[0,height,-.7],[width,height,-2.3]];
    corners.forEach(function(p){for(var i=0;i<7;i++){c.save();c.globalAlpha=.22;c.translate(p[0],p[1]);leaf(c,0,0,p[2]+i*.28,2+i*.45);c.restore();}});
  }
  function resize() {
    var oldWidth=width; height=900;width=height*window.innerWidth/window.innerHeight;
    dpr=Math.min(window.devicePixelRatio||1,lowPower?1.3:2);
    canvas.width=Math.round(window.innerWidth*dpr);canvas.height=Math.round(window.innerHeight*dpr);
    fruits.forEach(function(f){f.x*=width/oldWidth;});pieces=[];drops=[];pointers.clear();drawBackground();
  }
  function beep(freq,duration,wave) {
    if(!sound||!audio)return;
    try {var o=audio.createOscillator(),g=audio.createGain();o.type=wave||'sine';o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.5,audio.currentTime+duration);g.gain.setValueAtTime(.055,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch(ignore){}
  }
  $('sound').onclick=function(){
    sound=!sound;
    if(sound){try{var Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('Audio unavailable');if(!audio)audio=new Audio();audio.resume().catch(function(){});}catch(ignore){sound=false;}}
    soundUse.setAttribute('href',sound?'#i-sound':'#i-mute');$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'Desactivar sonido':'Activar sonido');if(sound)beep(550,.14);
  };
  function refreshHUD(){ var value=String(score),remaining=mode==='rush'?String(Math.max(0,Math.ceil(60-elapsed))):mode==='classic'?'♥'.repeat(lives):'∞';if($('score').textContent!==value)$('score').textContent=value;if($('remaining').textContent!==remaining)$('remaining').textContent=remaining; }
  function launchFruit(type,bomb) {
    var r=clamp(Math.min(width,height)*.079,30,57),p=core.launch(width,height,r,Math.random);
    fruits.push({id:nextId++,x:p.x,y:p.y,vx:p.vx,vy:p.vy,r:r,angle:Math.random()*2,spin:(Math.random()-.5)*2,type:type,bomb:!!bomb,cut:false,entered:false});
  }
  function start(){
    state='playing';score=0;lives=3;elapsed=0;combo=0;lastSlice=-10;nextSpawn=.35;fruits=[];pieces=[];drops=[];rings=[];pointers.clear();accumulator=0;comboUntil=0;flash=0;
    $('menu').hidden=true;$('dialog').hidden=true;$('hud').hidden=false;$('hint').hidden=false;$('combo').textContent='';
    $('mode-icon').innerHTML=icon(mode==='garden'?'leaf':mode==='rush'?'clock':'heart');refreshHUD();canvas.focus();
  }
  function showMenu(){record();state='menu';$('menu').hidden=false;$('dialog').hidden=true;$('hud').hidden=true;$('hint').hidden=true;$('combo').textContent='';fruits=[];pieces=[];drops=[];pointers.clear();$('play').focus();}
  function pause(){if(state!=='playing')return;state='paused';pointers.clear();$('hint').hidden=true;showDialog(false);}
  function showDialog(over){
    $('dialog').hidden=false;$('resume').hidden=over;$('retry').hidden=!over;
    $('dialog-title').textContent=over?'¡Buena cosecha!':'Una pausa';$('dialog-detail').textContent=over?score+' puntos · '+best()+' récord':'';
    var stars=over?(score>=150?3:score>=50?2:score>0?1:0):0;
    $('stars').innerHTML=over?[0,1,2].map(function(i){return '<span class="'+(i<stars?'':'empty')+'">'+icon('star')+'</span>';}).join(''):icon('leaf');
    (over?$('retry'):$('resume')).focus();
  }
  function finish(){if(state!=='playing')return;state='over';record();pointers.clear();$('hint').hidden=true;$('combo').textContent='';showDialog(true);}
  function burst(f){
    for(var i=0;i<(reduced?5:16);i++){var a=Math.random()*Math.PI*2,s=70+Math.random()*210;drops.push({x:f.x,y:f.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.5+Math.random()*.5,r:2+Math.random()*7,color:colors[f.type]});}
    if(drops.length>maxDrops)drops.splice(0,drops.length-maxDrops);
    rings.push({x:f.x,y:f.y,r:f.r*.7,life:.35});if(rings.length>12)rings.shift();
  }
  function cut(f){
    f.cut=true;$('hint').hidden=true;
    if(f.bomb){flash=.3;combo=0;lives=Math.max(0,lives-1);beep(100,.3,'triangle');$('combo').textContent='💥 −1 ♥';comboUntil=elapsed+.8;refreshHUD();if(lives===0)finish();return;}
    combo=elapsed-lastSlice<.5?Math.min(combo+1,8):1;lastSlice=elapsed;
    score+=10+(combo>=3?combo*2:0);beep(480+combo*80,.1);burst(f);
    [-1,1].forEach(function(side){pieces.push({x:f.x,y:f.y,vx:f.vx+side*100,vy:f.vy*.25-100,r:f.r,type:f.type,angle:f.angle,spin:side*2,side:side,life:1.2});});
    if(pieces.length>36)pieces.splice(0,pieces.length-36);
    if(combo>=3){$('combo').textContent='×'+combo+'  ¡SPLASH!';comboUntil=elapsed+.65;}
    refreshHUD();if(score%100===0)record();
  }
  function point(event){var r=canvas.getBoundingClientRect();return{x:(event.clientX-r.left)*width/r.width,y:(event.clientY-r.top)*height/r.height};}
  function slice(a,b){if(state!=='playing')return;for(var i=0;i<fruits.length;i++){var f=fruits[i];if(!f.cut&&core.distanceToSegmentSq(f.x,f.y,a.x,a.y,b.x,b.y)<=f.r*f.r)cut(f);if(state!=='playing')break;}}
  canvas.addEventListener('pointerdown',function(e){if(state!=='playing'||pointers.size>=10||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();var p=point(e);pointers.set(e.pointerId,{last:p,path:[{x:p.x,y:p.y,age:0}]});try{canvas.setPointerCapture(e.pointerId);}catch(ignore){}slice(p,p);});
  canvas.addEventListener('pointermove',function(e){var pointer=pointers.get(e.pointerId);if(!pointer||state!=='playing')return;e.preventDefault();var p=point(e);slice(pointer.last,p);pointer.last=p;pointer.path.push({x:p.x,y:p.y,age:0});if(pointer.path.length>18)pointer.path.shift();});
  function release(e){pointers.delete(e.pointerId);}
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
  canvas.addEventListener('contextmenu',function(e){e.preventDefault();});
  document.querySelectorAll('[data-mode]').forEach(function(button){button.onclick=function(){mode=button.dataset.mode;document.querySelectorAll('[data-mode]').forEach(function(b){b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});$('best').textContent=best();};});
  $('play').onclick=start;$('retry').onclick=start;$('pause').onclick=pause;$('menu-button').onclick=showMenu;
  $('resume').onclick=function(){state='playing';$('dialog').hidden=true;lastTime=performance.now();accumulator=0;};
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(state==='playing')pause();else if(state==='paused')$('resume').click();}if(e.key===' '&&e.target===document.body){e.preventDefault();if(state==='menu')start();else if(state==='playing')pause();}});
  document.addEventListener('visibilitychange',function(){if(document.hidden){if(state==='playing')pause();record();}lastTime=0;accumulator=0;});
  window.addEventListener('pagehide',record);window.addEventListener('resize',resize);
  function step(dt){
    if(learningLocked)return;
    if(state!=='playing')return;
    elapsed+=dt;nextSpawn-=dt;flash=Math.max(0,flash-dt);
    if(elapsed>=4)$('hint').hidden=true;
    if(nextSpawn<=0){
      var count=mode==='garden'?2:2+Math.floor(Math.random()*2);
      if(fruits.length<18){for(var i=0;i<count;i++)launchFruit(Math.floor(Math.random()*6),false);if(mode==='classic'&&elapsed>4&&Math.random()<.4)launchFruit(0,true);}
      nextSpawn=mode==='garden'?1.5:Math.max(.85,1.7-elapsed*.005);
    }
    fruits.forEach(function(f){f.vy+=950*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.angle+=f.spin*dt;if(f.y<height-f.r)f.entered=true;});
    fruits=fruits.filter(function(f){if(f.cut)return false;if(f.entered&&f.y>height+f.r*2){if(mode==='classic'&&!f.bomb){lives=Math.max(0,lives-1);if(lives===0)finish();}return false;}return true;});
    pieces.forEach(function(p){p.vy+=650*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.angle+=p.spin*dt;p.life-=dt;});pieces=pieces.filter(function(p){return p.life>0;});
    drops.forEach(function(p){p.vy+=500*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;});drops=drops.filter(function(p){return p.life>0;});
    rings.forEach(function(r){r.r+=100*dt;r.life-=dt;});rings=rings.filter(function(r){return r.life>0;});
    pointers.forEach(function(p){p.path.forEach(function(v){v.age+=dt;});p.path=p.path.filter(function(v){return v.age<.18;});});
    if(elapsed>comboUntil)$('combo').textContent='';
    refreshHUD();if(mode==='rush'&&elapsed>=60)finish();
  }
  function drawBomb(f){
    circle(ctx,4,8,f.r,'rgba(0,0,0,.17)');var g=ctx.createRadialGradient(-f.r*.35,-f.r*.4,2,0,0,f.r);g.addColorStop(0,'#70757a');g.addColorStop(1,'#242c32');circle(ctx,0,0,f.r,g);
    ctx.strokeStyle='#efbe7b';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-f.r);ctx.quadraticCurveTo(4,-f.r*1.5,20,-f.r*1.2);ctx.stroke();circle(ctx,20,-f.r*1.2,6,'#ffe69c');
    ctx.strokeStyle='#ffbd94';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-f.r*.28,-f.r*.28);ctx.lineTo(f.r*.28,f.r*.28);ctx.moveTo(f.r*.28,-f.r*.28);ctx.lineTo(-f.r*.28,f.r*.28);ctx.stroke();
  }
  function render(now){
    ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(backdrop,0,0);ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
    if(state==='menu'){
      var portrait=width<height,base=portrait?width*.17:height*.115;
      var decorations=portrait?[[.12,.30,0,1],[.87,.48,1,1.1],[.12,.72,4,.85],[.92,.83,2,.7]]:[[.09,.33,0,1.35],[.9,.32,1,1.3],[.14,.8,4,1.1],[.91,.8,2,1.05],[.46,.92,5,.65]];
      decorations.forEach(function(d,i){var r=base*d[3],float=reduced?0:Math.sin(now*.0007+i)*12;ctx.save();ctx.translate(width*d[0],height*d[1]+float);ctx.rotate((i-1.5)*.23);ctx.globalAlpha=.97;ctx.drawImage(sprites[d[2]],-r,-r,r*2,r*2);ctx.restore();});
      if(!reduced)for(var j=0;j<8;j++){var x=(j*149+53)%width,y=(j*197+now*.006)%height;circle(ctx,x,y,2,'rgba(221,248,181,.23)');}
      return;
    }
    drops.forEach(function(p){ctx.globalAlpha=Math.min(1,p.life*2);circle(ctx,p.x,p.y,p.r,p.color);});ctx.globalAlpha=1;
    pieces.forEach(function(p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.globalAlpha=Math.min(1,p.life*2);ctx.beginPath();if(p.side<0)ctx.rect(-p.r*1.3,-p.r*1.3,p.r*1.3,p.r*2.6);else ctx.rect(0,-p.r*1.3,p.r*1.3,p.r*2.6);ctx.clip();ctx.drawImage(slicedSprites[p.type],-p.r*1.3,-p.r*1.3,p.r*2.6,p.r*2.6);ctx.restore();});
    fruits.forEach(function(f){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(f.angle);if(f.bomb)drawBomb(f);else ctx.drawImage(sprites[f.type],-f.r*1.3,-f.r*1.3,f.r*2.6,f.r*2.6);ctx.restore();});
    rings.forEach(function(r){ctx.strokeStyle='rgba(255,242,186,'+r.life+')';ctx.lineWidth=3;ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,Math.PI*2);ctx.stroke();});
    pointers.forEach(function(p){if(p.path.length<2)return;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();p.path.forEach(function(v,i){if(i===0)ctx.moveTo(v.x,v.y);else ctx.lineTo(v.x,v.y);});ctx.strokeStyle='rgba(224,255,177,.2)';ctx.lineWidth=18;ctx.stroke();ctx.strokeStyle='#f6ffd5';ctx.lineWidth=5;ctx.stroke();});
    if(flash>0){ctx.fillStyle='rgba(255,125,80,'+flash*.7+')';ctx.fillRect(0,0,width,height);}
  }
  function frame(now){
    if(learningGate)learningGate.check();
    var dt=lastTime?Math.min(.05,(now-lastTime)/1000):0;lastTime=now;
    accumulator+=dt;while(accumulator>=1/120){step(1/120);accumulator-=1/120;}
    render(now);requestAnimationFrame(frame);
  }
  if(new URLSearchParams(location.search).has('test')){
    Object.defineProperty(window,'fruitDebug',{value:{snapshot:function(){return{state:state,mode:mode,score:score,lives:lives,elapsed:elapsed,width:width,height:height,pointers:pointers.size,sound:sound,particles:drops.length,fruits:fruits.map(function(f){return{id:f.id,x:f.x,y:f.y,r:f.r,bomb:f.bomb};})};}},writable:false});
  }
  var installPrompt=null;
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();installPrompt=e;$('install').hidden=false;});
  $('install').onclick=function(){if(installPrompt){installPrompt.prompt();installPrompt.userChoice.then(function(){installPrompt=null;$('install').hidden=true;});}};
  window.addEventListener('appinstalled',function(){$('install').hidden=true;});
  if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js',{scope:'./',updateViaCache:'none'}).catch(function(){});});
  $('best').textContent=best();resize();requestAnimationFrame(frame);
  learningGate=LearningGate.mount({gameId:'fruit-splash',onLock:function(){
    learningLocked=true;
    pointers.forEach(function(p,id){try{canvas.releasePointerCapture(id);}catch(ignore){}});pointers.clear();
    lastTime=0;accumulator=0;learningAudioWasRunning=!!audio&&audio.state==='running';
    if(learningAudioWasRunning)audio.suspend().catch(function(){});
  },onUnlock:function(){
    learningLocked=false;lastTime=0;accumulator=0;
    if(learningAudioWasRunning&&sound)audio.resume().catch(function(){});
  }});
})();
