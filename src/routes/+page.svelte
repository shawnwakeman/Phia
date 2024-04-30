<script lang="ts">
    import BarChart from "../lib/BarChart.svelte";
    import NodeCreator from "../lib/NodeCreator.svelte";
    import SideBar from "../lib/SideBar/SideBar.svelte";
    import { onMount } from 'svelte';
    import type { Node, Issue } from "../types/collection";
    import { selectedNodeId, selectedNodeStore, nodesDataStore, issuesDataStore} from "../stores";
    import { get } from "svelte/store";
    import { writable } from 'svelte/store';
    import { toggleMode } from "mode-watcher";
    import { Button } from "$lib/components/ui/button/index.js";
    import DirectedGraph from '../lib/Notbook/DirectedGraph.svelte'
    import NodeManager from '$lib/nodeManager/index.svelte'




    import Kaban from '$lib/Issues/Kaban/Kaban.svelte'

    import Treemap from '$lib/Issues/Treemap.svelte'
    export let data: { nodes: Node[], issues: Issue[] };
    

	import { Pane, Splitpanes } from 'svelte-splitpanes';
    import Sidebar from "$lib/Issues/Sidebar.svelte";
    import { active } from "d3";

    

    $: $selectedNodeId, updateSelectedNodeStore();

    function updateSelectedNodeStore() {
        const selectedNode = get(nodesDataStore).find(node => node.id === $selectedNodeId);
            selectedNodeStore.set(selectedNode || null);
    }


    nodesDataStore.set(data.nodes)
    issuesDataStore.set(data.issues);
    
    
    onMount(() => {
        updateSelectedNodeStore();
       

        
        
    });


  // Sidebar width state: 0 (closed), 50% (half), 100% (full)
    let sidebarWidth = [50];

    function setSidebarWidth(width) {
        sidebarWidth[0] = width;
    }


    let tabs = [{id: "table", name: "table"}, {id: "kaban", name: "kaban"}, {id: "treemap", name: "Tree Map"}]

    let currentViewID = "table"

    let show = false;


    function setCurrentView(viewid: string) {
        currentViewID = viewid;
    }


</script>


<body>
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
    
    
    
    
    
        
        <Button on:click={toggleMode} variant="outline" size="icon">
        <h1>one</h1>
        
        <span class="sr-only">Toggle theme</span>
        </Button>
    
    
    <!-- Buttons for setting the sidebar width -->
    
    
    <div class="container">
        
        <button on:click={() => setSidebarWidth(0)}>0/100</button>
        <button on:click={() => setSidebarWidth(50)}>50/50</button>
        <button on:click={() => setSidebarWidth(100)}>100/0</button>
        
    </div>
    
    
        <Splitpanes >
        <Pane bind:size={sidebarWidth[0]} class="centered-content">
            
            <div class="viz-wrapper">
                <BarChart/>
            </div>
        
            
        </Pane>
            <Pane class="centered-content">
                <NodeManager/>
            </Pane>
        </Splitpanes>
        
    
    
    
</body>





  <style>
    body {
        margin: 0;
        padding: 0;
        overflow: hidden;
    }
    .container {
        display: flex;
        flex-direction: column; /* Aligns children vertically */
        height: 100%; /* Ensures the Pane fills the Splitpane height */


    }

    .viz-wrapper {
        flex-grow: 1; /* Allows the wrapper to take up all remaining space */
        display: flex;
        justify-content: center; /* Center all items horizontally in the wrapper */
        align-items: center; /* Center all items vertically in the wrapper */
        
    }

    .viz-wrapper2 {


    }

    :global(.centered-content) {
        display: flex;
        flex-direction: column; /* Aligns children vertically */
        height: 100%; /* Ensures the Pane fills the Splitpane height */
        
    }


  

  </style>

