import {samples,type CampusState,type CampusEvent,type Registration} from './campus';
export type PreviewState=CampusState&{attendees:Registration[]};
export const previewUser={id:'preview-student',name:'Preview Student',email:'student@example.test'};
export function initialPreview():PreviewState{
 const now=new Date();const events:CampusEvent[]=samples.map((s,i)=>{const date=new Date(now);date.setDate(date.getDate()+s.days);date.setHours(s.hour,0,0,0);return {id:'demo-'+i,owner_id:previewUser.id,title:s.title,description:s.description,category:s.category,club:s.club,starts_at:date.toISOString(),location:s.location,capacity:s.capacity,mode:s.mode,status:'published',registered:i===0?23:0}});
 const attendees:Registration[]=Array.from({length:23},(_,i)=>({id:'demo-pass-'+(i+1),event_id:'demo-0',user_id:'demo-person-'+i,name:'Preview Student '+String(i+1).padStart(2,'0'),email:'student'+String(i+1).padStart(2,'0')+'@example.test',checked_in:i<14?1:0,created_at:new Date(now.getTime()-i*3600000).toISOString()}));
 return {events,attendees,registrations:[],memberships:[]};
}
export function mutatePreview(state:PreviewState,body:Record<string,unknown>):PreviewState{
 const next:PreviewState=structuredClone(state),event=next.events.find(e=>e.id===body.eventId);const action=body.action;
 if(action==='club'){next.memberships=body.join?[...new Set([...next.memberships,String(body.clubId)])]:next.memberships.filter(c=>c!==body.clubId);return next}
 if(action==='saveEvent'){const id=String(body.eventId||crypto.randomUUID());const old=next.events.find(e=>e.id===id);const capacity=Number(body.capacity);if(old&&capacity<old.registered)throw Error('Capacity cannot be below current registrations.');const data={id,owner_id:previewUser.id,title:String(body.title),description:String(body.description),category:String(body.category),club:String(body.club),starts_at:new Date(String(body.starts_at)).toISOString(),location:String(body.location),capacity,mode:String(body.mode),status:old?.status||'published',registered:old?.registered||0};if(old)Object.assign(old,data);else next.events.push(data);return next}
 if(action==='samples')return next;
 if(!event)throw Error('Event not found.');
 if(action==='register'){if(next.registrations.some(r=>r.event_id===event.id))throw Error('You are already registered.');if(event.status!=='published'||event.registered>=event.capacity)throw Error('Registration is closed.');const r={id:crypto.randomUUID(),event_id:event.id,user_id:previewUser.id,name:String(body.name),email:previewUser.email,checked_in:0,created_at:new Date().toISOString()};next.registrations.push(r);next.attendees.push(r);event.registered++}
 if(action==='cancelRsvp'){const existing=next.registrations.find(r=>r.event_id===event.id);next.registrations=next.registrations.filter(r=>r.event_id!==event.id);if(existing){next.attendees=next.attendees.filter(r=>r.id!==existing.id);event.registered--}}
 if(action==='eventStatus')event.status=String(body.status);
 if(action==='checkIn'){for(const r of [...next.attendees,...next.registrations])if(r.id===body.registrationId)r.checked_in=body.checked?1:0}
 if(action==='walkIn'){if(event.status!=='published'||event.registered>=event.capacity)throw Error('Admission is closed.');if(next.attendees.some(r=>r.event_id===event.id&&r.email.toLowerCase()===String(body.email).toLowerCase()))throw Error('This email is already registered.');next.attendees.push({id:crypto.randomUUID(),event_id:event.id,user_id:'walkin-'+crypto.randomUUID(),name:String(body.name),email:String(body.email),checked_in:1,created_at:new Date().toISOString()});event.registered++}
 return next;
}
