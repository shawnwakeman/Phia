import { supabase, fetchNestedIssues } from '$lib/supabaseClient';
import { get } from 'svelte/store'; // Import get to use with Svelte stores
import { selectedNodeStore, nodesDataStore, issuesDataStore } from "../../stores";
import type { Issue } from "../../types/collection";



export async function load() {

    let nodes

    console.log("dassadasddas", nodes);
    
 
        // Fetch nodes data if nodesDataStore is empty
        const { data: nodesData, error: nodesError } = await supabase
          .from('nodes')
          .select();
    
        if (nodesData) {
          nodes = nodesData; // Update local nodes variable with the fetched data
        }
        
        
   
    const { data: issuesData, error: issuesError } = await supabase
        .from('issues')
        .select();

        
    return {
        nodes: nodes, // Use the local nodes variable which may have been updated
        issues: issuesData ?? [],
    };


}

