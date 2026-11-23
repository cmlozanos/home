const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const Core=require('../core.js');const root=path.resolve(__dirname,'..');
let checks=0;
for(const size of [4,6,8])for(let seed=0;seed<100;seed++){
  const maze=Core.generate(size,seed);assert.deepEqual(maze,Core.generate(size,seed),'deterministic');
  let passages=0;const reachable=new Set([0]),queue=[0];
  for(let i=0;i<queue.length;i++){for(let d=0;d<4;d++){const next=Core.move(maze,queue[i],d);if(next!==queue[i]&&!reachable.has(next)){reachable.add(next);queue.push(next);}}}
  assert.equal(reachable.size,size*size,'every cell reachable');
  maze.cells.forEach((walls,p)=>walls.forEach((closed,d)=>{const next=Core.move(maze,p,d);if(closed)assert.equal(next,p,'walls block');else{assert.equal(maze.cells[next][(d+2)%4],false,'reciprocal passage');passages++;}}));
  assert.equal(passages/2,size*size-1,'perfect maze has n-1 passages');
  const route=Core.solve(maze,0,size*size-1);assert.equal(route[0],0);assert.equal(route[route.length-1],size*size-1);
  for(let i=1;i<route.length;i++)assert([0,1,2,3].some(d=>Core.move(maze,route[i-1],d)===route[i]),'hint route uses legal moves');checks++;
}
assert.equal(Core.generate(999,1).cells.length,256);
for(const file of ['core.js','game.js','sw.js']){const source=fs.readFileSync(path.join(root,file),'utf8');new(require('node:vm').Script)(source);assert(!/structuredClone\(|\.at\(|\.roundRect\(/.test(source),file+' Chrome 95 baseline');}
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));assert.equal(manifest.scope,'./');for(const icon of manifest.icons)assert(fs.existsSync(path.join(root,icon.src)),icon.src+' exists');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');const files=require('node:vm').runInNewContext(sw.match(/var ASSETS=(\[[^;]+\]);/)[1]);for(const f of files)assert(fs.existsSync(path.join(root,f.split('?')[0])),f+' cached asset exists');
console.log('Meadow: '+checks+' mazes verify connectivity, determinism, walls, legal hint routes; assets and Chrome95 syntax checks pass.');

// V2 packaging: local copies, matching URLs and isolated offline resources.
const familyVM = require('node:vm');
const familyHTML = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const familySW = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const familyAssets = familyVM.runInNewContext(familySW.match(/var ASSETS\s*=\s*(\[[^;]+\]);/)[1]);
assert.equal(manifest.version, '2.0.0');
assert.match(familyHTML, /href="family-v2\/family.css\?v=2.0.0"/);
assert.match(familyHTML, /src="family-v2\/family.js\?v=2.0.0"[^>]+defer/);
assert.match(familyHTML, /data-family-slot/);
for (const asset of ['family.css?v=2.0.0', 'family.js?v=2.0.0', 'playwrite-es.ttf', 'OFL.txt']) {
  const relative = 'family-v2/' + asset;
  assert(familyAssets.includes(relative), relative + ' precached with exact query');
  assert(fs.lstatSync(path.join(root, relative.split('?')[0])).isFile(), relative + ' real local file');
}
new familyVM.Script(fs.readFileSync(path.join(root, 'family-v2/family.js'), 'utf8'));
for (const match of familyHTML.matchAll(/(?:src|href)="([^"#]+\?v=[^"]+)"/g)) {
  assert(familyAssets.some(asset => asset.replace(/^\.\//, '') === match[1]), match[1] + ' exact offline URL');
}
console.log('Family V2: local assets, version 2.0.0 and exact offline URLs verified.');

for (const direction of [NaN, 0.5, '1', undefined, null]) assert.equal(Core.move(Core.generate(4, 1), 0, direction), 0, 'Invalid directions cannot move or throw');
