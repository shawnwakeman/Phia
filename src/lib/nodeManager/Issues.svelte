<script lang="ts">
    import { selectedNodeStore, issuesDataStore, nodesDataStore } from "../../stores";
    import { fetchNestedIssues } from "../supabaseClient";
    import type { Issue, Node } from "../../types/collection";
    import DataTable from "$lib/Issues/DataTable/DataTable.svelte";
    let issues: Issue[] = [];
    let groupedIssues: { [key: string]: Issue[] } = {};
    let groupBy: 'priority' | 'state' = 'state'; // Default group by 'state'
    let activeGroup: string | null = null;
    $: currentSelectedNode = $selectedNodeStore;

    // Function to group issues by a given key
    function groupIssues(issues: Issue[], key: 'priority' | 'state'): { [key: string]: Issue[] } {
    return issues.reduce((acc, issue) => {
        // Provide a default value if the key is null or undefined
        let groupKey = (issue[key] == null ? 'Unknown' : issue[key]).toString();
        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(issue);
        return acc;
    }, {});
}


    // Reactive statement to fetch and dynamically group issues
    $: if (currentSelectedNode) {
        issues = getNestedIssues(currentSelectedNode.id, $nodesDataStore, $issuesDataStore);
        groupedIssues = groupIssues(issues, groupBy)
        console.log(issues);
        
        
    } else {
        issues = [];
        groupedIssues = {}; // Reset if no node is selected
    }

    function getNestedIssues(nodeId: number, nodes: Node[], issues: Issue[]): Issue[] {
  console.time('getNestedIssues');

  function findChildNodeIds(nodeId: number, nodes: Node[]): number[] {
    const childNodes = nodes.filter(node => node.parent_id === nodeId);
    let childNodeIds = childNodes.map(node => node.id);
    for (let childNode of childNodes) {
      childNodeIds = childNodeIds.concat(findChildNodeIds(childNode.id, nodes));
    }
    return childNodeIds;
  }

  const nestedNodeIds = [nodeId, ...findChildNodeIds(nodeId, nodes)];
  const filteredIssues = issues.filter(issue => issue.node_id !== null && nestedNodeIds.includes(issue.node_id));

  console.timeEnd('getNestedIssues');
  return filteredIssues;
}

    // Function to toggle visibility of a group
    function toggleGroup(key: string) {
        activeGroup = activeGroup === key ? null : key;
    }

    // Function to change grouping attribute
    function changeGroupBy(newGroupBy: 'priority' | 'state') {
        groupBy = newGroupBy;
        groupedIssues = groupIssues(issues, groupBy); // Re-group based on new attribute
    }
</script>

<!-- UI for selecting grouping attribute -->
<select bind:value={groupBy}>
    <option value="state">Group by State</option>
    <option value="priority">Group by Priority</option>
</select>

<!-- Display grouped issues in collapsible sections -->
{#each Object.keys(groupedIssues) as groupKey}
    <div>
        <button on:click={() => toggleGroup(groupKey)}>
            {groupKey} ({groupedIssues[groupKey].length} issues)
        </button>
        {#if activeGroup === groupKey}
            <div>
                {#each groupedIssues[groupKey] as issue}
                    <p>{issue.id} - Priority: {issue.priority}, State: {issue.state}</p>
                {/each}
            </div>
        {/if}
    </div>
{/each}

