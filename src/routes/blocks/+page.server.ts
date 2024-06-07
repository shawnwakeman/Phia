import { supabase } from "$lib/supabaseClient";
import { get } from 'svelte/store';




export async function load() {
	let projectID = 2;
    let nodes
    let issues
    let selectedNode
    let snapshots;
    
 
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
        // Find the first node without a parent_id
        const rootNode = nodes.find(node => node.parent_id === null);
        if (rootNode) {
          
			selectedNode = rootNode;

        }
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


  // Fetch snapshots
  const { data: snapshotsData, error: snapshotsError } = await supabase
	  .from('snapshots')
	  .select('snapshot_id, created_at')
	  .eq('project_id', projectID)
	  .order('created_at', { ascending: true });

  if (snapshotsError) {
	  console.error('Error loading snapshots:', snapshotsError);
	  console.timeEnd('FetchSnapshotsAndTargetStates');
	  return { success: false, error: snapshotsError.message };
  }
	snapshots = snapshotsData || [];
	


  // Fetch target states
  const { data: targetStates, error: targetStatesError } = await supabase
	.from('node_target_states')
	.select('*')
	.eq('project_id', projectID)



	if (targetStatesError) {
		console.error('Error fetching target states:', targetStatesError);
		return;
	}
	

	


        
    return {
        nodes: nodes, // Use the local nodes variable which may have been updated
		issues: issues ?? [],
		rootNode: selectedNode,
		snapshotsList: snapshots,
		targetStates: targetStates
    };


}
