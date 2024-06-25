<script lang="ts">
    import { selectedNodeStore, issuesDataStore, nodesDataStore, selectedNodeId } from "../../stores";
    import { addIssue, updateIssue, deleteIssue } from "../supabaseClient";
    import type { Issue, Node } from "../../types/collection";

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
   
        
        
    } else {
        issues = [];
        groupedIssues = {}; // Reset if no node is selected
    }

    function getNestedIssues(nodeId: number, nodes: Node[], issues: Issue[]): Issue[] {
  

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

    async function handleInputChange(issue: Issue, field: keyof Issue, value: string) {
        const updatedIssue = { ...issue, [field]: value };
        const result = await updateIssue(updatedIssue);
        if (result.success) {
            issuesDataStore.update(currentIssues => {
                const index = currentIssues.findIndex(i => i.id === updatedIssue.id);
                if (index !== -1) {
                    const updatedIssues = [...currentIssues];
                    updatedIssues[index] = { ...updatedIssues[index], ...updatedIssue };
                    return updatedIssues;
                }
                return currentIssues;
            });
        }
    }


</script>

<!-- UI for selecting grouping attribute -->
<select bind:value={groupBy}>
    <option value="state">Group by State</option>
    <option value="priority">Group by Priority</option>
</select>
<button on:click={() => addIssue($selectedNodeId)}>Add Issue</button>

{#each Object.keys(groupedIssues) as groupKey}
    <div>
        <button on:click={() => toggleGroup(groupKey)}>
            {groupKey} ({groupedIssues[groupKey].length} issues)
        </button>
        {#if activeGroup === groupKey}
            <div>
                {#each groupedIssues[groupKey] as issue}
                    <div>
                        <p>ID: {issue.id}</p>
                        <button on:click={() => deleteIssue(issue)}>DeleteIssue</button>
                        <label>
                            Name:
                            <input type="text" bind:value={issue.name} on:change={(e) => handleInputChange(issue, 'name', e.target.value)} />
                        </label>
                        <label>
                            Description:
                            <textarea bind:value={issue.description} on:change={(e) => handleInputChange(issue, 'description', e.target.value)}></textarea>
                        </label>
                    </div>
                    <p>-----------------------------------------------------------------------------</p>
                {/each}
            </div>
        {/if}
    </div>
{/each}