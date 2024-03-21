<script lang="ts">

	import Board from './Board.svelte';

    import { onMount } from 'svelte';
    import { selectedNodeStore, issuesDataStore, addedIssue } from "../../../stores";
    import { fetchNestedIssues, fetchConfig } from "../../supabaseClient";
    import { get } from 'svelte/store';
    import type { Config, Issue } from "../../../types/collection";


    interface BoardColumn {
        id: number;
        name: string;
        items: Issue[]; // Assuming 'Issue' is a type that fits items within a column
    }

    let board: BoardColumn[] = []; // Define board at the top level
        const columns = [
        { name: "TODO" },
        { name: "DOING" },
        { name: "DONE" },
        { name: "UNFILTERED" }
    ];
    // onMount( async  () => {
    //     updateBoard()
    //     const fetchedColumns = await fetchConfig('kanban_columns');
    //     if (fetchedColumns) {
    //     columns = fetchedColumns;
    //     board = fetchedColumns; // If 'board' should mirror 'columns', assign it here
    // }
        
    // });

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
    const issues: Issue[] = get(issuesDataStore); // Ensure 'issuesDataStore' stores 'Issue[]'
    board = transformIssuesToBoard(issues);
    console.log(board);
    addedIssue.set(false);
  }



// Function to transform the issues array into the Kanban board structure
function transformIssuesToBoard(issues: Issue[]): BoardColumn[] {
        // Assuming issues are sorted and have an 'id', 'name', 'state', and other properties
        // Ensure 'columns' are used correctly with 'id' and 'name'

        let board: BoardColumn[] = columns.map(column => ({
            id: column.id, // Assuming 'column.id' exists and is unique
            name: column.name,
            items: []
        }));

        // Map issues to their respective columns based on state
        issues.forEach(issue => {
            const column = board.find(col => col.name === issue.state);
            if (column) {
                column.items.push(issue); // Directly push 'issue' assuming it fits the 'Issue' type
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
