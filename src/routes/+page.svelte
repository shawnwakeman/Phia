<script lang="ts">
    import BarChart from "../lib/BarChart.svelte";
    import NodeCreator from "../lib/NodeCreator.svelte";
    import SideBar from "../lib/SideBar/SideBar.svelte";
    import { onMount } from 'svelte';
    import type { Node } from "../types/collection";
    import { selectedNodeId, selectedNodeStore, nodesDataStore} from "../stores";


    export let data: { nodes: Node[] };


    

    $: $selectedNodeId, updateSelectedNodeStore();

    function updateSelectedNodeStore() {
        const selectedNode = data.nodes.find(node => node.id === $selectedNodeId);
            selectedNodeStore.set(selectedNode || null);
    }

    nodesDataStore.set(data.nodes);
    
    onMount(() => {
        updateSelectedNodeStore();
       

        
        
    });



</script>

<ul>
    {#each $nodesDataStore as node}
      <li>{node.name}</li>
    {/each}
  </ul>

<h1>
    {$selectedNodeStore?.id}, 
    {$selectedNodeStore?.name}, 
    {$selectedNodeStore?.parent_id}, 
    {$selectedNodeStore?.value}
  </h1>
<BarChart/>
<NodeCreator/>
<SideBar active = {true}/>