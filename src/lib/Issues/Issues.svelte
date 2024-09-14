<script lang="ts">
    import Kaban from '$lib/Issues/Kaban/Kaban.svelte'
    import Treemap from '$lib/Issues/Treemap.svelte'
    import TreemapOptions from '$lib/Issues/TreemapDisplayOptions.svelte'
    import List from '$lib/Issues/List/index.svelte'
    import ListOptions from '$lib/Issues/List/ListDisplayOptions.svelte'
    import type { Issue, Node } from "../../types/collection";
    import { issuesDataStore, filteredIssuesDataStore, selectedIssues } from "$lib/stores";
    import FilterControls from '$lib/Issues/Kaban/Filter.svelte'
    import KanbanOptions from '$lib/Issues/Kaban/FilterControls.svelte'
    import SelectionBar from '$lib/Issues/selectionBar.svelte'
    import { onMount } from 'svelte';
    import { Rows3, SquareKanban, Network } from 'lucide-svelte';
    import { Button } from "$lib/components/ui/button/index.js";
    import { get } from 'svelte/store';
    import AddButton from '$lib/Issues/Kaban/AddButton.svelte'


    export let data: { nodes: Node[], issues: Issue[] };


 

    let currentViewID = "kaban"



    function setCurrentView(viewid: string) {
        currentViewID = viewid;
    }








 
    

    


    onMount(async () => {
       
        const issues = get(issuesDataStore);
        filteredIssuesDataStore.set(issues);  // Set the initial filtered issues store value
        

       
    });




</script>


<main class="main">

    <div class="content-issues">

            
            <div class="layout" id="layout-id">
                <div class="left-section">

                    <FilterControls/>

             
                    
                </div>
                <div class="middle-section">
                    
                    
                 
                    <AddButton/>
                    {#if currentViewID === 'table'}
                        <h1 class="font-default font-bold">List</h1>
                        <ListOptions/>
                    {:else if currentViewID === 'kaban'}
                        <h1 class="font-default font-bold">Board</h1>
                        <KanbanOptions/>
                    {:else if currentViewID === 'treemap'}
                        <h1 class="font-default font-bold">Treemap</h1>
                        <TreemapOptions/>
                    {/if}
             
                   
                </div>
                <div class="right-section">
             
                 
                    
                    <Button variant="outline" size="icon" class="bg-transparent border-none group p-0 m-0" on:click={() => setCurrentView("table")}>
                        <Rows3 class="w-4 h-4 text-current group-hover:text-highlight-color" />
                    </Button>
                    <Button variant="outline" size="icon" class="bg-transparent border-none group p-0 m-0" on:click={() => setCurrentView("kaban")}>
                        <SquareKanban class="w-4 h-4 text-current group-hover:text-highlight-color" />
                    </Button>
                    <Button variant="outline" size="icon" class="bg-transparent border-none group p-0 m-0" on:click={() => setCurrentView("treemap")}>
                        <Network class="w-4 h-4 text-current group-hover:text-highlight-color" />
                    </Button>

                
                </div>


            </div>
   
        

       
            {#if currentViewID === 'table'}
        
            <div class="internals-list">
                <List/>
            </div>
            {:else if currentViewID === 'kaban'}
            <div class="internals-kanban">
            <Kaban/>
             </div>
            {:else if currentViewID === 'treemap'}
                <div class="internals-treemap" id="treemap-id">
                    <Treemap/>
                </div>
                
            {/if}
      
           

        
    </div>

    <div class:bottom-bar-visible={$selectedIssues.length > 0} class="bottom-bar">
        <SelectionBar/>
    </div>


</main>
<style> 

    html, body {
        height: 100%;
        margin: 0;
    }

  



    .main {
      display: flex;
      
      height: 100vh;
  
      overflow: hidden;
      background-color: rgb(31, 41, 55);
    }

    .content-issues {
  
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: auto;
        user-select: none;
    }

    .bottom-bar {
        position: fixed;
        bottom: -60px; /* Initially hidden below the viewport */
        left: 35%; /* Centered horizontally (30% of screen width, 35% left + 30% width = 65%, so centered) */
        width: 30%;
        height: 50px; /* Reduced height */
        background-color: #333;
        color: white;
        display: flex;
        justify-content: space-around;
        align-items: center; /* Center content vertically */
        padding: 0.5em;
        border-radius: 10px; /* Optional: rounded corners */
        transition: bottom 0.3s ease-in-out;
    
    }

    .bottom-bar-visible {
        bottom: 20px; /* Slide up into view with a gap from the bottom */
        z-index: 1;
    }

    .bottom-bar button {
        background: #444;
        color: white;
        border: none;
        padding: 0.3em 0.6em; /* Adjusted padding for smaller buttons */
        cursor: pointer;
        border-radius: 5px; /* Optional: rounded buttons */
    }

    .bottom-bar button:hover {
        background: #555;
    }
    .internals-kanban {
        overflow: hidden;
        height: 100%;
        background: rgb(6, 6, 8);   
        margin-left: 12px;
        margin-right: 12px;
        margin-bottom: 12px;
        border-radius:   8px;
    }
    .internals-list {
        overflow: hidden;
        height: 100%;
         background: rgb(6, 6, 8);   
        margin-left: 12px;
        margin-right: 12px;
        margin-bottom: 12px;
        border-radius:   8px;

     

    }

    .internals-treemap {

        overflow: hidden;

    }
    




    .layout {
        display: flex;
        padding-top: 10px;
        padding-bottom: 10px;
        padding-left: 25px;
        padding-right: 25px;
    }



    .left-section {
        flex: 1;
        display: flex;
        align-items: center; /* Centers content vertically */
        
    }



    .middle-section {
  

        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    .right-section {
        flex: 1;
        display: flex;
   
        align-items: center; /* Centers content vertically */
        justify-content: right; /* Centers content horizontally */
        text-align: center; /* Centers text horizontally within the flex container */
    }



  

  </style>