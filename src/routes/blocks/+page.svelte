<script lang="ts">

    import type { Issue, Node } from "../../types/collection";
    import BlockStateView from '$lib/Blocks/BlockStateView.svelte'
    import OldStateViewer from '$lib/Blocks/OldStateViewer.svelte'
    import { selectedNodeId, selectedNodeStore, nodesDataStore, issuesDataStore, sidebarWidthStore} from "../../stores";
    import { onMount, onDestroy } from 'svelte';
    import { get } from "svelte/store";
    import Kaban from '$lib/Blocks/BlocksKanban.svelte'
    import StateManager from '$lib/Blocks/StateManager.svelte'
    import { Pane, Splitpanes } from 'svelte-splitpanes';
    import SideBar from "$lib/SideBar.svelte";
    import Sidebar from "$lib/SideBar.svelte";

    export let data: { nodes: Node[], issues: Issue[], rootNode: Node };


    $: $selectedNodeId, updateSelectedNodeStore();

    function updateSelectedNodeStore() {
        const selectedNode = get(nodesDataStore).find(node => node.id === $selectedNodeId);
            selectedNodeStore.set(selectedNode || null);
    }


    nodesDataStore.set(data.nodes)
    issuesDataStore.set(data.issues);
    selectedNodeId.set(data.rootNode.id)
    selectedNodeStore.set(data.rootNode)

    onMount(() => {
        updateSelectedNodeStore();
    

        
        
    });

    let sidebarWidth = [50];
    $: sidebarWidthStore.set(sidebarWidth);
    function setSidebarWidth(width) {
        sidebarWidth[0] = width;

        
    }

    let tabs = [{id: "editor", name: "editor"}, {id: "viewer", name: "viewer"}]

    let currentViewID = "editor"

    let show = false;


    function setCurrentView(viewid: string) {
        currentViewID = viewid;
}

</script>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .circle-container {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 20px; /* Space between circles and kanban boards */
    }
    .circle {
        width: 45vw; /* Adjust the size as needed */
        height: 45vw;
        border-radius: 50%;
        background-color: lightgray;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .horizontal-divider {
        height: 2px;
        width: 100%;
        background-color: gray;
        margin: 10px 0; /* Space around the divider */
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
      height: 100vh;
      overflow: hidden;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  
  
</style>



<main class="main">
    <Sidebar/>
    <div class="content">
        <div>
            {#each tabs as tab}
                <button on:click={() => setCurrentView(tab.id)}>{tab.name} </button>
                
            {/each}
        </div>

        {#if currentViewID === 'editor'}


        section to set the required data for the stuff
        <div class="container">
            <button on:click={() => setSidebarWidth(0)}>0/100</button>
            <button on:click={() => setSidebarWidth(50)}>50/50</button>
            <button on:click={() => setSidebarWidth(100)}>100/0</button>
          </div>

        <Splitpanes>
            <Pane bind:size={sidebarWidth[0]} class="centered-content">
              <div class="viz-wrapper">
                <div class="viz-wrapper horizontal-container">
                    <OldStateViewer/>
                    
                    <p>things that are going to change for the statesasdasdasdasdasdasdasdasdasdasdsadasdasdasd</p>
                </div>
                <div class="horizontal-divider"></div>
                <BlockStateView />
                <StateManager/>
              </div>
            </Pane>
            <Pane class="centered-content">
                things that are going to chnage for the states
                like to get a picture of whats changeing
                <Kaban />
            </Pane>
          </Splitpanes>


        {:else if currentViewID === 'viewer'}
            things in the viewer
            chart of all blocks, block viewer
            block viewer - inital state, current state, target state, grahpgs and dohikys, progress on or things or other fun metrics for issues
            <Splitpanes>
                <Pane bind:size={sidebarWidth[0]} class="centered-content">
                  <div class="viz-wrapper">
                    <div class="viz-wrapper horizontal-container">
                        <OldStateViewer/>
                        
                        <p>things that are going to change for the statesasdasdasdasdasdasdasdasdasdasdsadasdasdasd</p>
                    </div>
                    <div class="horizontal-divider"></div>
                    <BlockStateView />
                    <StateManager/>
                  </div>
                </Pane>
                <Pane class="centered-content">
                    things that are going to chnage for the states
                    like to get a picture of whats changeing
                    <Kaban />
                </Pane>
              </Splitpanes>
            {/if}
        
    </div>
</main>