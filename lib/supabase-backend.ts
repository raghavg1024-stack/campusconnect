import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {mapEvent,mapRegistration,supabaseCapabilities,type EventRow,type UserRow,type RegistrationRow} from './supabase-model';
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
type Identity=NonNullable<Awaited<ReturnType<typeof getChatGPTUser>>>;
export class BackendError extends Error{constructor(message:string,public status=400){super(message)}}
export function supabaseConfigured(){return Boolean(env.SUPABASE_URL&&env.SUPABASE_SECRET_KEY)}
async function rest<T>(path:string,method='GET',body?:unknown):Promise<T>{
 const url=env.SUPABASE_URL!,key=env.SUPABASE_SECRET_KEY!;
 if(!/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url))throw new BackendError('Invalid Supabase project configuration.',503);
 const response=await fetch(url.replace(/\/$/,'')+'/rest/v1/'+path,{method,headers:{apikey:key,...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{}),'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 const text=await response.text();let data:unknown;try{data=text?JSON.parse(text):null}catch{throw new BackendError('Supabase returned an invalid response.',502)}
 if(!response.ok){const detail=data as {message?:string;code?:string};if(detail.code==='PGRST202')throw new BackendError('Registration transactions are not installed. See the Supabase setup guide.',503);if(detail.code==='P0001')throw new BackendError(detail.message||'The operation could not be completed.',409);console.error('Supabase request failed',{status:response.status,code:detail.code});throw new BackendError('The database could not complete this request.',response.status===409?409:502)}return data as T;
}
async function all<T>(table:string,select:string,filter=''):Promise<T[]>{const result:T[]=[];for(let offset=0;offset<100000;offset+=1000){const rows=await rest<T[]>(`${table}?select=${select}${filter}&limit=1000&offset=${offset}`);result.push(...rows);if(rows.length<1000)return result;}throw new BackendError('This dataset is too large to load in one response.',413)}
async function profile(user:Identity,create=false):Promise<UserRow>{
 const matches=await rest<UserRow[]>('USER?select=id,email,role&email=eq.'+encodeURIComponent(user.email.toLowerCase())+'&limit=2');
 if(matches.length>1)throw new BackendError('Your email matches multiple student records. Contact the campus administrator.',409);
 if(matches[0])return matches[0];
 const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('campusconnect:'+user.userId)));hash[6]=(hash[6]&15)|80;hash[8]=(hash[8]&63)|128;const h=Array.from(hash.slice(0,16),b=>b.toString(16).padStart(2,'0')).join('');const id=`${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
 const value={id,email:user.email,role:'student'};if(create){const rows=await rest<UserRow[]>('USER','POST',value);return rows[0]}return value;
}
async function eventById(id:string){if(!/^[0-9a-f-]{36}$/i.test(id))throw new BackendError('Invalid event ID.',400);const rows=await rest<EventRow[]>('Events?select=id,organiser_id,title,capacity,timestamp&id=eq.'+encodeURIComponent(id));if(!rows[0])throw new BackendError('Event not found.',404);return rows[0]}
async function requireOwner(id:string,student:UserRow){const event=await eventById(id);if(event.organiser_id!==student.id)throw new BackendError('Only the event organiser can make this change.',403);return event}
export async function supabaseGet(request:Request){try{
 const user=await getChatGPTUser(),student=user?await profile(user):null;
 const attendeeId=new URL(request.url).searchParams.get('attendees');
 if(attendeeId){if(!student)return json({error:'Sign in to view attendees.'},401);await requireOwner(attendeeId,student);const rows=await all<RegistrationRow>('Registration','id,event_id,user_id,created_id','&event_id=eq.'+encodeURIComponent(attendeeId)+'&order=created_id.asc.nullslast');const ids=[...new Set(rows.map(r=>r.user_id))];const users:UserRow[]=[];for(let i=0;i<ids.length;i+=50){users.push(...await rest<UserRow[]>('USER?select=id,email,role&id=in.('+ids.slice(i,i+50).join(',')+')'))}const lookup=new Map(users.map(u=>[u.id,u]));return json({attendees:rows.map(r=>mapRegistration(r,lookup.get(r.user_id))),capabilities:supabaseCapabilities})}
 const events=await all<EventRow>('Events','id,organiser_id,title,capacity,timestamp','&order=timestamp.asc.nullslast,id.asc');
 const counter=await all<{event_id:string|null}>('Registration','event_id');const counts=new Map<string,number>();for(const r of counter)if(r.event_id)counts.set(r.event_id,(counts.get(r.event_id)||0)+1);
 const own=student?await all<RegistrationRow>('Registration','id,event_id,user_id,created_id','&user_id=eq.'+student.id+'&order=created_id.asc.nullslast'):[];
 return json({backendConnected:true,provider:'supabase',events:events.map(e=>mapEvent(e,counts)),registrations:own.map(r=>mapRegistration(r,student||undefined)),memberships:[],viewer:user&&student?{id:student.id,name:user.displayName,email:user.email}:null,capabilities:supabaseCapabilities});
 }catch(error){return failure(error)}}
function failure(error:unknown){if(error instanceof BackendError)return json({error:error.message},error.status);console.error('Supabase backend unavailable',error instanceof Error?error.name:'unknown');return json({error:'The live database is unavailable. Please try again.'},503)}
export async function supabasePost(request:Request){try{
 if(request.headers.get('origin')!==new URL(request.url).origin)throw new BackendError('Invalid request origin.',403);
 const user=await getChatGPTUser();if(!user)throw new BackendError('Please sign in to continue.',401);
 let body:Record<string,unknown>;try{body=await request.json() as Record<string,unknown>;if(!body||typeof body!=='object'||Array.isArray(body))throw Error()}catch{throw new BackendError('Invalid request body.')}
 const student=await profile(user),id=typeof body.eventId==='string'?body.eventId:'';
 if(body.action==='saveEvent'){
 const title=typeof body.title==='string'?body.title.trim():'',capacity=Number(body.capacity),starts=new Date(String(body.starts_at));if(title.length<4||title.length>120||!Number.isInteger(capacity)||capacity<1||capacity>10000||!Number.isFinite(starts.getTime())||starts.getTime()<Date.now())throw new BackendError('Use a title of 4–120 characters, a future date, and capacity between 1 and 10,000.');
 if(id){await requireOwner(id,student);await rest('rpc/campus_update_event','POST',{p_event_id:id,p_owner_id:student.id,p_title:title,p_capacity:capacity,p_timestamp:starts.toISOString()});return json({ok:true,eventId:id})}
 const registered=await profile(user,true);const rows=await rest<EventRow[]>('Events','POST',{id:crypto.randomUUID(),organiser_id:registered.id,title,capacity,timestamp:starts.toISOString()});return json({ok:true,eventId:rows[0].id})}
 if(body.action==='register'){await eventById(id);const registered=await profile(user,true);await rest('rpc/campus_register','POST',{p_event_id:id,p_user_id:registered.id});return json({ok:true})}
 if(body.action==='cancelRsvp'){await eventById(id);await rest('Registration?event_id=eq.'+encodeURIComponent(id)+'&user_id=eq.'+student.id,'DELETE');return json({ok:true})}
 if(body.action==='walkIn'){await requireOwner(id,student);const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';if(email.length>254||!/^\S+@\S+\.\S+$/.test(email))throw new BackendError('Enter a valid email.');await rest('rpc/campus_walkin','POST',{p_event_id:id,p_owner_id:student.id,p_email:email});return json({ok:true})}
 if(['club','checkIn','eventStatus','samples'].includes(String(body.action)))throw new BackendError('This feature is not supported by the current database schema. No change was saved.',501);
 throw new BackendError('Unknown action.');
 }catch(error){return failure(error)}}

