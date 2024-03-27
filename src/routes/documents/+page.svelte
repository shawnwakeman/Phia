<script lang="ts">


    import type { Issue, Node, FilePath } from "../../types/collection";
    import { addIssue, supabase, findRootNodes } from "../../lib/supabaseClient";
    import { filePathDataStore, nodesDataStore } from "../../stores";
    import { writable } from 'svelte/store';

    import * as Accordion from "$lib/components/ui/accordion";
    import DirectedGraph from "$lib/Notbook/DirectedGraph.svelte";
    export let data: { files: FilePath[], nodes: Node[] };

    
    filePathDataStore.set(data.files)
    nodesDataStore.set(data.nodes)
    
    console.log($nodesDataStore);
    
    let selectedNodeId = writable(null); // Store to keep track of the currently selected folder

// Add Folder function
function addFolder() {
  console.log("das");
  
}

// Add File function that adds a file to the currently selected folder
function addFile() {
    console.log("das");
  
}

// Function to update the currently selected node ID
function updateSelectedNodeId(nodeId) {
  selectedNodeId.set(nodeId);
}
</script>

<div>
<button on:click={addFolder}>Add Folder</button>
<button on:click={addFile}>Add File</button>
</div>

<Accordion.Root>
{#each $nodesDataStore as node (node.id)}
  <Accordion.Item value={node.id.toString()} on:click={() => updateSelectedNodeId(node.id)}>
    <Accordion.Trigger>{node.name}</Accordion.Trigger>
    <Accordion.Content>
      {#each $filePathDataStore as file}
        {#if file.node_id === node.id}
          <div>{file.file_id}</div>
        {/if}
      {/each}
    </Accordion.Content>
  </Accordion.Item>
{/each}
</Accordion.Root>

<DirectedGraph nodes={$nodesDataStore} files={$filePathDataStore}/>