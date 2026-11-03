import CampusApp from './campus-app';import {getChatGPTUser} from '@/lib/auth';
export const dynamic='force-dynamic';
export default async function Home(){const user=await getChatGPTUser();return <CampusApp user={user?{id:user.userId,name:user.displayName,email:user.email}:null}/>}
