<script lang="ts">
    import type { Issue } from "../../types/collection";
    import { selectedNodeStore, issuesDataStore } from "../../stores";
    import { fetchNestedIssues, updateIssue } from "../supabaseClient";

    import { onMount } from 'svelte';

    let rows: Issue[] = [];
    let columnNames: string[] = [];

    let issuesDataStoreLength = 0

    $: if ($selectedNodeStore && $issuesDataStore) {

            
        if ($issuesDataStore.length - issuesDataStoreLength != 0) {
            fetchNestedIssues($selectedNodeStore.id).then(fetchedIssues => {
            rows = fetchedIssues;
            // Update columnNames based on the keys of the first issue, if not already set
            if (rows.length > 0 && columnNames.length === 0) {
                columnNames = Object.keys(rows[0]);
            }
            console.log("Issues updated");
            issuesDataStoreLength = $issuesDataStore.length
        }).catch(error => console.error("Failed to fetch nested issues:", error));
        }
    
            
        

    }

    function getPropertyValue(row: Issue, propertyName: string): string {
        const key: keyof Issue = propertyName as keyof Issue;
        return row[key] ? String(row[key]) : 'null';
    }


    async function saveChanges(issue: Issue) {
    try {
      // Implement this function based on your API
      const updatedIssue = await updateIssue(issue);
      console.log("Issue updated successfully", updatedIssue);
    } catch (error) {
      console.error("Failed to update issue", error);
    }
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
<!-- Table Structure -->
<table>
    <!-- Table Header -->
    <thead>
      <tr>
        {#each columnNames as columnName}
          <th>{columnName}</th>
        {/each}
        <th>Actions</th> <!-- Column for actions like saving changes -->
      </tr>
    </thead>
    <!-- Table Body -->
    <tbody>
      {#each rows as row, index}
        <tr>
          {#each columnNames as columnName}
            <td>
              <!-- Editable input field, bound to the issue property -->
              <input type="text" bind:value={row[columnName]} />
            </td>
          {/each}
          <td>
            <!-- Save button -->
            <button on:click={() => saveChanges(row)}>Save Changes</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  