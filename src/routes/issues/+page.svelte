<script lang="ts">
    import Kaban from '../../lib/Issues/Kaban/Kaban.svelte'
    import Card from '$lib/Issues/Kaban/Card.svelte'
    import Treemap from '../../lib/Issues/Treemap.svelte'
    import Sidebar from '../../lib/Sidebar.svelte'
    import List from '$lib/Issues/List/index.svelte'
    import type { PageData } from './$types';
    import type { Issue, Node } from "../../types/collection";
    import { addIssue, supabase, findRootNodes } from "../../lib/supabaseClient";
    import { selectedNodeStore, issuesDataStore, nodesDataStore, selectedNodeId, currentSelectedIssue, filteredIssuesDataStore, selectedIssues  } from "../../stores";
    import FilterControls from '$lib/Issues/Kaban/Filter.svelte'
    import SelectionBar from '$lib/Issues/selectionBar.svelte'
    import { onMount } from 'svelte';

    import { get } from 'svelte/store';



    export let data: { nodes: Node[], issues: Issue[] };


    let tabs = [{id: "table", name: "table"}, {id: "kaban", name: "kaban"}, {id: "treemap", name: "Tree Map"}]

    let currentViewID = "treemap"

    let show = false;
    let sidebarWidth: string = "50%"

    function setCurrentView(viewid: string) {
        currentViewID = viewid;
    }




    let currentSelectedNode: Node | null = null
    $: currentSelectedNode = $selectedNodeStore;


    function createNewNode() {
        
        const rootNode = data.nodes.find(node => node.parent_id === null);
        if (rootNode) {
            console.log(rootNode);
            
            addIssue(rootNode.id);
        }
        

    }



    
    function updateSelectedNodeStore() {
        const selectedNode = data.nodes.find(node => node.id === $selectedNodeId);
            selectedNodeStore.set(selectedNode || null);
    }
    

    nodesDataStore.set(data.nodes)
    issuesDataStore.set(data.issues);
    


    onMount(async () => {
       
        const issues = get(issuesDataStore);
        filteredIssuesDataStore.set(issues);  // Set the initial filtered issues store value
        
        updateSelectedNodeStore()
       
    });


   

    const flipDurationMs = 130;


</script>


<main class="main">
    <Sidebar/>
    <div class="content-issues">
        <div class="non-view">         
            <h1>Issue Tracker</h1>
  
       
            <h1>{$currentSelectedIssue?.id}</h1>
            <h1>{currentSelectedNode?.id}</h1>
            <FilterControls/>
    
            <button on:click={() => createNewNode()}>add is broken</button> 
     
             
            
            
            
            <button>search</button>
            <h1>root . bread . etc</h1>
            
            <div>
                {#each tabs as tab}
                    <button on:click={() => setCurrentView(tab.id)}>{tab.name}</button>
                {/each}
            </div>
            
        </div>

        <!-- <div class="data"> -->
            {#if currentViewID === 'table'}
        
        
            <List/>
            
            {:else if currentViewID === 'kaban'}
            <Kaban/>
            {:else if currentViewID === 'treemap'}
                <Treemap/>
            {/if}
        <!-- </div> -->

        

        
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
  
      overflow: auto;
    }

    .content-issues {
  
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
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


    /* .data {
        display: flex;
        flex: 1;
        overflow: auto;
    } */
  

  </style>