const assert = require('node:assert/strict');
const core = require('../core.js');
assert.equal(core.distanceToSegmentSq(5,0,0,0,10,0),0, 'fast swipe crosses center');
assert.equal(core.distanceToSegmentSq(5,3,0,0,10,0),9, 'perpendicular miss');
assert.equal(core.distanceToSegmentSq(15,0,0,0,10,0),25, 'segment end is clamped');
assert.equal(core.distanceToSegmentSq(3,4,0,0,0,0),25, 'stationary pointer');
for (const width of [400,720,1440]) {
  for (const random of [0,.2,.5,.8,.999]) {
    const launch = core.launch(width,900,35,() => random);
    let x=launch.x,y=launch.y,v=launch.vy,minY=y;
    for(let t=0;t<3;t+=1/120){v+=950/120;y+=v/120;x+=launch.vx/120;minY=Math.min(minY,y);if(y<900)assert.ok(x>35&&x<width-35,'fruit stays reachable');}
    assert.ok(minY>150&&minY<500,'fruit reaches visible play area');
    assert.ok(y>900,'fruit falls below screen');
  }
}
console.log('Fruit Splash: swipe collision and launch geometry checks passed.');
