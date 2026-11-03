const assert=require('node:assert/strict');
const ts=require('typescript');
const vm=require('node:vm');
const fs=require('node:fs');
function load(file){const source=fs.readFileSync(file,'utf8');const out=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const mod={exports:{}};vm.runInNewContext(out,{exports:mod.exports,module:mod,require:()=>load('lib/campus.ts'),Date,crypto:globalThis.crypto,structuredClone,Set,Error,String,Number,Math},{filename:file});return mod.exports}
const {initialPreview,mutatePreview}=load('lib/preview.ts');
let state=initialPreview();assert.equal(state.events.length,6);assert.equal(state.attendees.length,23);assert.equal(state.attendees.filter(a=>a.checked_in).length,14);
state=mutatePreview(state,{action:'register',eventId:'demo-0',name:'Test Student'});assert.equal(state.events[0].registered,24);assert.equal(state.registrations.length,1);
assert.throws(()=>mutatePreview(state,{action:'register',eventId:'demo-0',name:'Duplicate'}),/already registered/);
state=mutatePreview(state,{action:'checkIn',eventId:'demo-0',registrationId:state.registrations[0].id,checked:true});assert.equal(state.registrations[0].checked_in,1);
state=mutatePreview(state,{action:'cancelRsvp',eventId:'demo-0'});assert.equal(state.events[0].registered,23);assert.equal(state.registrations.length,0);
state.events[0].capacity=24;state=mutatePreview(state,{action:'walkIn',eventId:'demo-0',name:'New Student',email:'new@example.test'});assert.equal(state.events[0].registered,24);
assert.throws(()=>mutatePreview(state,{action:'walkIn',eventId:'demo-0',name:'Over Capacity',email:'over@example.test'}),/closed/);
state=mutatePreview(state,{action:'club',clubId:'tech',join:true});state=mutatePreview(state,{action:'club',clubId:'tech',join:true});assert.deepEqual([...state.memberships],['tech']);
state=mutatePreview(state,{action:'club',clubId:'tech',join:false});assert.equal(state.memberships.length,0);
state=mutatePreview(state,{action:'eventStatus',eventId:'demo-0',status:'cancelled'});assert.throws(()=>mutatePreview(state,{action:'register',eventId:'demo-0',name:'Late'}),/closed/);
assert.equal(initialPreview().events[0].registered,23,'Mutations must not alter a fresh preview.');
console.log('Campus workflow checks passed: RSVP, duplicates, check-in, cancellation, capacity, club membership, event cancellation.');
