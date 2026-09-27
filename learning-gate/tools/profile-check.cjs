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
assert.equal(profile.read().expiresAt, now + 31536000000);
assert.match(written, /Path=\//); assert.match(written, /Max-Age=31536000/);
assert.match(written, /SameSite=Lax/); assert.match(written, /Secure/);
assert.equal(profile.save({level:'learner',reading:true}), true, 'extras are configurable, not locked to a device/model');
assert.equal(profile.read().reading, true);
assert.equal(profile.save({level:'other',reading:true}), false);
assert.equal(profile.save({level:'advanced',reading:'true'}), false);
assert.equal(profile.clear(), true); assert.equal(profile.read(), null);
for (const value of ['%invalid', '{}', JSON.stringify({version:2,level:'advanced',reading:true,expiresAt:now+100}), JSON.stringify({version:1,level:'advanced',reading:true,expiresAt:now})]) {
  cookie=profile.cookieName+'='+encodeURIComponent(value);assert.equal(profile.read(), null);
}
profile.save({level:'advanced',reading:true});now += 31536000001;
assert.equal(profile.read(), null, 'expired cookie always falls back to minima');
blocked=true;assert.equal(profile.read(), null);assert.equal(profile.save({level:'advanced',reading:true}), false);
assert.equal(profile.clear(), false);
console.log('Profiles: strict schema, 1-year expiry, shared path, secure cookie, configurable extras and blocked/missing fallback PASS.');
