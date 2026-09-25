import {readFileSync,copyFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const games=['nitro-highway','pocket-karts','pulse-path','fruit-splash','orbit-lab','memory-garden','shape-studio','little-atelier','maze-meadow'];
const source=resolve(root,'learning-gate/gate.js');
const check=process.argv.includes('--check');
for(const game of games){
  const target=resolve(root,game,'learning-gate.js');
  if(!check)copyFileSync(source,target);
  assert.equal(readFileSync(target,'utf8'),readFileSync(source,'utf8'),game+': gate copy is out of date');
  const html=readFileSync(resolve(root,game,'index.html'),'utf8');
  assert.ok(html.indexOf('learning-gate.js')>=0&&html.indexOf('learning-gate.js')<html.indexOf('src="game.js'),game+': load the gate before the game');
  assert.match(readFileSync(resolve(root,game,'sw.js'),'utf8'),/learning-gate\.js/,game+': offline gate missing');
  console.log(game+': '+(check?'verified':'synchronized')+' local educational gate');
}
