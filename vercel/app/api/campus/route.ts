import {supabaseConfigured,supabaseGet,supabasePost} from '@/lib/supabase-backend';
export const dynamic='force-dynamic';
export async function GET(request:Request){if(!supabaseConfigured())return Response.json({error:'The database connection is not configured.'},{status:503});return supabaseGet(request);}
export async function POST(request:Request){if(!supabaseConfigured())return Response.json({error:'The database connection is not configured.'},{status:503});return supabasePost(request);}
