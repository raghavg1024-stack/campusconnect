// A pass identifies one registration, not a person. Reopening does not change it.
export function passCode(eventId:string,registrationId:string){
 if(!/^[a-zA-Z0-9-]{1,80}$/.test(eventId)||!/^[a-zA-Z0-9-]{1,80}$/.test(registrationId))throw Error('Invalid event pass identifier.');
 return `CCPASS:1:${eventId}:${registrationId}`;
}
export function readPassCode(value:string){
 const parts=value.trim().split(':');
 if(parts.length!==4||parts[0]!=='CCPASS'||parts[1]!=='1')return null;
 try{passCode(parts[2],parts[3]);return {eventId:parts[2],registrationId:parts[3]}}catch{return null}
}
