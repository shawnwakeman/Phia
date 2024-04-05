<script lang="ts">


    import type { Issue, Node, FilePath } from "../../types/collection";
    import { addIssue, supabase, findRootNodes } from "../../lib/supabaseClient";
    import { filePathDataStore, nodesDataStore } from "../../stores";
    import { writable } from 'svelte/store';

    import * as Accordion from "$lib/components/ui/accordion";
    import DirectedGraph from "$lib/Notbook/DirectedGraph.svelte";
    export let data: { files: FilePath[], nodes: Node[] };

    import TextEditor from "$lib/Notbook/TextEditor.svelte"


    import { toggleMode } from "mode-watcher";
    import { Button } from "$lib/components/ui/button/index.js";
    
    filePathDataStore.set(data.files)
    nodesDataStore.set(data.nodes)
    
    console.log($nodesDataStore);
    

    
    export const activeNode = writable<null | Node>(null);

// Editor type state ('text' or 'canvas')
    export const editorType = writable<'text' | 'canvas'>('text');
    
    function handleNodeClick(node: Node) {
        activeNode.set(node);
        // Optionally reset the editor type on new selection
        editorType.set('text');
    }// Store to keep track of the currently selected folder

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

{#each $nodesDataStore as node (node.id)}
    <button on:click={() => handleNodeClick(node)}>{node.name}</button>
    <br>
  
{/each}

<select bind:value={$editorType}>
    <option value="text">Text Editor</option>
    <option value="canvas">Canvas</option>
  </select>


  <a data-sveltekit-preload-data="hover" href="/">
    
    fuckin issys
</a>


<Button on:click={toggleMode} variant="outline" size="icon">
    <h1>one</h1>
   
    <span class="sr-only">Toggle theme</span>
  </Button>


    <TextEditor/>
  


<!-- <DirectedGraph/> -->

