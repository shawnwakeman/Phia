import { supabase, fetchNestedIssues } from '$lib/supabaseClient';
import { get } from 'svelte/store'; // Import get to use with Svelte stores
import { selectedNodeStore, nodesDataStore, issuesDataStore } from "../../stores";
import type { Issue } from "../../types/collection";



export async function load() {

    let nodes

 
        // Fetch nodes data if nodesDataStore is empty
        const { data: nodesData, error: nodesError } = await supabase
          .from('nodes')
          .select();
    
        if (nodesData) {
          nodes = nodesData; // Update local nodes variable with the fetched data
        }
        
        
   
    const { data: nodeFiles, error: issuesError } = await supabase
        .from('node_files')
        .select();

    if (nodeFiles) {
        console.log(nodeFiles);
        
    }
    return {
        files: nodeFiles, // Use the local nodes variable which may have been updated
        nodes: nodes,
    };


}

