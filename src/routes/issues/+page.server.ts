import { supabase, fetchNestedIssues } from '$lib/supabaseClient';
import { get } from 'svelte/store'; // Import get to use with Svelte stores
import { selectedNodeStore, nodesDataStore, issuesDataStore } from "../../stores";
import type { Issue } from "../../types/collection";



export async function load() {
	let projectID = 2;
  let nodes
  let issues

  

      // Fetch nodes data if nodesDataStore is empty
    const { data: nodesData, error: nodesError } = await supabase
    .from('nodes')
    .select()
    .eq('project_id', projectID); // Filter nodes by project_id
  
    if (nodesError) {
        console.error('Error fetching nodes:', nodesError);
        return { nodes }; // Return early if there's an error fetching nodes
    }

    if (nodesData) {
        nodes = nodesData;
    }
      
    const { data: issuesData, error: issuesError } = await supabase
    .from('issues')
    .select()
    .eq('project_id', projectID); // Filter issues by project_id

    if (issuesError) {
      console.error('Error fetching issues:', issuesError);
    }

    if (issuesData) {
        issues = issuesData;
    }
      
  return {
      nodes: nodes, // Use the local nodes variable which may have been updated
      issues: issues ?? [],
  };


}
