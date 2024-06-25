<script lang="ts">
    import Kaban from '../../lib/Issues/Kaban/Kaban.svelte'
    import Card from '$lib/Issues/Kaban/Card.svelte'
    import Treemap from '../../lib/Issues/Treemap.svelte'
    import Sidebar from '../../lib/Sidebar.svelte'
    import List from '$lib/Issues/List/index.svelte'
    import FilterControls from '$lib/Issues/Kaban/Filter.svelte'
    import type { Issue, Node } from "../../types/collection";
    import { addIssue, supabase, findRootNodes } from "../../lib/supabaseClient";
    import { selectedNodeStore, nodesDataStore, selectedNodeId, currentSelectedIssue, filteredIssuesDataStore, filteredIssuesForSnapshot } from "../../stores";
    import { get, writable } from 'svelte/store';
    import { onMount } from 'svelte';







    let tabs = [{id: "table", name: "table"}, {id: "kaban", name: "kaban"}, {id: "treemap", name: "Tree Map"}]

    let currentViewID = "table"

    let show = false;
    let sidebarWidth: string = "50%"

    function setCurrentView(viewid: string) {
        currentViewID = viewid;
    }





    onMount(() => {
        const issues = get(filteredIssuesForSnapshot);
        filteredIssuesDataStore.set(issues);  // Set the initial filtered issues store value
   
    });

    const unsubscribe = filteredIssuesForSnapshot.subscribe(value => {
        const issues = get(filteredIssuesForSnapshot);
        filteredIssuesDataStore.set(issues);  // Set the initial filtered issues store value
        
    });

    




   



</script>



    <div class="content">
        <h1>Issue Tracker</h1>
  
       

        

 
         
        <FilterControls/>
        
        
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

<style> 
    #treemap {
      display: block;
      margin: auto;
      max-width: 60%;
      height: auto;
      background-color: #f0f0f0; /* Light grey background */
    }


    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      user-select: none;  /* user */
      margin-bottom: 200px;
    }
  

  </style>