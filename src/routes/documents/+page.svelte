<script lang="ts">


    import type { Issue, Node, FilePath } from "../../types/collection";
    import { addIssue, supabase, findRootNodes } from "../../lib/supabaseClient";
    import { filePathDataStore, nodesDataStore } from "../../stores";
    import { writable } from 'svelte/store';

    import * as Accordion from "$lib/components/ui/accordion";
    import DirectedGraph from "$lib/Notbook/DirectedGraph.svelte";
    export let data: { files: FilePath[], nodes: Node[] };

    import TextEditor from "$lib/Notbook/TextEditor.svelte"
    import NodePad from "$lib/Notbook/NotePad.svelte"
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

<div>
    {#if $activeNode}
      {#if $editorType === 'text'}
        <TextEditor/>
      {:else if $editorType === 'canvas'}
        <NodePad/>
      {/if}
    {/if}
  </div>


<DirectedGraph nodes={$nodesDataStore} files={$filePathDataStore}/>