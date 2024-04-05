<script lang="ts">
    import BarChart from "../lib/BarChart.svelte";
    import NodeCreator from "../lib/NodeCreator.svelte";
    import SideBar from "../lib/SideBar/SideBar.svelte";
    import { onMount } from 'svelte';
    import type { Node } from "../types/collection";
    import { selectedNodeId, selectedNodeStore, nodesDataStore} from "../stores";
    import { get } from "svelte/store";

    import { toggleMode } from "mode-watcher";
    import { Button } from "$lib/components/ui/button/index.js";
    export let data: { nodes: Node[] };


    

    $: $selectedNodeId, updateSelectedNodeStore();

    function updateSelectedNodeStore() {
        const selectedNode = get(nodesDataStore).find(node => node.id === $selectedNodeId);
            selectedNodeStore.set(selectedNode || null);
    }

    nodesDataStore.set(data.nodes);
    
    onMount(() => {
        updateSelectedNodeStore();
       

        
        
    });



</script>


<ul>
    <a data-sveltekit-preload-data="hover" href="/issues">
    
        fuckin issys
    </a>

    <a data-sveltekit-preload-data="hover" href="/documents">

        fuckin docs
    </a>
    <a data-sveltekit-preload-data="hover" href="/workspace">

        fuckin workspace
    </a>


            

 
</ul>


<ul>
    {#each $nodesDataStore as node}
      <li>{node.name}</li>
    {/each}
  </ul>




   
  <Button on:click={toggleMode} variant="outline" size="icon">
    <h1>one</h1>
   
    <span class="sr-only">Toggle theme</span>
  </Button>
<h1>
    {$selectedNodeStore?.id}, 
    {$selectedNodeStore?.name}, 
    {$selectedNodeStore?.parent_id}, 
    {$selectedNodeStore?.value}
  </h1>
<BarChart/>
<NodeCreator/>
<SideBar active = {true}/>

