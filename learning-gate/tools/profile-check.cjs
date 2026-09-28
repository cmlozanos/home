const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../profile.js'), 'utf8');
let now = 1000000, cookie = '', written = '', blocked = false;
const document = {};
Object.defineProperty(document, 'cookie', {
  get() { if (blocked) throw Error('cookies blocked'); return cookie; },
  set(value) { if (blocked) return; written = value; cookie = /Max-Age=0(;|$)/.test(value) ? '' : value.split(';')[0]; }
});
const sandbox = { window: {document, location:{protocol:'https:'}}, document, Date:{now:()=>now}, module:{exports:{}} };
vm.runInNewContext(source, sandbox);
const profile = sandbox.module.exports;
assert.equal(profile.read(), null);
assert.equal(profile.save({level:'advanced',reading:true}), true);
assert.equal(profile.read().reading, true);
assert.equal(profile.read().version, 2);
assert.deepEqual(Array.from(profile.read().challenges), ['addition','subtraction','trace','reading']);
assert.equal(profile.read().expiresAt, now + 31536000000);
assert.match(written, /Path=\//); assert.match(written, /Max-Age=31536000/);
assert.match(written, /SameSite=Lax/); assert.match(written, /Secure/);
assert.equal(profile.save({level:'learner',reading:true}), true, 'extras are configurable, not locked to a device/model');
assert.equal(profile.read().reading, true);
assert.equal(profile.save({level:'other',reading:true}), false);
assert.equal(profile.save({level:'advanced',reading:'true'}), false);
for(const type of profile.types) {
  assert.equal(profile.save({level:'learner',challenges:[type]}), true);
  assert.deepEqual(Array.from(profile.read().challenges),[type]);
  assert.equal(profile.read().reading,type==='reading');
}
for(const challenges of [[],['unknown'],['trace','unknown'],['trace','trace'],null,'trace']) {
  const before=cookie;assert.equal(profile.save({level:'learner',challenges}),false);assert.equal(cookie,before,'invalid save preserves current profile');
}
for(const reading of [false,true]) {
  cookie=profile.cookieName+'='+encodeURIComponent(JSON.stringify({version:1,level:'advanced',reading,expiresAt:now+10000}));
  const before=cookie,migrated=profile.read();
  assert.equal(migrated.version,2);assert.equal(migrated.expiresAt,now+10000);
  assert.deepEqual(Array.from(migrated.challenges),reading?['addition','subtraction','trace','reading']:['addition','subtraction','trace']);
  assert.equal(cookie,before,'legacy read does not rewrite cookie or renew expiry');
}
assert.equal(profile.clear(), true); assert.equal(profile.read(), null);
for (const value of ['%invalid', '{}', JSON.stringify({version:2,level:'advanced',reading:true,expiresAt:now+100}), JSON.stringify({version:1,level:'advanced',reading:true,expiresAt:now})]) {
  cookie=profile.cookieName+'='+encodeURIComponent(value);assert.equal(profile.read(), null);
}
profile.save({level:'advanced',reading:true});now += 31536000001;
assert.equal(profile.read(), null, 'expired cookie always falls back to minima');
blocked=true;assert.equal(profile.read(), null);assert.equal(profile.save({level:'advanced',reading:true}), false);
assert.equal(profile.clear(), false);
console.log('Profiles: exclusive selections, reject empty/unknown/duplicates, v1 compatibility without writes, 1-year expiry, shared path, secure cookie and blocked/missing fallback PASS.');
