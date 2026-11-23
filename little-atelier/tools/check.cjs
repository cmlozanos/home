const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Core=require('../core.js');
const root=path.resolve(__dirname,'..');
assert.deepEqual(Core.midpoint({x:0,y:0},{x:1,y:1}),{x:.5,y:.5});
const action={tool:'brush',color:'#d46855',size:6,points:[{x:.1,y:.2},{x:.8,y:.7}]};
assert.equal(Core.validSave({version:1,background:'plain',actions:[action]}),true);
assert.equal(Core.validSave({version:1,background:'bad',actions:[action]}),false);
assert.equal(Core.validSave({version:1,background:'plain',actions:[{...action,points:[{x:NaN,y:0}]}]}),false);
assert.equal(Core.validSave({version:1,background:'plain',actions:[{...action,points:[{x:2,y:0}]}]}),false);
assert.equal(Core.validSave({version:1,background:'plain',actions:new Array(301).fill(action)}),false);
assert.equal(Core.bounded(new Array(500).fill(action)).length,300);
const long={...action,points:new Array(2000).fill({x:.2,y:.4})};
assert.equal(Core.bounded(new Array(20).fill(long)).length,6);
const calls=[];const context={beginPath(){},moveTo(...args){calls.push(['move',...args]);},quadraticCurveTo(...args){calls.push(['curve',...args]);},lineTo(...args){calls.push(['line',...args]);},stroke(){},arc(...args){calls.push(['dot',...args]);},fill(){}};
Core.stroke(context,action.points,100,200,6);
assert.deepEqual(calls[0],['move',10,40]);assert.deepEqual(calls[1],['curve',10,40,45,90]);assert.deepEqual(calls[2],['line',80,140]);
Core.stroke(context,[{x:.3,y:.5}],100,200,10);assert.deepEqual(calls[3].slice(0,4),['dot',30,100,5]);
for(const file of ['core.js','game.js','sw.js']){const source=fs.readFileSync(path.join(root,file),'utf8');new(require('node:vm').Script)(source);assert(!/structuredClone\(|\.at\(|\.roundRect\(/.test(source),file+' Chrome 95 baseline');}
const css=fs.readFileSync(path.join(root,'style.css'),'utf8');assert(!/color-mix\(/.test(css));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));assert.equal(manifest.scope,'./');
for(const icon of manifest.icons)assert(fs.existsSync(path.join(root,icon.src)),icon.src+' exists');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');const assets=sw.match(/var ASSETS=(\[[^;]+\]);/)[1];const files=require('node:vm').runInNewContext(assets);for(const f of files)assert(fs.existsSync(path.join(root,f.split('?')[0])),f+' cached asset exists');
console.log('Atelier: normalized stroke, tap dots, invalid saves, bounded history, syntax and offline assets verified.');

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
