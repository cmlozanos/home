import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
for(const game of process.argv.slice(2)){
  const listeners={},deleted=[];
  const ownOld=game+'-obsolete-test';
  const keys=[ownOld,'other-game-sentinel','rubik-solver-app-v1','rubik-solver-runtime-v1','fruit-splash-20260919-1','orbit-lab-20260919-1'];
  const context=vm.createContext({
    self:{addEventListener(type,fn){listeners[type]=fn;},clients:{claim:()=>Promise.resolve()}},
    caches:{keys:()=>Promise.resolve(keys),delete:key=>{deleted.push(key);return Promise.resolve(true);}}
  });
  vm.runInContext(readFileSync(game+'/sw.js','utf8'),context);
  let activation;
  listeners.activate({waitUntil:p=>{activation=p;}});
  await activation;
  assert.deepEqual(deleted,[ownOld],game+': only its obsolete caches may be removed');
  console.log(game+': cache activation preserves every other game.');
}
