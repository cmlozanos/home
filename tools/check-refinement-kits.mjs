import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
const roots=process.argv.slice(2);
assert(roots.length,'Provide explicit game roots; no discovery outside requested repositories');
for(const root of roots){
  for(const name of ['family.js','family.css','playwrite-es.ttf','OFL.txt'])assert(readFileSync(join(root,'family-v2',name)).equals(readFileSync(resolve('family-v2',name))),root+': '+name);
  console.log(root+': exact local school-font/theme/motion bundle');
}
