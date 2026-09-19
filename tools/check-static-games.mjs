import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import vm from 'node:vm';
for(const game of process.argv.slice(2)){
  const root=resolve(game);
  const context=vm.createContext({self:{addEventListener(){}}});
  vm.runInContext(readFileSync(resolve(root,'sw.js'),'utf8'),context);
  const assets=context.ASSETS||context.FILES;
  assert.ok(Array.isArray(assets)&&assets.length>5,game+': precache list');
  let bytes=0;
  for(const asset of assets){
    const path=asset.split('?')[0];
    const full=resolve(root,path.endsWith('/')?path+'index.html':path);
    assert.ok(existsSync(full),game+': missing offline resource '+asset);
    bytes+=statSync(full).size;
  }
  const html=readFileSync(resolve(root,'index.html'),'utf8');
  for(const [,asset] of html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css)(?:\?[^"]*)?)"/g)){
    assert.ok(assets.some(a=>a.replace(/^\.\//,'')===asset.replace(/^\.\//,'')),game+': versioned asset absent from cache '+asset);
  }
  assert.ok(bytes<500000,game+': offline payload must stay below 500 KB');
  console.log(game+': offline resources and versions verified ('+Math.ceil(bytes/1024)+' KiB).');
}
