<script lang="ts">
    import Kaban from '../../lib/Issues/Kaban/Kaban.svelte'
    import Card from '$lib/Issues/Kaban/Card.svelte'
    import Table from '../../lib/Issues/Table.svelte'
    import DataTable from '../../lib/Issues/DataTable/DataTable.svelte'
    import Treemap from '../../lib/Issues/Treemap.svelte'
    import Sidebar from '../../lib/Sidebar.svelte'
    import List from '$lib/Issues/List/index.svelte'
    import type { PageData } from './$types';
    import type { Issue, Node } from "../../types/collection";
    import { addIssue, supabase, findRootNodes } from "../../lib/supabaseClient";
    import { selectedNodeStore, issuesDataStore, nodesDataStore, selectedNodeId, currentSelectedIssue } from "../../stores";

    import { onMount } from 'svelte';

    import { get } from 'svelte/store';



    export let data: { nodes: Node[], issues: Issue[] };


    let tabs = [{id: "table", name: "table"}, {id: "kaban", name: "kaban"}, {id: "treemap", name: "Tree Map"}]

    let currentViewID = "table"

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
       

        
        updateSelectedNodeStore()
       
    });


   

    const flipDurationMs = 130;


</script>


<main class="main">
    <Sidebar/>
    <div class="content">
        <h1>Issue Tracker</h1>
  
       
        <h1>{$currentSelectedIssue?.id}</h1>
        <h1>{currentSelectedNode?.id}</h1>
        
        <a data-sveltekit-preload-data="hover" href="/">
        
            fuckin shi
        </a>
        <button on:click={() => createNewNode()}>add is broken</button> 
 
         
        
        
        
        <button>search</button>
        <h1>root . bread . etc</h1>
        
        <div>
            {#each tabs as tab}
                <button on:click={() => setCurrentView(tab.id)}>{tab.name}</button>
            {/each}
        </div>
        {#if currentViewID === 'table'}
        
        
            <List/>
        
        {:else if currentViewID === 'kaban'}
          <Kaban/>
        {:else if currentViewID === 'treemap'}
            <Treemap/>
        {/if}

        
          </div>
</main>
<style> 
    #treemap {
      display: block;
      margin: auto;
      max-width: 60%;
      height: auto;
      background-color: #f0f0f0; /* Light grey background */
    }
    .main {
      display: flex;
      height: 100vh;
      overflow: auto;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      user-select: none;  /* user */
    }
  

  </style>