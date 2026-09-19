import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
for(const game of process.argv.slice(2)){
  const listeners={},deleted=[];
  const ownOld=game+'-obsolete-test';
  const keys=[ownOld,'other-game-sentinel'];
  const context=vm.createContext({
    self:{addEventListener(type,fn){listeners[type]=fn;},clients:{claim:()=>Promise.resolve()}},
    caches:{keys:()=>Promise.resolve(keys),delete:key=>{deleted.push(key);return Promise.resolve(true);}}
  });
  vm.runInContext(readFileSync(game+'/sw.js','utf8'),context);
  // Active names come from each worker; other games' versions are deliberately opaque.
  const active=vm.runInContext('[typeof CACHE!=="undefined"?CACHE:null,typeof APP_CACHE!=="undefined"?APP_CACHE:null,typeof RUNTIME_CACHE!=="undefined"?RUNTIME_CACHE:null].filter(Boolean)',context);
  keys.push(...active);
  for(const other of process.argv.slice(2)) if(other!==game) keys.push(other+'-future-version');
  let activation;
  listeners.activate({waitUntil:p=>{activation=p;}});
  await activation;
  assert.deepEqual(deleted,[ownOld],game+': only its obsolete caches may be removed');
  console.log(game+': cache activation preserves every other game.');
}
