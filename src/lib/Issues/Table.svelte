<script lang="ts">
    import type { Issue, Node } from "../../types/collection";
    import { selectedNodeStore, issuesDataStore, nodesDataStore} from "../../stores";
    import { fetchNestedIssues, updateIssue, deleteIssue } from "../supabaseClient";
  

  
    let rows: Issue[] = [];
    let columnNames: string[] = [];
  
    // Removed redundant length tracking in favor of a more direct approach
  
    // Reactively fetch data when $selectedNodeStore changes, optimizing to avoid unnecessary fetches
    $: $selectedNodeStore?.id, fetchIssues();

    $: $issuesDataStore, fetchIssues();

    function getNestedIssues(nodeId: number, nodes: Node[], issues: Issue[]): Issue[] {
  // Function to find all child node IDs recursively
    function findChildNodeIds(nodeId: number, nodes: Node[]): number[] {
        const childNodes = nodes.filter(node => node.parent_id === nodeId);
        let childNodeIds = childNodes.map(node => node.id);
        for (let childNode of childNodes) {
        childNodeIds = childNodeIds.concat(findChildNodeIds(childNode.id, nodes));
        }
        return childNodeIds;
    }

    // Get all nested node IDs including the initial node
    const nestedNodeIds = [nodeId, ...findChildNodeIds(nodeId, nodes)];

    // Filter issues that belong to any of the nested nodes
    // Filter issues that belong to any of the nested nodes, ensuring node_id is not null
    return issues.filter(issue => issue.node_id !== null && nestedNodeIds.includes(issue.node_id));

    }

  
    async function fetchIssues() {
      if (!$selectedNodeStore) return;
      try {
        const fetchedIssues = await getNestedIssues($selectedNodeStore.id, $nodesDataStore, $issuesDataStore);
        rows = fetchedIssues;
  
        // Dynamically set columnNames only once assuming the issue structure does not change.
        if (rows.length > 0 && columnNames.length === 0) {
          columnNames = Object.keys(rows[0]);
        }
        console.log("Issues updated");
      } catch (error) {
        console.error("Failed to fetch nested issues:", error);
      }
    }
  
    function getPropertyValue(row: Issue, propertyName: string): string {
      const key: keyof Issue = propertyName as keyof Issue;
      return row[key] ? String(row[key]) : 'null';
    }
  
    async function saveChanges(issue: Issue) {
      try {
        const updatedIssue = await updateIssue(issue);
        console.log("Issue updated successfully", updatedIssue);
      } catch (error) {
        console.error("Failed to update issue", error);
      }
    }
  
    async function deleteRows(issue: Issue) {
      try {
        const updatedIssue = await deleteIssue(issue);
        console.log("Issue deleted successfully", updatedIssue);
        // After deleting, you might want to remove the issue from 'rows' to update the UI accordingly
        rows = rows.filter(row => row.id !== issue.id);
      } catch (error) {
        console.error("Failed to delete issue", error);
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
            <button on:click={() => deleteRows(row)}>DeleteRow</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  