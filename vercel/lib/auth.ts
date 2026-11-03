import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {campusRole} from './roles';
export async function authClient(){
 const jar=await cookies();
 return createServerClient(process.env.SUPABASE_URL!,process.env.SUPABASE_PUBLISHABLE_KEY!,{
  cookies:{
   getAll:()=>jar.getAll(),
   setAll:values=>{try{values.forEach(({name,value,options})=>jar.set(name,value,options))}catch{/* Proxy refreshes cookies for server component requests. */}}
  }
 });
}
export async function getChatGPTUser(){if(!process.env.SUPABASE_URL||!process.env.SUPABASE_PUBLISHABLE_KEY)return null;const client=await authClient();const {data:{user},error}=await client.auth.getUser();if(error||!user?.email)return null;return {userId:user.id,email:user.email,displayName:user.email.split('@')[0],fullName:null,role:campusRole(user),requestedOrganiser:user.user_metadata?.requested_role==='organiser'};}
