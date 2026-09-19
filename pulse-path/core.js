/* Original fixed-step runner. rectsOverlap adapted from Konatsu13 (MIT), see CREDITS.md. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.PulseCore=api;}(typeof window!=='undefined'?window:null,function(){
  'use strict';
  var SIZE=30,STEP=1/120;
  function rectsOverlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
  function triangleHit(rect,triangle){
    if(!rectsOverlap(rect,{x:triangle.x,y:-triangle.h,w:triangle.w,h:triangle.h}))return false;
    var points=[[triangle.x,0],[triangle.x+triangle.w/2,-triangle.h],[triangle.x+triangle.w,0]],corners=[[rect.x,rect.y],[rect.x+rect.w,rect.y],[rect.x+rect.w,rect.y+rect.h],[rect.x,rect.y+rect.h]];
    var axes=[[1,0],[0,1],[triangle.h,triangle.w/2],[-triangle.h,triangle.w/2]];
    return axes.every(function(axis){function range(list){var values=list.map(function(p){return p[0]*axis[0]+p[1]*axis[1];});return [Math.min.apply(null,values),Math.max.apply(null,values)];}var a=range(points),b=range(corners);return a[0]<b[1]&&b[0]<a[1];});
  }
  var levels=[
    {name:'Aurora',icon:'🌅',color:'#66efdc',accent:'#ffca75',length:3100,checkpoints:[0,1030,2150],portals:[],obstacles:[['spike',480,32,30],['spike',820,36,34],['block',1240,45,32],['gap',1570,65,0],['spike',1910,42,34],['block',2350,48,36],['gap',2720,70,0]]},
    {name:'Órbita',icon:'🪐',color:'#b3a0ff',accent:'#8eeafa',length:3900,checkpoints:[0,1050,2420],portals:[{x:1130,gravity:1000,icon:'☾'},{x:2590,gravity:1300,icon:'☀'}],obstacles:[['gap',500,64,0],['block',850,48,34],['spike',1400,44,36],['gap',1820,84,0],['block',2200,50,40],['spike',2840,36,34],['gap',3200,72,0],['spike',3540,42,35]]},
    {name:'Prisma',icon:'💎',color:'#ff92c9',accent:'#f4e887',length:4600,checkpoints:[0,1120,2530,3720],portals:[{x:1210,gravity:1000,icon:'☾'},{x:2680,gravity:1300,icon:'☀'}],obstacles:[['block',500,48,36],['gap',850,68,0],['spike',1460,44,38],['gap',1870,86,0],['block',2240,60,42],['gap',2930,72,0],['spike',3290,45,35],['block',3930,48,36],['spike',4280,42,35]]}
  ];
  levels.forEach(function(level){level.obstacles=level.obstacles.map(function(o){return {type:o[0],x:o[1],w:o[2],h:o[3]};});level.stars=level.obstacles.map(function(o,i){return {x:o.x+o.w/2,y:70+(i%2)*12};});});
  function create(levelIndex,difficulty){return {level:Math.max(0,Math.min(2,levelIndex||0)),difficulty:difficulty==='normal'?'normal':'easy',x:30,y:0,vy:0,t:0,rotation:0,grounded:true,gravity:1300,status:'playing',checkpoint:0,buffer:0,stars:[],jumps:0};}
  function restore(state){var next=create(state.level,state.difficulty);next.x=state.checkpoint+30;next.checkpoint=state.checkpoint;next.stars=state.stars.slice();levels[next.level].portals.forEach(function(p){if(next.x>p.x)next.gravity=p.gravity;});return next;}
  function speed(state){return state.difficulty==='normal'?220:170;}
  function imminent(state){var ahead=levels[state.level].obstacles;for(var i=0;i<ahead.length;i++){var o=ahead[i];if(o.x+o.w<state.x)continue;return o.x-(state.x+SIZE)<45;}return false;}
  function step(s,dt,input){
    if(s.status!=='playing')return [];
    input=input||{};var events=[],level=levels[s.level],oldX=s.x,oldY=s.y;
    s.t+=dt;s.buffer=input.jump ? .14 : Math.max(0,s.buffer-dt);
    if(s.grounded&&(s.buffer>0||(input.held&&input.repeat)||input.assist&&imminent(s))){s.vy=500;s.grounded=false;s.buffer=0;s.jumps++;events.push('jump');}
    s.x+=speed(s)*dt;s.vy-=s.gravity*dt;s.y+=s.vy*dt;
    level.portals.forEach(function(p){if(oldX<p.x&&s.x>=p.x){s.gravity=p.gravity;events.push('portal');}});
    var ground=0;
    level.obstacles.forEach(function(o){if(o.type==='gap'&&s.x+SIZE*.5>o.x&&s.x+SIZE*.5<o.x+o.w)ground=-Infinity;if(o.type==='block'&&s.x+SIZE-4>o.x&&s.x+4<o.x+o.w&&oldY>=o.h-.5)ground=Math.max(ground,o.h);});
    if(s.y<=ground&&s.vy<=0){s.y=ground;s.vy=0;s.grounded=true;s.rotation=Math.round(s.rotation/(Math.PI/2))*Math.PI/2;}else s.grounded=false;
    if(!s.grounded)s.rotation+=6*dt;
    var rect={x:s.x+5,y:-s.y-SIZE+5,w:SIZE-10,h:SIZE-8};
    level.obstacles.forEach(function(o){if(o.type==='spike'&&triangleHit(rect,o)||o.type==='block'&&rectsOverlap(rect,{x:o.x,y:-o.h,w:o.w,h:o.h})){s.status='crashed';}});
    if(s.y < -140)s.status='crashed';
    level.checkpoints.forEach(function(x){if(s.x>=x&&s.grounded&&x>s.checkpoint)s.checkpoint=x;});
    level.stars.forEach(function(star,i){if(s.stars.indexOf(i)<0&&Math.abs(s.x+SIZE/2-star.x)<30&&Math.abs(s.y+SIZE/2-star.y)<36){s.stars.push(i);events.push('star');}});
    if(s.status==='crashed')events.push('crash');
    if(s.x>=level.length&&s.status==='playing'){s.status='won';events.push('win');}
    return events;
  }
  return {SIZE:SIZE,STEP:STEP,levels:levels,create:create,restore:restore,step:step,speed:speed,rectsOverlap:rectsOverlap,triangleHit:triangleHit};
}));
