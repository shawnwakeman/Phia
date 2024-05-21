<script lang="ts">
    import { onMount } from 'svelte';
    import { Editor } from "@wakemanshawn/novel-svelte-shawnwakeman";
    import { fetchSummary, saveSummary } from '$lib/supabaseClient'
    import { Editor as EditorType } from '@tiptap/core';
    import { Button } from "$lib/components/ui/button/index.js";
    import { toggleMode } from "mode-watcher";
	import { writable } from 'svelte/store';
    import Sidebar from "$lib/Sidebar.svelte";
	

  
    let saveStatus = 'Saved';
    let editor: EditorType;
    let currentContent: string = '';

    async function loadTest() {
        const summary = await fetchSummary(68);
        
        
        if (summary) {
            currentContent = JSON.stringify(summary);
            localStorage.setItem('novel__content', currentContent);
        }
    }

    async function saveTest() {
        await saveSummary(68, JSON.parse(currentContent));
    }

    onMount(() => {
        loadTest();
    });

</script>



<style>

  
    .main {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }


  
   
  </style>


<main class="flex justify-center sm:pt-[15vh] sm:px-4">

    <button on:click={() => loadTest()}>Load</button>
    <Button on:click={toggleMode} variant="outline" size="icon">
        <h1>one</h1>
        <span class="sr-only">Toggle theme</span>
      </Button>
	<Editor
		bind:editor
		onUpdate={() => {
			saveStatus = 'Unsaved';
		}}
		onDebouncedUpdate={() => {
			saveStatus = 'Saving...';
            currentContent = localStorage.getItem('novel__content');
            console.log('Content saved!', currentContent);
			// Simulate a delay in saving.
			setTimeout(() => {
				saveStatus = 'Saved';
			}, 500);
		}}
	>
		<div
			class="absolute right-5 top-5 z-10 mb-5 rounded-lg bg-stone-100 px-2 py-1 text-sm text-stone-400"
		>
			{saveStatus}
		</div>
	</Editor>

   
    <button on:click={() => saveTest()}>Save</button>
    
</main>



