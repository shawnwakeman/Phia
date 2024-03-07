<script lang="ts">
    import { selectedNodeId } from "../stores";
    import type { Node } from "../types/collection";
    import { updateNodeByID } from "./supabaseClient";
    export let active: boolean;
    export let data: { nodes: Node[] };
    
    let currentSelectedId: number | null = null; // Initialize as null to handle cases where no ID is selected
    let text = ''; // A reactive variable to hold the text box's value

    selectedNodeId.subscribe(value => {
        currentSelectedId = value;
    });

    $: selectedNodeData = currentSelectedId !== null 
        ? data.nodes.find(node => node.id === currentSelectedId) 
        : null;


    // Corrected the on:input handler to be a function
    function handleInput() {
        if(currentSelectedId !== null) { // Check if currentSelectedId is not null
            updateNodeByID(currentSelectedId, {
                name: text,
                // Ensure value is a number or undefined, but not null
                value: selectedNodeData?.value === null ? undefined : selectedNodeData?.value,
                parent_id: currentSelectedId
            });
        }
    }
</script>

<aside class:active>
    <h1>{selectedNodeData?.id}, {selectedNodeData?.name}, {selectedNodeData?.parent_id}, {selectedNodeData?.value}</h1>
    <input type="text" bind:value={text} on:input={handleInput} />
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
        left: 0px
    }
</style>
