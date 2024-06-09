<script lang="ts">
    import BarChart from "$lib/BarChart.svelte";
    import NodeCreator from "$lib/NodeCreator.svelte";

    import { onMount, onDestroy } from 'svelte';
    import type { Node, Issue, TargetStates } from "../../types/collection";
    import { selectedNodeId, selectedNodeStore, nodesDataStore, issuesDataStore, sidebarWidthStore, targetStatesStore} from "../../stores";
    import { get } from "svelte/store";
    import { writable } from 'svelte/store';
    import { toggleMode } from "mode-watcher";
    import { Button } from "$lib/components/ui/button/index.js";
    import DirectedGraph from '$lib/Notbook/DirectedGraph.svelte'
    import NodeManager from '$lib/nodeManager/index.svelte'

    import TestBoard from "$lib/TestBoard.svelte";


    import Kaban from '$lib/Issues/Kaban/Kaban.svelte'

    import Treemap from '$lib/Issues/Treemap.svelte'
    export let data: { nodes: Node[], issues: Issue[], rootNode: Node, targetStates: TargetStates[] };
    

	import { Pane, Splitpanes } from 'svelte-splitpanes';
    import Sidebar from "$lib/Sidebar.svelte";
    import { active } from "d3";

     

    $: $selectedNodeId, updateSelectedNodeStore();

    function updateSelectedNodeStore() {
        const selectedNode = get(nodesDataStore).find(node => node.id === $selectedNodeId);
            selectedNodeStore.set(selectedNode || null);
    }


    nodesDataStore.set(data.nodes)
    issuesDataStore.set(data.issues);
    selectedNodeId.set(data.rootNode.id)
    selectedNodeStore.set(data.rootNode)
    targetStatesStore.set(data.targetStates)
    console.log("asdasasdaad", data.targetStates);
    onMount(() => {
        updateSelectedNodeStore();
       

        
        
    });

    


  // Sidebar width state: 0 (closed), 50% (half), 100% (full)
    let sidebarWidth = [50];
    
    $: sidebarWidthStore.set(sidebarWidth);
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


<main class="main">
    <Sidebar />
    <div class="content">

   
      <Button on:click={toggleMode} variant="outline" size="icon">
        <h1>one</h1>
        <span class="sr-only">Toggle theme</span>
      </Button>
  
      <div class="container">
        <button on:click={() => setSidebarWidth(0)}>0/100</button>
        <button on:click={() => setSidebarWidth(50)}>50/50</button>
        <button on:click={() => setSidebarWidth(100)}>100/0</button>
      </div>
  
      <Splitpanes>
        
        <Pane bind:size={sidebarWidth[0]} class="centered-content">
          <div class="viz-wrapper">
            <BarChart />
  
          </div>
        </Pane>
        <Pane class="centered-content">
          <NodeManager />
        </Pane>
      </Splitpanes>
    </div>
  </main>
  
  <style>
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  
    .main {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
  
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  
    .container {
        display: flex;
        justify-content: space-around;
        max-width: 200px;
    }
  
    .viz-wrapper {
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  
    :global(.centered-content) {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  </style>