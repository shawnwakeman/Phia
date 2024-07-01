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
    import { v4 as uuidv4 } from 'uuid';
    import TitleInfo from './TitleInfo.svelte';
    import DesignDoc from './designDoc.svelte';
    import List from '$lib/Issues/List/index.svelte'
    let saveStatus = 'Saved';
    let editor: EditorType;
    let currentContent: string = '';
    let currentNodeId: number;



    


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