import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const games=['animal-quiz','nitro-highway','pocket-karts','pulse-path','fruit-splash','orbit-lab','memory-garden','shape-studio','little-atelier','maze-meadow','rubik-solver'];
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
for(const game of games){for(const file of ['family.js','family.css','playwrite-es.ttf','OFL.txt'])assert.equal(hash(`${game}/family-v2/${file}`),hash(`family-v2/${file}`),`${game} exact ${file}`);const html=readFileSync(`${game}/index.html`,'utf8');assert(html.includes('data-family-slot'),game+' explicit shell slot');assert(html.includes('data-game="'+game+'"'),game+' scoped id');const manifest=['manifest.webmanifest','manifest.json'].find(p=>existsSync(`${game}/${p}`));if(manifest)assert.equal(JSON.parse(readFileSync(`${game}/${manifest}`,'utf8')).version,'2.0.0',game+' version');}
console.log('V2 exact kit/version/slot integration',games.length,'games');
