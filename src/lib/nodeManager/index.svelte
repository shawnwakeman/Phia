<script lang="ts">
    import { onMount } from 'svelte';
    import BulletList from './featureList.svelte';
    import { selectedNodeId, selectedNodeStore, nodesDataStore} from "../../stores";
    import { Editor } from "@wakemanshawn/novel-svelte-shawnwakeman";
    import { fetchSummary, saveSummary } from '$lib/supabaseClient'
    import { Editor as EditorType } from '@tiptap/core';
    import Breadcrums from './breadcrums.svelte';
    import Issues from '$lib/nodeManager/Issues.svelte';
    import State from './State.svelte';
    import DataTable from '$lib/Issues/DataTable/DataTable.svelte';
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
        
    }

    .feature-container {
        padding: 30px;
                margin-right: 3vw;
        margin-left: 3vw;
        margin-top: 2vw; 
        margin-bottom: 2vw;
        /* padding-top: 600px; */

        background: hsl(227, 36%, 5%, 0.5);
        background-image: radial-gradient(circle at 89% 12%, hsla(223, 45%, 10%, 0.639) 0%, hsla(227, 69%, 3%, 0.64) 122%), url('/noise.svg'); 
            

        border-radius: 24px; 
     
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        box-shadow:  -10px 10px 24px hsla(223, 33%, 4%, 0.753);
        color: white;
        



    }

    .feature-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 24px; 
        border: 1px solid transparent;
        background: linear-gradient(210deg,hsl(0, 0%, 100%),hsl(222, 12%, 22%)) border-box;
        -webkit-mask:
            linear-gradient(#fff 0 0) padding-box, 
            linear-gradient(#fff 0 0);
        -webkit-mask-composite: destination-out;
        mask-composite: exclude;
        pointer-events: none;  /* Ignore all pointer events */
                
        
    }

    
</style>