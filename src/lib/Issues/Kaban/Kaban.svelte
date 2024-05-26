<script lang="ts">
    import Board from './Board.svelte';
    import { onMount } from 'svelte';
    import { issuesDataStore, addedIssue } from "../../../stores";
    import { get } from 'svelte/store';
    import type { Issue } from "../../../types/collection";
  
    interface BoardColumn {
      id: number;
      name: string;
      items: Issue[];
    }

    
  
    const columnConfigs = {
      state: [
        { id: 0, name: 'Open' },

        { id: 1, name: 'DOING' },
        { id: 2, name: 'DONE' },
        { id: 4, name: 'unassigned' },
      ],
      priority: [
        { id: 0, name: 'High' },
        { id: 1, name: 'Medium' },
        { id: 2, name: 'Low' },
        { id: 3, name: 'unassigned' },
      ],
      // Add more configurations as needed
    };
  
    let columns: BoardColumn[] = [];
    let board: BoardColumn[] = [];
  
    let columnByField = 'state'; // Default field for columns
  
    // Function to get unique values for a given field from issues
    function getUniqueFieldValues(field: string, issues: Issue[]): string[] {
      const values = new Set(issues.map(issue => issue[field]).filter(value => value !== null));
      return Array.from(values) as string[];
    }
  
    // Function to update the board based on the selected field
    function updateBoardByField(field: string) {
      const issues: Issue[] = get(issuesDataStore);
      const configColumns = columnConfigs[field];
  
      if (configColumns) {
        // Initialize columns from the configuration
        columns = configColumns.map((config, index) => ({
          id: index,
          name: config.name,
          items: []
        }));
  
        // Populate the columns with issues
        board = transformIssuesToBoard(issues);
      } else {
        console.warn(`No configuration found for field: ${field}`);
      }
    }
  
    // Function to transform issues into the board format
    function transformIssuesToBoard(issues: Issue[]): BoardColumn[] {
      let board: BoardColumn[] = columns.map(column => ({
        id: column.id,
        name: column.name,
        items: []
      }));
  
      issues.forEach(issue => {
        const column = board.find(col => col.name === issue[columnByField]);
        if (column) {
          column.items.push(issue);
        } else {
          console.warn(`No column found for ${columnByField}: ${issue[columnByField]}`, issue);
          // Optionally handle issues with no matching column
          const unassignedColumn = board.find(col => col.name === 'unassigned');
          if (unassignedColumn) {
            unassignedColumn.items.push(issue);
          }
        }
      });
  
      // Sort items within each column if necessary
      board.forEach(column => {
        column.items.sort((a, b) => (a.id || 0) - (b.id || 0));
      });
  
      return board;
    }
  
    onMount(() => {
      updateBoardByField(columnByField);
    });
  
    $: if ($addedIssue) {
      updateBoardByField(columnByField);
      addedIssue.set(false);
    }
  
    function handleColumnByChange(event) {
      columnByField = event.target.value;
      updateBoardByField(columnByField);
    }
  </script>
  
  <style>
    :global(*) {
      box-sizing: border-box;
      margin: 0;
    }
  
    /* Add your styles here */
  </style>
  
  <div>
    <label for="column-by">Column By:</label>
    <select id="column-by" on:change={handleColumnByChange}>
      <option value="state">State</option>
      <option value="priority">Priority</option>
      <!-- Add more options as needed -->
    </select>
  </div>
  
  <Board columnItems={board}/>
