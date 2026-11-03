'use server';
import {getChatGPTUser} from '@/lib/auth';
import {authAdmin} from '@/lib/auth-admin';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
export async function reviewAccess(data:FormData){
 const actor=await getChatGPTUser();if(actor?.role!=='admin')redirect('/login/admin?error=Verified%20faculty%20access%20required.');
 const id=String(data.get('userId')||''),decision=String(data.get('decision')||'');if(!/^[0-9a-f-]{36}$/i.test(id)||!['organiser','faculty','revoke'].includes(decision))redirect('/admin?error=Invalid%20request.');
 if(actor.userId===id)redirect('/admin?error=You%20cannot%20change%20your%20own%20access.');
 const admin=authAdmin(),{data:target,error}=await admin.getUserById(id);if(error||!target.user?.email_confirmed_at)redirect('/admin?error=The%20account%20is%20not%20ready.%20Please%20try%20again.');
 if(decision==='faculty'&&(data.get('verified')!=='yes'||!target.user.user_metadata?.faculty_employee_id||target.user.user_metadata?.requested_role!=='faculty'))redirect('/admin?error=Verify%20the%20faculty%20employee%20ID%20against%20college%20records%20first.');
 if(decision==='organiser'&&target.user.user_metadata?.requested_role!=='organiser')redirect('/admin?error=No%20organiser%20request%20exists.');
 const {error:updateError}=await admin.updateUserById(id,{app_metadata:{...target.user.app_metadata,campus_role:decision==='faculty'?'admin':decision==='organiser'?'organiser':'student',faculty_verified:decision==='faculty',...(decision==='faculty'?{faculty_employee_id:target.user.user_metadata.faculty_employee_id,faculty_college:target.user.user_metadata.faculty_college}:{})}});if(updateError)redirect('/admin?error=The%20access%20change%20could%20not%20be%20saved.');revalidatePath('/admin');redirect('/admin?message=Access%20updated.');
}
