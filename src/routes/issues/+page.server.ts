import { supabase, fetchNestedIssues } from '$lib/supabaseClient';
import { get } from 'svelte/store'; // Import get to use with Svelte stores
import { selectedNodeStore, nodesDataStore, issuesDataStore } from "../../stores";
import type { Issue } from "../../types/collection";



export async function load() {

	const currentIssues = get(issuesDataStore);



    
    if (currentIssues.length === 0) {
        
    
	const { data, error } = await supabase
		.from('issues')
			.select();
		
		return {
			issues : data ?? [],
		};
	} else {
		return {
			issues : currentIssues ?? [],
		};
	}


	

	

}

