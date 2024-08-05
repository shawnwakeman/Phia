<script lang="ts">
    import BulletList from './featureList.svelte';
    import { Editor } from "$lib/dist";
    import { Editor as EditorType } from '@tiptap/core';
    import Issues from '$lib/nodeManager/Issues.svelte';
    import State from './State.svelte';
    import TitleInfo from './TitleInfo.svelte';
    let saveStatus = 'Saved';
    let editor: EditorType;


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
        <div class={`feature-container ${isFullScreen ? 'full-screen' : ''}`} >
            <h1>Summary</h1>
            <div>
                <button on:click={toggleFullScreen}>
                    {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                  </button>
                  <div class="absolute right-5 top-5 z-10 mb-5 rounded-lg bg-stone-100 px-2 py-1 text-sm text-stone-400">
                    {saveStatus}
                  </div>
            </div>
       
            <div class="editor-container" >
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
        height: auto;
        transition: height 0.3s ease-in-out;
    }


   
</style>