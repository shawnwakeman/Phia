import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { UserSettings } from "../../types/collection";
import { defaultUserSettings, mergeDefaults } from "$lib/utils";


export const load: PageServerLoad = async ({ url, locals }) => {
	const projectID = 1;

	try {
		const [nodesResponse, issuesResponse] = await Promise.all([
			locals.supabase.from('nodes').select().eq('project_id', projectID),
			locals.supabase.from('issues').select().eq('project_id', projectID)
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