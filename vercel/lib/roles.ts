export type CampusRole='student'|'organiser'|'admin';
export function campusRole(user:{email?:string;email_confirmed_at?:string;app_metadata?:Record<string,unknown>}):CampusRole{
 if(!user.email_confirmed_at)return 'student';
 if(user.app_metadata?.campus_role==='admin'&&user.app_metadata?.faculty_verified===true)return 'admin';
 return user.app_metadata?.campus_role==='organiser'?'organiser':'student';
}
export const portalHome=(role:CampusRole)=>role==='admin'?'/admin':role==='organiser'?'/#organiser':'/#events';
export const validPortal=(value:unknown):CampusRole=>value==='admin'||value==='organiser'?value:'student';
