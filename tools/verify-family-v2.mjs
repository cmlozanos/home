import {readFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const bases=process.argv.slice(2);
if(!bases.length) throw Error('Provide explicit local game directories');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const baseArg of bases){const base=resolve(baseArg);const html=readFileSync(join(base,'index.html'),'utf8');
 for(const file of ['family.js','family.css','playwrite-es.ttf','OFL.txt'])if(!existsSync(join(base,'family-v2',file)))throw Error(base+': missing '+file);
 new vm.Script(readFileSync(join(base,'family-v2/family.js'),'utf8'));
 if(!html.includes('family-v2/family.js?v=2.0.0')||!html.includes('family-v2/family.css?v=2.0.0'))throw Error(base+': no2.0kit integration');
 const sw=existsSync(join(base,'sw.js'))?readFileSync(join(base,'sw.js'),'utf8'):'';
 if(sw&&!sw.includes('family-v2/'))throw Error(base+': kit not precached');
 console.log('Family2 asset integration',baseArg,hash(readFileSync(join(base,'family-v2/family.js'))).slice(0,12));
}
