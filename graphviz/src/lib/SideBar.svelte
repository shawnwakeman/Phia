<script lang="ts">
    import { onMount } from "svelte";
    import { selectedNodeStore } from "../stores";
    import type { Node } from "../types/collection";
    import type { Issue } from "../types/collection";
    import { updateNodeByID } from "./supabaseClient";
    import { fetchNestedIssues } from "./supabaseClient";
    import IssueSection from "./IssueSection.svelte";
    export let active: boolean;


    
    let currentSelectedNode: Node | null = null; // To handle cases where no node is selected
    let text = ''; // A reactive variable to hold the input text value

    // Subscribe to the selectedNodeStore
    let issues: Issue[] = [];
    


    // Subscribe to the selectedNodeStore
    selectedNodeStore.subscribe(value => {
        currentSelectedNode = value;
        text = value?.name || ''; // Set text to the current node's name, or empty if no node is selected
    });


    onMount(async () => {
        
        
        issues = await fetchNestedIssues(currentSelectedNode?.id || 0);

    })

    // Function to send an update for the current node
    function sendUpdateForText() {
        if (currentSelectedNode) {
            updateNodeByID(currentSelectedNode.id, {
                name: text, // Update the name with the value from the text input
                value: currentSelectedNode.value ?? undefined, // Keep the existing value
                parent_id: currentSelectedNode.parent_id ?? undefined// Keep the existing parent ID
            }).then(() => {
                console.log('Update successful');
                // Optionally: Refresh data or notify the user of the update success
            }).catch((error) => {
                console.error('Update failed', error);
                // Handle the error, perhaps by notifying the user
            });
        }
    }

    // Optionally: Use a Svelte action for the input field to call sendUpdate on every input
</script>

<aside class:active>
    <h1>{currentSelectedNode?.id}, {currentSelectedNode?.name}, {currentSelectedNode?.parent_id}, {currentSelectedNode?.value}</h1>
    <input type="text" bind:value={text} on:input={sendUpdateForText} />
    <h1>Nested Issues</h1>

</aside>

<style>
    aside {
        position: absolute;
        left: -500px;
        transition: all .5s;
        height: 500px;
        width: 300px;
        padding: 20px;
        border: 1px solid #ddd;
        background-color: #efefef;
    }
    .active {
        left: 0px;
    }
</style>
