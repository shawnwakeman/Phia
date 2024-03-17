<script lang="ts">
    import type { Issue } from "../../types/collection";
    import { selectedNodeStore, issuesDataStore } from "../../stores";
    import { fetchNestedIssues } from "../supabaseClient";

    import { onMount } from 'svelte';

    let rows: Issue[] = [];
    let columnNames: string[] = [];

    $: if ($selectedNodeStore && $issuesDataStore) {
        fetchNestedIssues($selectedNodeStore.id).then(fetchedIssues => {
            rows = fetchedIssues;
            // Update columnNames based on the keys of the first issue, if not already set
            if (rows.length > 0 && columnNames.length === 0) {
                columnNames = Object.keys(rows[0]);
            }
            console.log("Issues updated");
        }).catch(error => console.error("Failed to fetch nested issues:", error));
    }

    function getPropertyValue(row: Issue, propertyName: string): string {
        const key: keyof Issue = propertyName as keyof Issue;
        return row[key] ? String(row[key]) : 'null';
    }
</script>

  
<style>
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
  
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
  
    th {
      background-color: #f2f2f2;
    }
  
    tr:hover {
      background-color: #f5f5f5;
    }
  </style>

<!-- Table Structure -->
<table>
    <!-- Table Header -->
    <thead>
        <tr>
            {#each columnNames as columnName}
                <th>{columnName}</th>
            {/each}
        </tr>
    </thead>
    <!-- Table Body -->
    <tbody>
        {#each rows as row}
            <tr>
                {#each columnNames as columnName}
                    <td>{getPropertyValue(row, columnName)}</td>
                {/each}
            </tr>
        {/each}
    </tbody>
</table>
