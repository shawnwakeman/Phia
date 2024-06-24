import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, locals }) => {
    const { safeGetSession } = locals;

    const { session, user } = await safeGetSession();

    if (!session) {
        // Redirect to the authentication page with a return URL
        const redirectTo = `/auth?redirectTo=${encodeURIComponent(url.pathname + url.search)}`;
        throw redirect(303, redirectTo);
    }

    if (!user) {
        return { error: 'No active session' };
    }

    const { data, error } = await locals.supabase
        .from('project_users')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        return { error: 'Error fetching project users' };
    }

    return {
        projectIds: data
    };
};