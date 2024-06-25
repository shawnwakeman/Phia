<script lang="ts">

    import type { Issue, Node, Blocks, TargetStates } from "../../types/collection";

    import { selectedNodeId, selectedNodeStore, nodesDataStore, issuesDataStore, sidebarWidthStore, blocksDataStore, targetStatesStore, currentBlock} from "../../stores";
    import { onMount } from 'svelte';
    import { get } from "svelte/store";

    import { Pane, Splitpanes } from 'svelte-splitpanes';

    import Sidebar from "$lib/Sidebar.svelte";
    
    import Timeline from '$lib/Blocks/Viewer/Timeline.svelte';
    import SidePanel from '$lib/Blocks/Viewer/SidePanel.svelte'

    import List from '$lib/Issues/Issues.svelte'
    import NodeManager from '$lib/nodeManager/index.svelte';
    import BarChart from "$lib/BarChart.svelte";
    export let data: { nodes: Node[], issues: Issue[], rootNode: Node, snapshotsList: Blocks[], targetStates: TargetStates[]};


    $: $selectedNodeId, updateSelectedNodeStore();

    function updateSelectedNodeStore() {
        const selectedNode = get(nodesDataStore).find(node => node.id === $selectedNodeId);
            selectedNodeStore.set(selectedNode || null);
    }

    function findCurrentSnapshot(snapshots: Blocks[]): Blocks | null {
        const currentDate = new Date();
        let currentSnapshot: Blocks | null = null;

        snapshots.forEach((snapshot) => {
            const startDate = new Date(snapshot.created_at);
            const endDate = new Date(snapshot.end_date);

            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                if (currentDate >= startDate && currentDate <= endDate) {
                    currentSnapshot = snapshot;
                }
            } else {
                console.error(`Invalid date in snapshot: ${JSON.stringify(snapshot)}`);
            }
        });

        console.log(currentSnapshot);
        return currentSnapshot;
    }






    nodesDataStore.set(data.nodes)
    issuesDataStore.set(data.issues);
    selectedNodeId.set(data.rootNode.id)
    selectedNodeStore.set(data.rootNode)
    blocksDataStore.set(data.snapshotsList)
    targetStatesStore.set(data.targetStates)
    let closest = findCurrentSnapshot(data.snapshotsList)
    if (closest) {
        currentBlock.set(closest)
    }
    
    
    onMount(() => {
        
        updateSelectedNodeStore();
    

        
        
    });

    let sidebarWidth = 46.85;
    $: sidebarWidthStore.set(sidebarWidth);
    function setSidebarWidth(width) {
        sidebarWidth = width;
    }



    let issuestabs = [{id: "state", name: "state"}, {id: "issues", name: "issues"}]
    let currentViewIDIssues = "state"
    function setCurrentViewIssues(viewid: string) {
        currentViewIDIssues = viewid;
    }




</script>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .horizontal-divider {
        height: 10px;
        width: 100%;
        background-color: gray;
        margin: 0; /* Space around the divider */
    }
    .kanban-container {
        display: flex;
        justify-content: center;
        align-items: stretch;
        gap: 10px; /* Adjust the gap as needed */
    }
    .kanban-board {
        flex: 1;
        display: flex;
        justify-content: center;
    }
    .horizontal-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px; /* Adjust the gap as needed */
        max-height: 600px; /* Set the maximum height as needed */
        overflow-y: auto;
    }

    .left {
        margin-right: auto;
    }

    .main {
      display: flex;
      max-height: 100vh;
      overflow: hidden;
    }

    .main-thing {
      display: flex;

      overflow: hidden;
    }


    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }


    .wrapper {
    
        display: flex;
        flex-direction: column;
        position: relative;
        max-height: 100vh; /* Prevents extending beyond the viewport height */
        overflow: hidden; /* Prevent overflow */

    }

    
    .container {
        display: flex;
        justify-content: space-around;
        max-width: 200px;
    }

    .passthrough-box {
        pointer-events: none;
    }



    .bar-chart-underlay {
        position: absolute;
        width: 100%;
        top: 0;
        right: 0;
    }

    .splitpanes-container {
        pointer-events: none;
        position: relative;
        flex: 1;
        z-index: 2; /* Ensure Splitpanes is above BarChart but below container */
    }





    :global(.splitpanes.my-theme .splitpanes__pane) {
        background-color: #a0414100;
       
    }

    :global(.splitpanes.my-theme .splitpanes__splitter) {
        background-color: #cccccc00;
        position: relative;
        pointer-events: auto;
    }

    :global(.splitpanes.my-theme .splitpanes__splitter:before) {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        transition: opacity 0.4s;
        padding-top: px;
        opacity: 0.8;
        opacity: 1;
        z-index: 3;
    }
    

    :global(.splitpanes.my-theme .splitpanes__splitter:hover:before) {
        opacity: 1;
    }

    :global(.splitpanes.my-theme .splitpanes__splitter.splitpanes__splitter__active) {
        z-index: 3; /* Fix an issue of overlap fighting with a near hovered splitter */
    }

    :global(.my-theme.splitpanes--vertical > .splitpanes__splitter:before) {
        left: 2.5vw;
        right: -3.5vw;
        height: 100%;
        cursor: col-resize;
    }

    :global(.my-theme.splitpanes--horizontal > .splitpanes__splitter:before) {
        top: -30px;
        bottom: -30px;
        width: 100%;
        cursor: row-resize;
    }


  
</style>



<main class="main">
    <Sidebar/>
    
    <div class="content">
        


        <SidePanel/>

        
        -----------------------------------------------------------------------------
        <div class="container">
            <button on:click={() => setSidebarWidth(0)}>0/100</button>
            <button on:click={() => setSidebarWidth(46.5)}>50/50</button>
            <button on:click={() => setSidebarWidth(100)}>100/0</button>
        </div>

        

        <div>
            {#each issuestabs as tab}
                <button on:click={() => setCurrentViewIssues(tab.id)}>{tab.name} </button>
                
            {/each}
        </div>

      
        <div class="main-thing">
            <Timeline/>
   


            <div class="content">

                <!-- <Button on:click={toggleMode} variant="outline" size="icon">
                    <h1>one</h1>
                    <span class="sr-only">Toggle theme</span>
                </Button> -->
        

                {#if currentViewIDIssues === 'state'}

                    <div class="wrapper" id="state-wrapper">
                        <div class="splitpanes-container">
                            <Splitpanes theme="my-theme" dblClickSplitter={false}>
                                <Pane bind:size={sidebarWidth} class="centered-content" >
                                    <div class="passthrough-box"></div>
                                </Pane>
                                <Pane class="centered-content node-manager-pane" >
                                    <NodeManager />
                                </Pane>
                            </Splitpanes>
                        </div>
                
                
                        <div class="bar-chart-underlay">
                            <BarChart />
                        </div>
                    </div>

                {:else if currentViewIDIssues === 'issues'}
                    <List/>
                {/if}
        
                
            </div>



        </div>
        
        
   
</main>