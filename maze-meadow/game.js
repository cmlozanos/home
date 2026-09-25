(function () {
  'use strict';
  if (!window.LearningGate) { document.body.textContent = '↻ Recarga para cargar el reto'; return; }
  var learningLocked = true, learningTimers = LearningGate.createTimers(), learningAudioWasRunning = false, learningPausedAt = 0;
  var paths={home:'<path d="m3 11 9-8 9 8M6 10v10h12V10M10 20v-6h4v6"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3M12 17h.01"/>',up:'<path d="m5 14 7-7 7 7M12 7v14"/>',down:'<path d="m5 10 7 7 7-7M12 17V3"/>',left:'<path d="m14 5-7 7 7 7M7 12h14"/>',right:'<path d="m10 5 7 7-7 7M17 12H3"/>',reset:'<path d="M3 4v6h6M3 10a9 9 0 1 1 0 6"/>',hint:'<path d="M8 15C1 9 7 2 12 3c7-1 11 7 4 12v4H8zM9 22h6M12 7v5M3 3l2 2M21 3l-2 2"/>',shuffle:'<path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 3-2 4-4M14 8c1-2 3-2 7-2m-4-4 4 4-4 4"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',muted:'<path d="m11 4-6 5H2v6h3l6 5zM16 9l6 6M22 9l-6 6"/>',sound:'<path d="m11 4-6 5H2v6h3l6 5zM15 8a6 6 0 0 1 0 8M18 4a11 11 0 0 1 0 16"/>',install:'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M12 6v10m-4-4 4 4 4-4"/>'};
  function icon(name){return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>';}
  function starIcon(extra){return '<svg aria-hidden="true" class="'+(extra||'')+'" viewBox="0 0 24 24"><path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>';}
  document.querySelectorAll('[data-icon]').forEach(function(el){el.innerHTML=icon(el.dataset.icon);});
  var canvas=document.getElementById('maze'),ctx=canvas.getContext('2d'),Core=MeadowCore;
  var size=4,round=0,completed=0,position=0,maze=null,stars=[],collected=[],hint=false,won=false,pointer=null,raf=0;
  var width=1,height=1,originX=0,originY=0,cell=1,drawPosition={x:0,y:0},animation=null,shakeUntil=0;
  var sound=false,audio=null,installEvent=null,lastFocus=null,winTimer=null;
  var STORE='maze-meadow-progress-v1';
  try{var saved=JSON.parse(localStorage.getItem(STORE));if(saved&&[4,6,8].indexOf(saved.size)>=0&&Number.isInteger(saved.round)&&saved.round>=0&&saved.round<100000&&Number.isInteger(saved.completed)&&saved.completed>=0){size=saved.size;round=saved.round;completed=Math.min(100000,saved.completed);}}catch(e){/* Play remains available without storage. */}
  function save(){try{localStorage.setItem(STORE,JSON.stringify({version:1,size:size,round:round,completed:completed}));}catch(e){/* Progress is session-only when storage is unavailable. */}}
  function announce(text){document.getElementById('announcement').textContent=text;}
  function beep(win){if(learningLocked||!sound)return;try{var Audio=window.AudioContext||window.webkitAudioContext;audio=audio||new Audio();if(audio.state==='suspended')audio.resume();var osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(win?520:420,audio.currentTime);if(win)osc.frequency.setValueAtTime(780,audio.currentTime+.12);gain.gain.setValueAtTime(.04,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.24);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.25);}catch(e){}}
  function sync(){document.getElementById('route-number').textContent=round+1;document.getElementById('progress').textContent=completed?'✓ '+completed:'';document.querySelectorAll('[data-size]').forEach(function(b){var active=Number(b.dataset.size)===size;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});document.getElementById('stars').innerHTML=stars.map(function(p){return starIcon(collected.indexOf(p)>=0?'collected':'');}).join('');document.getElementById('stars').setAttribute('aria-label',collected.length+' de '+stars.length+' estrellas');document.getElementById('hint').setAttribute('aria-pressed',String(hint));}
  function start(newRound){learningTimers.clear(winTimer);if(newRound)round++;maze=Core.generate(size,71919+round*7919+size*97);position=0;won=false;collected=[];hint=false;animation=null;drawPosition={x:0,y:0};shakeUntil=0;document.getElementById('win').hidden=true;
    var path=Core.solve(maze,0,size*size-1);stars=[];for(var i=1;i<=3;i++){var p=path[Math.floor((path.length-1)*i/4)];if(p!==0&&p!==size*size-1&&stars.indexOf(p)<0)stars.push(p);}
    sync();save();schedule();announce('Laberinto '+(round+1)+'. Busca la zanahoria.');
  }
  function move(direction){if(learningLocked||won||!document.getElementById('help-dialog').hidden)return;var next=Core.move(maze,position,direction);if(next===position){shakeUntil=performance.now()+140;schedule();announce('Hay un seto. Prueba otro camino.');return;}
    animation={from:{x:drawPosition.x,y:drawPosition.y},to:{x:next%size,y:Math.floor(next/size)},start:performance.now()};position=next;
    if(stars.indexOf(position)>=0&&collected.indexOf(position)<0){collected.push(position);beep(false);}
    if(position===size*size-1){won=true;completed++;save();beep(true);document.getElementById('win-stars').innerHTML=stars.map(function(p){return starIcon(collected.indexOf(p)<0?'empty':'');}).join('');winTimer=learningTimers.set(function(){document.getElementById('win').hidden=false;document.getElementById('next').focus();},260);announce('¡Laberinto completado!');}
    sync();schedule();
  }
  function circle(x,y,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
  function star(x,y,r){ctx.fillStyle='#e9bb58';ctx.strokeStyle='#c79845';ctx.lineWidth=1.2;ctx.beginPath();for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.48:r;if(!i)ctx.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);else ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();ctx.fill();ctx.stroke();}
  function carrot(x,y,r){ctx.save();ctx.translate(x,y);ctx.rotate(.45);ctx.fillStyle='#e69c54';ctx.beginPath();ctx.moveTo(-r*.38,-r*.32);ctx.quadraticCurveTo(-r*.6,r*.1,0,r*.82);ctx.quadraticCurveTo(r*.6,r*.1,r*.38,-r*.32);ctx.closePath();ctx.fill();ctx.strokeStyle='#c68142';ctx.lineWidth=r*.09;ctx.beginPath();ctx.moveTo(-r*.3,-r*.05);ctx.lineTo(r*.1,.02*r);ctx.moveTo(r*.24,r*.28);ctx.lineTo(0,r*.24);ctx.stroke();ctx.fillStyle='#6d9466';for(var i=-1;i<=1;i++){ctx.beginPath();ctx.ellipse(i*r*.2,-r*.6,r*.12,r*.4,i*.65,0,Math.PI*2);ctx.fill();}ctx.restore();}
  function rabbit(x,y,r,time){ctx.save();ctx.translate(x,y+(time<shakeUntil?Math.sin(time*.1)*2:0));circle(0,r*.25,r*.53,'#d3cfb85c');ctx.fillStyle='#f4ead4';ctx.strokeStyle='#bcb69d';ctx.lineWidth=Math.max(1,r*.035);ctx.beginPath();ctx.ellipse(-r*.24,-r*.49,r*.17,r*.48,-.22,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(r*.24,-r*.49,r*.17,r*.48,.22,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#deb6a6';ctx.beginPath();ctx.ellipse(-r*.24,-r*.5,r*.065,r*.29,-.22,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(r*.24,-r*.5,r*.065,r*.29,.22,0,Math.PI*2);ctx.fill();circle(0,r*.02,r*.48,'#f4ead4');circle(-r*.19,-r*.02,r*.05,'#405448');circle(r*.19,-r*.02,r*.05,'#405448');circle(-r*.3,r*.15,r*.09,'#e8bca8');circle(r*.3,r*.15,r*.09,'#e8bca8');ctx.fillStyle='#b98375';ctx.beginPath();ctx.moveTo(-r*.08,r*.13);ctx.lineTo(r*.08,r*.13);ctx.lineTo(0,r*.22);ctx.fill();ctx.restore();}
  function render(time){raf=0;if(learningLocked)return;time=time||performance.now();var ratio=canvas.width/width;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.setTransform(ratio,0,0,ratio,0,0);var pad=Math.max(10,Math.min(width,height)*.045);cell=Math.min((width-pad*2)/size,(height-pad*2)/size);originX=(width-cell*size)/2;originY=(height-cell*size)/2;
    ctx.fillStyle='#f0e9cf';ctx.fillRect(originX,originY,cell*size,cell*size);
    for(var n=0;n<size*size;n++){var xx=originX+n%size*cell,yy=originY+Math.floor(n/size)*cell;if((n%size+Math.floor(n/size))%2===0){ctx.fillStyle='#f5eed9';ctx.fillRect(xx,yy,cell,cell);}circle(xx+cell*.18,yy+cell*.7,Math.max(.6,cell*.015),'#d4ccb34f');}
    if(hint){var path=Core.solve(maze,position,size*size-1);ctx.strokeStyle='#dca956';ctx.lineWidth=Math.max(3,cell*.075);ctx.lineCap='round';ctx.lineJoin='round';ctx.setLineDash([Math.max(2,cell*.05),Math.max(4,cell*.14)]);ctx.beginPath();path.forEach(function(p,i){var x=originX+(p%size+.5)*cell,y=originY+(Math.floor(p/size)+.5)*cell;if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();ctx.setLineDash([]);}
    stars.forEach(function(p){if(collected.indexOf(p)<0)star(originX+(p%size+.5)*cell,originY+(Math.floor(p/size)+.5)*cell,cell*.19);});
    ctx.lineCap='round';ctx.lineJoin='round';
    function walls(stroke,line,offset){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.beginPath();maze.cells.forEach(function(w,n){var x=originX+(n%size)*cell,y=originY+Math.floor(n/size)*cell+offset;if(w[0]){ctx.moveTo(x,y);ctx.lineTo(x+cell,y);}if(w[3]){ctx.moveTo(x,y);ctx.lineTo(x,y+cell);}if(n%size===size-1&&w[1]){ctx.moveTo(x+cell,y);ctx.lineTo(x+cell,y+cell);}if(n>=size*(size-1)&&w[2]){ctx.moveTo(x,y+cell);ctx.lineTo(x+cell,y+cell);}});ctx.stroke();}
    var hedge=Math.max(4,Math.min(10,cell*.13));walls('#6b865b',hedge+2,2);walls('#8ba873',hedge,0);walls('#a0bb87',Math.max(1,hedge*.27),-1);
    carrot(originX+(size-.5)*cell,originY+(size-.5)*cell,cell*.42);
    if(animation){var t=Math.min(1,(time-animation.start)/100),ease=1-(1-t)*(1-t);drawPosition.x=animation.from.x+(animation.to.x-animation.from.x)*ease;drawPosition.y=animation.from.y+(animation.to.y-animation.from.y)*ease;if(t>=1)animation=null;}
    rabbit(originX+(drawPosition.x+.5)*cell,originY+(drawPosition.y+.54)*cell,cell*.44,time);
    if(animation||time<shakeUntil)schedule();
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(render);}
  function resize(){var r=canvas.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);var dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);schedule();}
  canvas.addEventListener('pointerdown',function(e){if(pointer||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();canvas.setPointerCapture(e.pointerId);pointer={id:e.pointerId,x:e.clientX,y:e.clientY};});
  canvas.addEventListener('pointerup',function(e){if(!pointer||pointer.id!==e.pointerId)return;var start=pointer;pointer=null;var dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.max(Math.abs(dx),Math.abs(dy))>18){move(Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0));return;}var r=canvas.getBoundingClientRect(),x=Math.floor((e.clientX-r.left-originX)/cell),y=Math.floor((e.clientY-r.top-originY)/cell);if(x<0||y<0||x>=size||y>=size)return;dx=x-position%size;dy=y-Math.floor(position/size);if(Math.abs(dx)+Math.abs(dy)===1)move(dx===1?1:dx===-1?3:dy===1?2:0);});
  canvas.addEventListener('pointercancel',function(){pointer=null;});canvas.addEventListener('lostpointercapture',function(){pointer=null;});
  document.querySelectorAll('[data-direction]').forEach(function(b){b.onclick=function(){move(Number(b.dataset.direction));};});
  document.querySelectorAll('[data-size]').forEach(function(b){b.onclick=function(){size=Number(b.dataset.size);start(false);};});
  document.getElementById('reset').onclick=function(){start(false);};document.getElementById('new-maze').onclick=function(){start(true);};
  document.getElementById('hint').onclick=function(){hint=!hint;sync();schedule();};document.getElementById('next').onclick=function(){start(true);canvas.focus();};
  document.getElementById('help').onclick=function(){lastFocus=document.activeElement;document.getElementById('help-dialog').hidden=false;document.getElementById('close-help').focus();};
  function closeHelp(){document.getElementById('help-dialog').hidden=true;if(lastFocus)lastFocus.focus();}
  document.getElementById('close-help').onclick=closeHelp;
  document.getElementById('sound').onclick=function(){sound=!sound;this.innerHTML=icon(sound?'sound':'muted');this.setAttribute('aria-label',sound?'Desactivar sonido':'Activar sonido');this.setAttribute('aria-pressed',String(sound));beep(false);};
  window.addEventListener('keydown',function(e){var dialog=document.querySelector('.overlay:not([hidden])');if(dialog){if(e.key==='Escape'&&dialog.id==='help-dialog')closeHelp();if(e.key==='Tab'){var controls=dialog.querySelectorAll('button,a[href]'),first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}return;}var keys={ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3,w:0,d:1,s:2,a:3};if(keys[e.key]!==undefined){e.preventDefault();move(keys[e.key]);}});
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();installEvent=e;});document.getElementById('install').onclick=function(){if(installEvent){installEvent.prompt();installEvent=null;}else document.getElementById('install-help').hidden=false;};
  window.addEventListener('resize',resize);if(window.ResizeObserver)new ResizeObserver(resize).observe(canvas.parentNode);start(false);resize();
  if('serviceWorker'in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});
  if(new URLSearchParams(location.search).get('test')==='1')window.__meadow={read:function(){return JSON.parse(JSON.stringify({size:size,round:round,position:position,cells:maze.cells,stars:stars,collected:collected,path:Core.solve(maze,position,size*size-1),won:won,completed:completed,hint:hint,sound:sound,geometry:{x:originX,y:originY,cell:cell}}));}};
  LearningGate.mount({gameId:'maze-meadow',onLock:function(){
    learningLocked=true;learningPausedAt=performance.now();learningTimers.pause();
    if(pointer){try{canvas.releasePointerCapture(pointer.id);}catch(ignore){}pointer=null;}
    learningAudioWasRunning=!!audio&&audio.state==='running';
    if(learningAudioWasRunning)audio.suspend().catch(function(){});
  },onUnlock:function(){
    var duration=performance.now()-learningPausedAt;
    if(animation)animation.start+=duration;
    if(shakeUntil)shakeUntil+=duration;
    learningLocked=false;learningTimers.resume();schedule();
    if(learningAudioWasRunning&&sound)audio.resume().catch(function(){});
  }});
}());
