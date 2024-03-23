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

    interface Config {
        config_key: string;
        config_value: any; // Use any or a more specific type if you know the structure
        id: number;
    }

    let columns: BoardColumn[] = [];
    let board: BoardColumn[] = [];


    onMount(async () => {
        const configs: Config[] | null = await fetchConfig('kanban_columns');
        if (configs) {
            const kanbanColumnsConfig = configs.find(config => config.config_key === 'kanban_columns');
            if (kanbanColumnsConfig && kanbanColumnsConfig.config_value) {
                // Assuming config_value directly contains the array of columns
                // and needs parsing if it's a JSON string
                let parsedColumns = Array.isArray(kanbanColumnsConfig.config_value) 
                    ? kanbanColumnsConfig.config_value 
                    : JSON.parse(kanbanColumnsConfig.config_value);

                // Sort columns by their id
                parsedColumns.sort((a, b) => a.id - b.id);

                columns = parsedColumns as BoardColumn[];
                board = columns.map(column => ({ ...column, items: [] }));
                updateBoard()
            }
        }
    });

    function updateBoard() {
        const issues: Issue[] = get(issuesDataStore); // Ensure 'issuesDataStore' stores 'Issue[]'
        board = transformIssuesToBoard(issues);
        console.log(board);
        addedIssue.set(false);
  }



  $: if ($addedIssue) {
    const issues: Issue[] = get(issuesDataStore); // Ensure 'issuesDataStore' stores 'Issue[]'
    board = transformIssuesToBoard(issues);
    console.log(board);
    addedIssue.set(false);
  }



  function transformIssuesToBoard(issues: Issue[]): BoardColumn[] {
    // Initialize the board with empty columns based on the predefined columns array
    let board: BoardColumn[] = columns.map(column => ({
        id: column.id,
        name: column.name,
        items: []
    }));

    // Map issues to their respective columns based on their state
    // If an issue's state is null, assign it to the "UNFILTERED" column
    issues.forEach(issue => {
        // Use the issue's state if it's not null, otherwise set it to "UNFILTERED"
        let issueState = issue.state || "UNFILTERED";

        // Find the column by name, assuming the issue's state directly corresponds to the column name
        // This includes the "UNFILTERED" column for issues with no specified state
        const column = board.find(col => col.name === issueState);

        if (column) {
            column.items.push(issue);
        } else {
            // Optionally handle the case where no matching column is found
            // This could happen if there's no "UNFILTERED" column defined, for example
            console.warn(`No column found for state: ${issueState}`, issue);
        }
    });

    return board;
}


    console.log(board);
    
</script>

<style>
	:global(*) {
		box-sizing: border-box;
		margin: 0;
	}
</style>


<Board columnItems={board}/>