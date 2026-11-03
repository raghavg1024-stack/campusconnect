// Run only against a local development server connected to your test/project DB.
// Creates a labelled temporary event and removes only its own test records.
const fs=require('node:fs');const assert=require('node:assert/strict');
const vars=Object.fromEntries(fs.readFileSync('.dev.vars','utf8').trim().split(/\r?\n/).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1)]}));
const origin='http://127.0.0.1:5173';let cookie='',eventId='',newUserId='';
async function db(path,method='GET',body){const r=await fetch(vars.SUPABASE_URL+'/rest/v1/'+path,{method,headers:{apikey:vars.SUPABASE_SECRET_KEY,Authorization:'Bearer '+vars.SUPABASE_SECRET_KEY,'Content-Type':'application/json',Prefer:'return=representation'},body:body?JSON.stringify(body):undefined});const text=await r.text();const data=text?JSON.parse(text):null;if(!r.ok)throw Error('Test database operation failed: '+r.status);return data;}
async function api(body,extra={}){const r=await fetch(origin+'/api/campus',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie,...extra},body:JSON.stringify(body)});const text=await r.text();let data;try{data=JSON.parse(text)}catch{data={error:text}}return {status:r.status,data};}
(async()=>{
 const publicResponse=await fetch(origin+'/api/campus');assert.equal(publicResponse.status,200);const publicState=await publicResponse.json();assert.equal(publicState.provider,'supabase');assert(publicState.events.length>0);assert.equal(publicState.registrations.length,0);
 const existing=await db('USER?select=id&email=eq.seedy%40sites.test');
 const sign=await fetch(origin+'/signin-with-chatgpt?return_to=/',{redirect:'manual'});cookie=sign.headers.getSetCookie().map(s=>s.split(';')[0]).join('; ');assert(cookie,'Local mock sign-in cookie missing');
 const ownResponse=await fetch(origin+'/api/campus',{headers:{Cookie:cookie}});const own=await ownResponse.json();assert(own.viewer?.id);if(!existing.length)newUserId=own.viewer.id;
 const foreign=await fetch(origin+'/api/campus?attendees='+publicState.events[0].id,{headers:{Cookie:cookie}});assert.equal(foreign.status,403,'An unrelated user must not see attendee information');
 const created=await api({action:'saveEvent',title:'[Integration test] Temporary event',capacity:1,starts_at:new Date(Date.now()+86400000).toISOString()});assert.equal(created.status,200,JSON.stringify(created.data));eventId=created.data.eventId;
 const requests=await Promise.all([api({action:'register',eventId}),api({action:'register',eventId})]);assert.deepEqual(requests.map(r=>r.status).sort(),[200,409],'Concurrent duplicate requests must reserve only one place');
 const full=await api({action:'walkIn',eventId,email:'walkin@example.test'});assert.equal(full.status,409,'Capacity must not be exceeded');
 const attendees=await fetch(origin+'/api/campus?attendees='+eventId,{headers:{Cookie:cookie}});const list=await attendees.json();assert.equal(list.attendees.length,1);
 const invalidOrigin=await api({action:'cancelRsvp',eventId},{Origin:'https://untrusted.example'});assert.equal(invalidOrigin.status,403);
 const cancelled=await api({action:'cancelRsvp',eventId});assert.equal(cancelled.status,200);
 const check=await api({action:'checkIn',eventId,registrationId:'unavailable',checked:true});assert.equal(check.status,501,'Missing schema features must fail explicitly');
 console.log('Live Supabase checks passed: real event read, authenticated event creation, atomic RSVP, duplicate/capacity protection, organiser-only attendees, cancellation, and origin validation.');
})().catch(error=>{console.error(error.message);process.exitCode=1}).finally(async()=>{try{if(eventId){await db('Registration?event_id=eq.'+eventId,'DELETE');await db('Events?id=eq.'+eventId,'DELETE')}if(newUserId){const remaining=await db('Events?select=id&organiser_id=eq.'+newUserId);if(!remaining.length)await db('USER?id=eq.'+newUserId,'DELETE')}console.log('Temporary integration-test records cleaned up.')}catch(error){console.error('Test cleanup needs attention: '+error.message);process.exitCode=1}});
