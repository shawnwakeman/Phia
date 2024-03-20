<script>

	import Board from './Board.svelte';

    import { onMount } from 'svelte';
    import { selectedNodeStore, issuesDataStore, addedIssue } from "../../../stores";
    import { fetchNestedIssues } from "../../supabaseClient";
    import { get } from 'svelte/store';
    import Popover from './Popover.svelte';

    let board = []; // Define board at the top level
    const columns = [
        { id: 1, name: "TODO" },
        { id: 2, name: "DOING" },
        { id: 3, name: "DONE" },
        { id: 4, name: "UNFILTERED" }
    ];
    onMount(() => {
        updateBoard()
    });

    function updateBoard() {
    if ($selectedNodeStore) {
      fetchNestedIssues($selectedNodeStore.id).then(issues => {
        board = transformIssuesToBoard(issues);
        console.log(board);
      }).catch(error => {
        console.error('Failed to fetch nested issues:', error);
      });
    }
  }

  $: $selectedNodeStore, updateBoard();

  $: if ($addedIssue) {
    board = transformIssuesToBoard(get(issuesDataStore)); // Use get() if you need to access the store value outside a reactive context
    console.log(board); // Logging the transformed board for debugging


    addedIssue.set(false)
  }



// Function to transform the issues array into the Kanban board structure
function transformIssuesToBoard(issues) {

    issues.sort((a, b) => a.columnIndex - b.columnIndex);

    // Sort columns by ID to ensure they are in the correct order
    const sortedColumns = columns.sort((a, b) => a.id - b.id);

    // Generate initial board structure from sorted columns array
    let board = sortedColumns.map(column => ({
    id: column.id, // Use the ID from the sorted columns array
    name: column.name,
    items: []
    }));

  // Map issues to their respective columns based on state
  issues.forEach(issue => {
    const column = board.find(col => col.name === issue.state);
    if (column) {
      column.items.push({
        id: issue.id,
        name: issue.name,
        created_at: issue.created_at,
        customcolumns: issue.customcolumns,
        description: issue.description,
        node_id: issue.node_id,
        priority: issue.priority,
        columnIndex: issue.columnIndex
        // Assuming 'state' is already used to determine the column
      });
    } else {
      // This else part might actually be redundant now,
      // as we already default to "UNFILTERED" in the find method above.
      // However, keeping it for the sake of explicitness or future changes.
      const unfilteredColumn = board.find(col => col.name === "UNFILTERED");
      unfilteredColumn.items.push({
        id: issue.id,
        name: issue.name,
        created_at: issue.created_at,
        customcolumns: issue.customcolumns,
        description: issue.description,
        node_id: issue.node_id,
        priority: issue.priority,
        columnIndex: issue.columnIndex
      });
    }
  });

  return board;
}



</script>

<style>
	:global(*) {
		box-sizing: border-box;
		margin: 0;
	}
</style>


<Board columnItems={board}></Board>
