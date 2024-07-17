<script lang="ts">
    import BulletList from './featureList.svelte';
    import { Editor } from "$lib/dist";
    import { Editor as EditorType } from '@tiptap/core';
    import Issues from '$lib/nodeManager/Issues.svelte';
    import State from './State.svelte';
    import TitleInfo from './TitleInfo.svelte';
    let saveStatus = 'Saved';
    let editor: EditorType;




    


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

       
  
        
  
    





    <BulletList />
    <div class="feature-container">
        <Issues/>
        <!-- <List/> -->
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