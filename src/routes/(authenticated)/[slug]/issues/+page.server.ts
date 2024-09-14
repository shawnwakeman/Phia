import type { PageServerLoad } from './$types';

export const load = async ({ depends, locals: { supabase } }) => {


    depends('supabase:db:nodes');
    depends('supabase:db:issues');

    const projectID = 1;

    try {
        const [nodesResponse, issuesResponse] = await Promise.all([
            supabase.from('nodes').select().eq('project_id', projectID),
            supabase.from('issues').select().eq('project_id', projectID)
        ]);

        const nodesData = nodesResponse.data;
        const nodesError = nodesResponse.error;
        const issuesData = issuesResponse.data;
        const issuesError = issuesResponse.error;

        if (nodesError) {
            console.error('Error fetching nodes:', nodesError);
            return { nodes: [], issues: [] }; // Return empty arrays if there's an error fetching nodes
        }

        if (issuesError) {
            console.error('Error fetching issues:', issuesError);
        }
        console.error("00000", issuesData);
        
        return {
            nodes: nodesData ?? [],
            issues: issuesData ?? [],
        };

    } catch (error) {
        console.error('Unexpected error fetching data:', error);
        return {
            nodes: [],
            issues: []
        };
    }
};
