(function () {
  'use strict';
  var paths = {
    home: '<path d="m3 11 9-8 9 8M6 10v10h12V10M10 20v-6h4v6"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3M12 17h.01"/>',
    brush: '<path d="m9 14 9-11 3 3-11 9M10 15c1 6-6 6-7 5 3-1 0-6 7-5Z"/>',
    eraser: '<path d="m3 14 10-11 8 8-9 10H8zM8 9l8 8M12 21h9"/>',
    star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
    flower: '<path d="M12 8c-6-12-14 3-5 5-12 6 4 15 6 5 6 10 14-5 4-6 9-8-7-13-5-4Z"/><circle cx="12" cy="13" r="2"/>',
    heart: '<path d="M12 21S1 14 3 7c2-5 7-4 9 0 2-4 7-5 9 0 2 7-9 14-9 14Z"/>',
    sun: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M1 12h2M21 12h2M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2"/>',
    undo: '<path d="m9 4-6 6 6 6M3 10h11a6 6 0 0 1 0 12"/>',
    redo: '<path d="m15 4 6 6-6 6M21 10H10a6 6 0 0 0 0 12"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    check: '<path d="m4 12 5 5L20 6"/>', close: '<path d="m6 6 12 12M18 6 6 18"/>',
    muted: '<path d="m11 4-6 5H2v6h3l6 5zM16 9l6 6M22 9l-6 6"/>',
    sound: '<path d="m11 4-6 5H2v6h3l6 5zM15 8a6 6 0 0 1 0 8M18 4a11 11 0 0 1 0 16"/>',
    install: '<rect x="5" y="2" width="14" height="20" rx="3"/><path d="M12 6v10m-4-4 4 4 4-4"/>'
  };
  function icon(name) { return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + paths[name] + '</svg>'; }
  document.querySelectorAll('[data-icon]').forEach(function (el) { el.innerHTML = icon(el.dataset.icon); });
  var canvas = document.getElementById('paper'), ctx = canvas.getContext('2d');
  var ink = document.createElement('canvas'), inkCtx = ink.getContext('2d');
  var colors = ['#d46855', '#e89e4b', '#efc65b', '#669978', '#71abbc', '#526e9e', '#9b75a3', '#394a50'];
  var actions = [], undo = [], redo = [], current = null, pointer = null, tool = 'brush', color = colors[0], size = 6, background = 'plain';
  var width = 1, height = 1, enabledSound = false, audio = null, installEvent = null, saveTimer = null, messageTimer = null, raf = 0;
  var STORE = 'little-atelier-drawing-v1', lastFocus = null;
  colors.forEach(function (value, i) {
    var button = document.createElement('button'); button.className = 'swatch' + (i === 0 ? ' active' : ''); button.style.backgroundColor = value;
    button.setAttribute('aria-label', ['Rojo coral','Naranja','Amarillo','Verde','Azul claro','Azul','Violeta','Tinta'][i]); button.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); button.dataset.color = value;
    button.addEventListener('click', function () { color = value; select('#palette button', button); }); document.getElementById('palette').appendChild(button);
  });
  function select(selector, button) { document.querySelectorAll(selector).forEach(function (b) { var selected = b === button; b.classList.toggle('active', selected); b.setAttribute('aria-pressed', String(selected)); }); }
  function snapshot() { return { actions: actions.slice(), background: background }; }
  function remember() { undo.push(snapshot()); if (undo.length > 24) undo.shift(); redo = []; }
  function restoreSnapshot(value) { actions = value.actions.slice(); background = value.background; sync(); schedule(); persist(); }
  function sync() {
    document.getElementById('undo').disabled = !undo.length; document.getElementById('redo').disabled = !redo.length;
    document.getElementById('paper-tip').hidden = !!actions.length || !!current;
    select('#backgrounds button', document.querySelector('[data-background="' + background + '"]'));
  }
  function ping() {
    if (!enabledSound) return;
    try { var Audio = window.AudioContext || window.webkitAudioContext; audio = audio || new Audio(); if (audio.state === 'suspended') audio.resume();
      var oscillator = audio.createOscillator(), gain = audio.createGain(); oscillator.type = 'sine'; oscillator.frequency.value = 620; gain.gain.setValueAtTime(.035, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .15); oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .15);
    } catch (e) { /* Sound is optional. */ }
  }
  function notice(message) { clearTimeout(messageTimer); document.getElementById('saved').textContent = message; messageTimer = setTimeout(function () { document.getElementById('saved').textContent = ''; }, 2100); }
  function flushSave() {
    clearTimeout(saveTimer);
      try { localStorage.setItem(STORE, JSON.stringify({version:1, background:background, actions:actions})); document.getElementById('save-indicator').innerHTML = icon('check'); }
      catch (e) { document.getElementById('save-indicator').innerHTML = icon('download'); notice('Guarda tu dibujo con ↓'); }
  }
  function persist() {
    clearTimeout(saveTimer); saveTimer = setTimeout(flushSave, 120);
  }
  function point(event) { var r = canvas.getBoundingClientRect(); return { x: Math.max(0, Math.min(1, (event.clientX-r.left)/r.width)), y: Math.max(0, Math.min(1, (event.clientY-r.top)/r.height)) }; }
  function commit() {
    if (!current) return;
    remember(); actions = AtelierCore.bounded(actions.concat([current])); current = null; pointer = null; sync(); schedule(); persist(); ping();
  }
  canvas.addEventListener('pointerdown', function (event) {
    if (pointer !== null || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault(); pointer = event.pointerId; canvas.setPointerCapture(event.pointerId);
    current = { tool:tool, color:color, size:size, points:[point(event)] }; sync(); schedule();
  });
  canvas.addEventListener('pointermove', function (event) {
    if (event.pointerId !== pointer || !current || ['brush','eraser'].indexOf(current.tool) < 0) return;
    var p = point(event), last = current.points[current.points.length-1];
    if (Math.abs(p.x-last.x)*width + Math.abs(p.y-last.y)*height < 1) return;
    if (current.points.length < 2048) current.points.push(p); else current.points[current.points.length-1] = p;
    schedule();
  });
  canvas.addEventListener('pointerup', function (event) { if (event.pointerId === pointer) commit(); });
  canvas.addEventListener('pointercancel', function (event) { if (event.pointerId === pointer) commit(); });
  canvas.addEventListener('lostpointercapture', function (event) { if (event.pointerId === pointer) commit(); });
  function star(c, x, y, radius, fill) {
    c.beginPath(); for (var i = 0; i < 10; i++) { var angle = -Math.PI/2 + i*Math.PI/5, r = i%2 ? radius*.46 : radius; if (!i) c.moveTo(x+Math.cos(angle)*r,y+Math.sin(angle)*r); else c.lineTo(x+Math.cos(angle)*r,y+Math.sin(angle)*r); } c.closePath(); c.fillStyle=fill; c.fill();
  }
  function flower(c, x, y, r, fill) {
    c.fillStyle=fill; for (var i=0;i<5;i++) { var a=i*Math.PI*2/5; c.beginPath(); c.ellipse(x+Math.cos(a)*r*.52,y+Math.sin(a)*r*.52,r*.48,r*.39,a,0,Math.PI*2); c.fill(); } c.fillStyle='#f5ce70'; c.beginPath();c.arc(x,y,r*.28,0,Math.PI*2);c.fill();
  }
  function stamp(c, action) {
    var p=action.points[0],x=p.x*width,y=p.y*height,r=(action.size+18)*Math.min(width,height)/350;
    r=Math.max(12,r); c.fillStyle=action.color;c.strokeStyle=action.color;
    if(action.tool==='star') star(c,x,y,r,action.color);
    if(action.tool==='flower') flower(c,x,y,r,action.color);
    if(action.tool==='heart'){c.beginPath();c.moveTo(x,y+r*.9);c.bezierCurveTo(x-r*1.7,y-r*.1,x-r*.7,y-r*1.4,x,y-r*.5);c.bezierCurveTo(x+r*.7,y-r*1.4,x+r*1.7,y-r*.1,x,y+r*.9);c.fill();}
    if(action.tool==='sun'){c.beginPath();c.arc(x,y,r*.55,0,Math.PI*2);c.fill();c.lineWidth=r*.12;c.lineCap='round';for(var i=0;i<8;i++){var a=i*Math.PI/4;c.beginPath();c.moveTo(x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8);c.lineTo(x+Math.cos(a)*r*1.05,y+Math.sin(a)*r*1.05);c.stroke();}}
  }
  function base() {
    ctx.fillStyle=background==='night'?'#253d60':background==='garden'?'#e4f0e8':'#fffdfa';ctx.fillRect(0,0,width,height);
    if(background==='dots'){ctx.fillStyle='#d9dddd';for(var x=16;x<width;x+=24)for(var y=16;y<height;y+=24){ctx.beginPath();ctx.arc(x,y,1,0,Math.PI*2);ctx.fill();}}
    if(background==='garden'){
      ctx.fillStyle='#b9d09b';ctx.beginPath();ctx.moveTo(0,height);ctx.lineTo(0,height*.85);ctx.quadraticCurveTo(width*.25,height*.65,width*.55,height*.91);ctx.quadraticCurveTo(width*.8,height*.68,width,height*.82);ctx.lineTo(width,height);ctx.fill();
      for(var n=0;n<8;n++)flower(ctx,(n+.4)*width/8,height*(.89+(n%3)*.025),Math.max(6,height*.025),n%2?'#d79eaa':'#f9f7de');
      ctx.fillStyle='#f4d584';ctx.beginPath();ctx.arc(width*.85,height*.16,Math.max(18,height*.07),0,Math.PI*2);ctx.fill();
    }
    if(background==='night'){
      for(var j=0;j<28;j++)star(ctx,((j*137+29)%997)/997*width,((j*79+23)%701)/701*height,2+(j%3),'#f8e4b0');
      ctx.fillStyle='#f8e4b0';ctx.beginPath();ctx.arc(width*.82,height*.2,height*.095,0,Math.PI*2);ctx.fill();ctx.fillStyle='#253d60';ctx.beginPath();ctx.arc(width*.82+height*.035,height*.2-height*.025,height*.09,0,Math.PI*2);ctx.fill();
    }
  }
  function render() {
    raf=0; ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);var ratio=canvas.width/width;ctx.setTransform(ratio,0,0,ratio,0,0);base();
    inkCtx.setTransform(1,0,0,1,0,0);inkCtx.clearRect(0,0,ink.width,ink.height);inkCtx.setTransform(ratio,0,0,ratio,0,0);
    var all=current?actions.concat([current]):actions;
    all.forEach(function (a) { inkCtx.globalCompositeOperation=a.tool==='eraser'?'destination-out':'source-over';inkCtx.strokeStyle=a.color;inkCtx.fillStyle=a.color;
      if(a.tool==='brush'||a.tool==='eraser')AtelierCore.stroke(inkCtx,a.points,width,height,a.size*Math.min(width,height)/350);else stamp(inkCtx,a);
    }); inkCtx.globalCompositeOperation='source-over';ctx.drawImage(ink,0,0,ink.width,ink.height,0,0,width,height);
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(render);}
  function resize(){var r=canvas.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);var dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ink.width=canvas.width;ink.height=canvas.height;schedule();}
  document.querySelectorAll('[data-tool]').forEach(function(b){b.addEventListener('click',function(){commit();tool=b.dataset.tool;select('[data-tool]',b);});});
  document.querySelectorAll('[data-size]').forEach(function(b){b.addEventListener('click',function(){commit();size=Number(b.dataset.size);select('[data-size]',b);});});
  document.querySelectorAll('[data-background]').forEach(function(b){b.addEventListener('click',function(){commit();if(background===b.dataset.background)return;remember();background=b.dataset.background;sync();schedule();persist();});});
  document.getElementById('undo').addEventListener('click',function(){commit();if(!undo.length)return;redo.push(snapshot());restoreSnapshot(undo.pop());});
  document.getElementById('redo').addEventListener('click',function(){commit();if(!redo.length)return;undo.push(snapshot());restoreSnapshot(redo.pop());});
  function show(id){commit();lastFocus=document.activeElement;document.getElementById(id).hidden=false;document.getElementById(id).querySelector('button').focus();}
  function hide(id){document.getElementById(id).hidden=true;if(lastFocus)lastFocus.focus();}
  document.getElementById('clear').onclick=function(){show('clear-dialog');};document.getElementById('cancel-clear').onclick=function(){hide('clear-dialog');};
  document.getElementById('confirm-clear').onclick=function(){remember();actions=[];sync();schedule();persist();hide('clear-dialog');};
  document.getElementById('help').onclick=function(){show('help-dialog');};document.getElementById('close-help').onclick=function(){hide('help-dialog');};
  document.getElementById('sound').onclick=function(){enabledSound=!enabledSound;this.innerHTML=icon(enabledSound?'sound':'muted');this.setAttribute('aria-label',enabledSound?'Desactivar sonido':'Activar sonido');this.setAttribute('aria-pressed',String(enabledSound));ping();};
  document.getElementById('download').onclick=function(){commit();render();canvas.toBlob(function(blob){if(!blob){notice('No se pudo exportar');return;}var url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='mi-pequeno-atelier.png';document.body.appendChild(link);link.click();link.remove();setTimeout(function(){URL.revokeObjectURL(url);},10000);notice('✓');},'image/png');};
  window.addEventListener('keydown',function(e){var dialog=document.querySelector('.overlay:not([hidden])');if(dialog){if(e.key==='Escape')hide(dialog.id);if(e.key==='Tab'){var buttons=dialog.querySelectorAll('button,a[href]'),first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}return;}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();document.getElementById(e.shiftKey?'redo':'undo').click();}});
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();installEvent=e;});document.getElementById('install').onclick=function(){if(installEvent){installEvent.prompt();installEvent=null;}else document.getElementById('install-help').hidden=false;};
  try{var raw=localStorage.getItem(STORE);if(raw&&raw.length<2000000){var saved=JSON.parse(raw);if(AtelierCore.validSave(saved)){actions=saved.actions;background=saved.background;}}}catch(e){/* An empty canvas remains playable when storage is unavailable. */}
  window.addEventListener('resize',resize);if(window.ResizeObserver)new ResizeObserver(resize).observe(canvas.parentNode);
  document.addEventListener('visibilitychange',function(){if(document.hidden){if(current)commit();flushSave();}});
  window.addEventListener('pagehide',function(){if(current)commit();flushSave();});
  sync();resize();
  if('serviceWorker'in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});
  if(new URLSearchParams(location.search).get('test')==='1')window.__atelier={read:function(){return JSON.parse(JSON.stringify({actions:actions,background:background,undo:undo.length,redo:redo.length,sound:enabledSound}));}};
}());
