import type {CampusEvent,Registration} from './campus';
export type EventRow={id:string;organiser_id:string;title:string|null;capacity:number|null;timestamp:string|null};
export type UserRow={id:string;email:string|null;role:string|null};
export type RegistrationRow={id:string;event_id:string|null;user_id:string;created_id:string|null};
export function mapEvent(row:EventRow,counts:Map<string,number>):CampusEvent{return {id:row.id,owner_id:row.organiser_id,title:row.title||'Untitled event',description:'Additional event details have not been provided by the organiser.',category:'Community',club:'',starts_at:row.timestamp||'',location:'Location to be announced',capacity:row.capacity||0,mode:'In-Person',status:'published',registered:counts.get(row.id)||0};}
export function mapRegistration(row:RegistrationRow,user:UserRow|undefined):Registration{return {id:row.id,event_id:row.event_id||'',user_id:row.user_id,name:user?.email?.split('@')[0]||'Registered student',email:user?.email||'',checked_in:0,created_at:row.created_id||''};}
export const supabaseCapabilities={checkIn:false,clubMembership:false,eventStatus:false,extendedEventFields:false,walkIn:true};
