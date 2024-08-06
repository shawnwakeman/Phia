<script lang="ts">
    import BulletList from './featureList.svelte';
    import { Editor } from "$lib/dist";
    import { Editor as EditorType } from '@tiptap/core';
    import Issues from '$lib/nodeManager/Issues.svelte';
    import State from './State.svelte';
    import TitleInfo from './TitleInfo.svelte';
    let saveStatus = 'Saved';
    let editor: EditorType;

    import { Maximize2 } from 'lucide-svelte';
    let isFullScreen = false;
    let editorContainer: HTMLDivElement;

    function toggleFullScreen() {
    isFullScreen = !isFullScreen;
    if (isFullScreen) {
        editorContainer.scrollIntoView({ behavior: 'smooth' });
    }
}
    


  </script>
  
  <div class="pointer-events-auto overflow-y-auto h-full py-4 pr-1.5 pl-4 flex flex-col gap-4">

    <TitleInfo/>
   

    <State/>



  
    <div class=" {isFullScreen ? 'py-5' : ''}" bind:this={editorContainer}>
        <div class={`feature-container editor-container ${isFullScreen ? 'full-screen' : ''}`} >
            <h1 class="text-xl font-bold text-muted-foreground">Summary</h1>
            <div class="absolute right-5 top-5 flex items-center">
                <button on:click={toggleFullScreen}>
                        <Maximize2 class="h-5 w-5 mr-2 text-muted-foreground"/>
                  </button>
                  <div class=" z-10 rounded-lg bg-muted text-sm text-muted-foreground px-2 p-1">
                    {saveStatus}
                  </div>
            </div>
       
            <div class="editor-container overflow-auto mt-5 min-h-80 {isFullScreen ? 'h-full' : 'max-h-96'}" >
              <Editor
                bind:editor
                onUpdate={() => {
                  saveStatus = 'Unsaved';
                }}
                onDebouncedUpdate={async () => {
                  saveStatus = 'Saving...';
                  setTimeout(() => {
                
                  }, 500);
                }}
              ></Editor>
            </div>
           
          </div>
           

        </div>
  
  
        
  
    





    <BulletList />
    <div class="feature-container">
        <Issues/>
        <!-- <List/> -->
    </div>

    
</div>
  <style>
    main {
        max-height: 100vh; 
        overflow-y: auto; /* Enables vertical scrolling */
        pointer-events: auto;
 
        padding-bottom: 2000px;
  
    }

    .feature-container {
        position: relative;
 
    }



    .feature-container.full-screen .editor-container {
        height: calc(100vh - 13rem);
  
    }

    .editor-container {
       
        transition: height 0.3s ease-in-out;
    }


   
</style>