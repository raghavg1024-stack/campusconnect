import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {clubs,samples} from '@/lib/campus';
import {supabaseConfigured,supabaseGet,supabasePost} from '@/lib/supabase-backend';
export const dynamic='force-dynamic';
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
const categories=['Technology','Arts & Culture','Music','Sports','Community'];
type EventRow={id:string;owner_id:string;status:string;capacity:number;starts_at:string};
function database(){if(!env.DB)throw new Error('Database is not configured.');return env.DB}
export async function GET(request:Request){if(supabaseConfigured())return supabaseGet(request);try{if(!env.DB)return json({backendConnected:false});const db=database(),user=await getChatGPTUser();const eventId=new URL(request.url).searchParams.get('attendees');
 if(eventId){if(!user)return json({error:'Please sign in.'},401);const e=await db.prepare('SELECT owner_id FROM events WHERE id=?').bind(eventId).first<{owner_id:string}>();if(!e||e.owner_id!==user.userId)return json({error:'Only the event organiser can view attendees.'},403);return json({attendees:(await db.prepare('SELECT * FROM registrations WHERE event_id=? ORDER BY created_at').bind(eventId).all()).results})}
 const events=(await db.prepare('SELECT e.*, (SELECT count(*) FROM registrations r WHERE r.event_id=e.id) AS registered FROM events e ORDER BY starts_at').all()).results;
 const registrations=user?(await db.prepare('SELECT * FROM registrations WHERE user_id=?').bind(user.userId).all()).results:[];
 const memberships=user?(await db.prepare('SELECT club_id FROM memberships WHERE user_id=?').bind(user.userId).all<{club_id:string}>()).results.map(m=>m.club_id):[];
 return json({events,registrations,memberships});
 }catch(error){console.error('campus read',error);return json({error:'The database is unavailable. Please try again shortly.'},503)}}
export async function POST(request:Request){
 if(supabaseConfigured())return supabasePost(request);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Invalid request origin.'},403);
 const user=await getChatGPTUser();if(!user)return json({error:'Please sign in to continue.'},401);
 let body:Record<string,unknown>;try{body=await request.json();if(!body||typeof body!=='object'||Array.isArray(body))throw Error()}catch{return json({error:'Invalid request.'},400)}
 try{const db=database(),action=body.action,id=typeof body.eventId==='string'?body.eventId:'';
 if(action==='samples'){
 const now=new Date();await db.batch(samples.map((s,i)=>{const d=new Date(now);d.setUTCDate(d.getUTCDate()+s.days);d.setUTCHours(s.hour,0,0,0);return db.prepare('INSERT OR IGNORE INTO events (id,owner_id,title,description,category,club,starts_at,location,capacity,mode,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind('sample-'+user.userId+'-'+i,user.userId,s.title,s.description,s.category,s.club,d.toISOString(),s.location,s.capacity,s.mode,'published',now.toISOString())}));return json({ok:true})}
 if(action==='club'){const clubId=String(body.clubId);if(!clubs.some(c=>c.id===clubId))return json({error:'Club not found.'},404);if(body.join===true)await db.prepare('INSERT OR IGNORE INTO memberships (id,club_id,user_id) VALUES (?,?,?)').bind(crypto.randomUUID(),clubId,user.userId).run();else await db.prepare('DELETE FROM memberships WHERE club_id=? AND user_id=?').bind(clubId,user.userId).run();return json({ok:true})}
 if(action==='saveEvent'){
 const title=typeof body.title==='string'?body.title.trim():'',description=typeof body.description==='string'?body.description.trim():'',location=typeof body.location==='string'?body.location.trim():'',category=String(body.category),club=String(body.club),mode=String(body.mode),capacity=Number(body.capacity),startsAt=new Date(String(body.starts_at));
 if(title.length<4||title.length>120||description.length<20||description.length>5000||location.length<3||location.length>180||!Number.isInteger(capacity)||capacity<1||capacity>10000||!Number.isFinite(startsAt.getTime())||startsAt.getTime()<Date.now()||!categories.includes(category)||!clubs.some(c=>c.id===club)||!['In-Person','Virtual'].includes(mode))return json({error:'Check all fields. Use a future date and a capacity between 1 and 10,000.'},400);
 const eventId=id||crypto.randomUUID();if(id){const e=await db.prepare('SELECT owner_id FROM events WHERE id=?').bind(id).first<{owner_id:string}>();if(!e||e.owner_id!==user.userId)return json({error:'You cannot edit this event.'},403);
 const result=await db.prepare('UPDATE events SET title=?,description=?,category=?,club=?,starts_at=?,location=?,capacity=?,mode=? WHERE id=? AND owner_id=? AND ? >= (SELECT count(*) FROM registrations WHERE event_id=?)').bind(title,description,category,club,startsAt.toISOString(),location,capacity,mode,id,user.userId,capacity,id).run();if(!result.meta.changes)return json({error:'Capacity cannot be lower than current registrations.'},409);
 }else await db.prepare('INSERT INTO events (id,owner_id,title,description,category,club,starts_at,location,capacity,mode,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(eventId,user.userId,title,description,category,club,startsAt.toISOString(),location,capacity,mode,'published',new Date().toISOString()).run();return json({ok:true,eventId})}
 const event=await db.prepare('SELECT id,owner_id,status,capacity,starts_at FROM events WHERE id=?').bind(id).first<EventRow>();if(!event)return json({error:'Event not found.'},404);
 if(action==='register'){
 if(event.status!=='published'||new Date(event.starts_at).getTime()<Date.now())return json({error:'Registration is closed.'},409);const name=typeof body.name==='string'?body.name.trim():'';if(name.length<2||name.length>100)return json({error:'Enter a name between 2 and 100 characters.'},400);
 const result=await db.prepare('INSERT OR IGNORE INTO registrations (id,event_id,user_id,name,email,checked_in,created_at) SELECT ?,?,?,?,?,0,? WHERE (SELECT count(*) FROM registrations WHERE event_id=?) < (SELECT capacity FROM events WHERE id=? AND status=\'published\')').bind(crypto.randomUUID(),id,user.userId,name,user.email,new Date().toISOString(),id,id).run();if(!result.meta.changes)return json({error:'You are already registered or the event is full.'},409);return json({ok:true})}
 if(action==='cancelRsvp'){await db.prepare('DELETE FROM registrations WHERE event_id=? AND user_id=?').bind(id,user.userId).run();return json({ok:true})}
 if(event.owner_id!==user.userId)return json({error:'Only the event organiser can make this change.'},403);
 if(action==='eventStatus'){if(!['published','cancelled'].includes(String(body.status)))return json({error:'Invalid status.'},400);await db.prepare('UPDATE events SET status=? WHERE id=? AND owner_id=?').bind(body.status,id,user.userId).run();return json({ok:true})}
 if(action==='checkIn'){if(typeof body.checked!=='boolean'||typeof body.registrationId!=='string')return json({error:'Invalid check-in.'},400);await db.prepare('UPDATE registrations SET checked_in=? WHERE id=? AND event_id=?').bind(body.checked?1:0,body.registrationId,id).run();return json({ok:true})}
 if(action==='walkIn'){if(event.status!=='published')return json({error:'Event is cancelled.'},409);const name=typeof body.name==='string'?body.name.trim():'',email=typeof body.email==='string'?body.email.trim().toLowerCase():'';if(name.length<2||name.length>100||email.length>254||!/^\S+@\S+\.\S+$/.test(email))return json({error:'Enter a valid name and email.'},400);const result=await db.prepare('INSERT INTO registrations (id,event_id,user_id,name,email,checked_in,created_at) SELECT ?,?,?,?,?,1,? WHERE (SELECT count(*) FROM registrations WHERE event_id=?) < (SELECT capacity FROM events WHERE id=?) AND NOT EXISTS (SELECT 1 FROM registrations WHERE event_id=? AND lower(email)=?)').bind(crypto.randomUUID(),id,'walkin:'+crypto.randomUUID(),name,email,new Date().toISOString(),id,id,id,email).run();if(!result.meta.changes)return json({error:'Event is full or this email is already registered.'},409);return json({ok:true})}
 return json({error:'Unknown action.'},400);
 }catch(error){console.error('campus write',error);return json({error:'Your change could not be saved. Please try again.'},500)}
}
