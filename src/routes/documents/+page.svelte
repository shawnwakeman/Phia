<script lang="ts">
	import Editor from '$lib/editor/index.svelte';
	import content from './content.json';
	let title = 'Svelte Tiptap Notion Clone (Svnotion?)';


    import type { Issue, Node, FilePath } from "../../types/collection";
    import { addIssue, supabase, findRootNodes } from "../../lib/supabaseClient";
    import { filePathDataStore, nodesDataStore } from "../../stores";
    import { writable } from 'svelte/store';

    import * as Accordion from "$lib/components/ui/accordion";
    import DirectedGraph from "$lib/Notbook/DirectedGraph.svelte";
    export let data: { files: FilePath[], nodes: Node[] };

    import TextEditor from "$lib/Notbook/TextEditor/TextEditor.svelte"


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



</script>

<a data-sveltekit-preload-data="hover" href="/">
    
    fuckin issys
</a>


<Button on:click={toggleMode} variant="outline" size="icon">
    <h1>one</h1>
   
    <span class="sr-only">Toggle theme</span>
  </Button>


<div class="max-w-3xl p-2 m-auto my-16">
	<h1
		contenteditable
		bind:textContent={title}
		class="focus:outline-none text-4xl font-semibold mb-4"
	/>
	<Editor {content} />
</div>

<style>
	h1:empty::before {
		content: 'Title';
		color: #adb5bd;
	}
</style>
