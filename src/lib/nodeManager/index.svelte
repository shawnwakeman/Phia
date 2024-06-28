<script lang="ts">
    import { onMount } from 'svelte';
    import BulletList from './featureList.svelte';
    import { selectedNodeId, selectedNodeStore, nodesDataStore} from "../../stores";
    import { Editor } from "$lib/dist";
    import { fetchSummary, saveSummary } from '$lib/supabaseClient'
    import { Editor as EditorType } from '@tiptap/core';
    import Breadcrums from './breadcrums.svelte';
    import Issues from '$lib/nodeManager/Issues.svelte';
    import State from './State.svelte';

    import TitleInfo from './TitleInfo.svelte';
    import DesignDoc from './designDoc.svelte';
    import List from '$lib/Issues/List/index.svelte'
    let saveStatus = 'Saved';
    let editor: EditorType;
    let currentContent: string = '';
    let currentNodeId: number;

    async function loadTest() {
        const summary = await fetchSummary(currentNodeId);
        if (summary) {
            currentContent = JSON.stringify(summary);
            localStorage.setItem('novel__content', currentContent);
            updateEditorContent(currentContent);
        }
    }

    async function saveTest() {
        await saveSummary(currentNodeId, JSON.parse(currentContent));
    }

    function updateEditorContent(content: string) {
        if (editor) {
            editor.commands.setContent(JSON.parse(content));
        }
    }

    onMount(() => {
        // Subscribe to nodeId changes
        const unsubscribe = selectedNodeId.subscribe(async (value) => {
            currentNodeId = value;
            await loadTest();
        });

        return () => {
            unsubscribe();
        };
    });



  </script>
  
  <main>

    <TitleInfo/>
   

    <State/>



  


    <div class="feature-container">
        <h1>Summary</h1>
        <Editor
            bind:editor
            onUpdate={() => {
                saveStatus = 'Unsaved';
            }}
            onDebouncedUpdate={async () => {
                saveStatus = 'Saving...';
                currentContent = localStorage.getItem('novel__content');
                console.log('Content saved!', currentContent);
                await saveTest();
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

    </div>

       
  
        
  
    

    <DesignDoc/>




    <BulletList />
    <div class="feature-container">

        <List/>
    </div>

    
  </main>
  <style>
    main {
        max-height: 100vh; 
        overflow-y: auto; /* Enables vertical scrolling */
        pointer-events: auto;
 
        padding-bottom: 2000px;
  
    }



    
</style>