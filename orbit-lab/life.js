/* Original, deliberately accelerated game model; times and flux are not astrophysical units. */
(function(root){
  'use strict';
  var STAGES=['○','🌱','🐾','🌾','⚙','⚛','🚀'];
  function luminous(b){return ['red-dwarf','star','white-star','blue-star','red-giant','supergiant','mega-giant'].indexOf(b.type)!==-1;}
  function luminosity(b){return Math.pow(b.mass/30,1.8)*(['red-giant','supergiant','mega-giant'].indexOf(b.type)!==-1?2:1);}
  function climate(b,bodies){
    var flux=0;
    bodies.forEach(function(s){if(s!==b&&luminous(s)){var d2=(b.x-s.x)*(b.x-s.x)+(b.y-s.y)*(b.y-s.y);flux+=luminosity(s)*32400/Math.max(100,d2);}});
    return {flux:flux,habitable:flux>=.6&&flux<=1.65,state:flux<.6?'cold':flux>1.65?'hot':'water'};
  }
  function step(bodies,ships,dt,onEvent){
    bodies.forEach(function(b){
      if(b.type!=='ocean'&&b.type!=='rock'){b.lifeStage=0;b.habitableTime=0;return;}
      var c=climate(b,bodies),old=b.lifeStage||0;b.climate=c.state;
      b.habitableTime=Math.max(0,Math.min(56,(b.habitableTime||0)+(c.habitable?dt:-dt*3)));
      b.lifeStage=Math.min(6,Math.floor(b.habitableTime/8));
      if(b.lifeStage>old&&onEvent)onEvent(b,{kind:'life',stage:b.lifeStage});
      b.launchCooldown=Math.max(0,(b.launchCooldown||0)-dt);
      if(b.lifeStage===6&&b.launchCooldown===0&&ships.length<8){
        var target=null,best=Infinity;
        bodies.forEach(function(t){if(t!==b&&(t.type==='ocean'||t.type==='rock')&&(t.lifeStage||0)<2&&climate(t,bodies).habitable){var d=(t.x-b.x)*(t.x-b.x)+(t.y-b.y)*(t.y-b.y);if(d<best){best=d;target=t;}}});
        if(target){ships.push({x:b.x,y:b.y,targetId:target.id,age:0});b.launchCooldown=15;if(onEvent)onEvent(b,{kind:'launch'});}
      }
    });
    for(var i=ships.length-1;i>=0;i--){
      var ship=ships[i],target=bodies.find(function(b){return b.id===ship.targetId;});ship.age+=dt;
      if(!target||(target.type!=='ocean'&&target.type!=='rock')||ship.age>40){ships.splice(i,1);continue;}
      var dx=target.x-ship.x,dy=target.y-ship.y,d=Math.sqrt(dx*dx+dy*dy);ship.angle=Math.atan2(dy,dx);
      if(d<target.radius+4){if(climate(target,bodies).habitable){target.habitableTime=Math.max(16,target.habitableTime||0);target.lifeStage=Math.max(2,target.lifeStage||0);if(onEvent)onEvent(target,{kind:'colony'});}ships.splice(i,1);continue;}
      var move=Math.min(d,75*dt);ship.x+=dx/d*move;ship.y+=dy/d*move;
    }
  }
  root.OrbitLife={step:step,climate:climate,luminous:luminous,luminosity:luminosity,stages:STAGES};
})(typeof window!=='undefined'?window:globalThis);
