import type { PageServerLoad } from './$types';



export const load: PageServerLoad = async ({ locals }) => {
    const { safeGetSession } = locals

    const { session, user } = await safeGetSession()
  
    if (!session) {
        
        return { error: 'No active session' }
        

    }


    if (!user) {  return { error: 'No asd session' }}
        const { data, error } = await locals.supabase
        .from('project_users')
        .select('*')
        .eq('user_id', user.id);
    
  
    return {
        projectIds: data
    };
  }