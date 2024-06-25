import { supabase, createSnapshot } from "$lib/supabaseClient";
import { get } from 'svelte/store';




export async function load() {
	  let projectID = 1;
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
      .select('snapshot_id, created_at, end_date')
      .eq('project_id', projectID)
      .order('created_at', { ascending: true });

    if (snapshotsError) {
      console.error('Error loading snapshots:', snapshotsError);
      console.timeEnd('FetchSnapshotsAndTargetStates');
      return { success: false, error: snapshotsError.message };
    }
    snapshots = snapshotsData || [];

    const getWeekStartDate = (date: Date): Date => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    };

    const createNewSnapshot = async (startDate: Date) => {
        const end_date = new Date(startDate);
        end_date.setDate(end_date.getDate() + 7); // Set end date to 1 week after start date
        const newSnapshot = await createSnapshot(projectID, startDate, end_date);
        snapshots.push(newSnapshot);
    };

    const currentDate = new Date();
    if (snapshots.length === 0) {
        // If there are no snapshots, create three starting from the current week's start date
        const weekStartDate = getWeekStartDate(currentDate);
        await createNewSnapshot(weekStartDate);
        await createNewSnapshot(new Date(snapshots[0].end_date));
        await createNewSnapshot(new Date(snapshots[1].end_date));
    } else {
        // Check current block and ensure two blocks ahead
        let currentBlockIndex = snapshots.findIndex(snapshot => 
            new Date(snapshot.created_at) <= currentDate && new Date(snapshot.end_date) > currentDate
        );

        if (currentBlockIndex === -1) {
            currentBlockIndex = snapshots.length - 1;
        }

        // Ensure there are at least two blocks ahead of the current one
        while (snapshots.length < currentBlockIndex + 3) {
            const lastSnapshot = snapshots[snapshots.length - 1];
            await createNewSnapshot(new Date(lastSnapshot.end_date));
        }
    }

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
