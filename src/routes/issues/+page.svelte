<script lang="ts">
    import Kaban from '../../lib/Issues/Kaban/Kaban.svelte'
    import Table from '../../lib/Issues/Table.svelte'
    import DataTable from '../../lib/Issues/DataTable/DataTable.svelte'
    import Treemap from '../../lib/Issues/Treemap.svelte'
    import Sidebar from '../../lib/Issues/Sidebar.svelte'
    import type { PageData } from './$types';
    import type { Issue, Node } from "../../types/collection";
    import { addIssue, supabase, findRootNodes } from "../../lib/supabaseClient";
    import { selectedNodeStore, issuesDataStore, nodesDataStore, selectedNodeId, currentSelectedIssue } from "../../stores";

    import { onMount } from 'svelte';

    import { get } from 'svelte/store';



    export let data: { nodes: Node[], issues: Issue[] };


    let tabs = [{id: "table", name: "table"}, {id: "kaban", name: "kaban"}, {id: "treemap", name: "Tree Map"}]

    let currentViewID = "kaban"

    let show = false;
    let sidebarWidth: string = "50%"

    function setCurrentView(viewid: string) {
        currentViewID = viewid;
    }




    let currentSelectedNode: Node | null = null
    $: currentSelectedNode = $selectedNodeStore;


    function createNewNode() {
        console.log("no call");
        

        addIssue(currentSelectedNode?.id ?? null);

    }



    
    function updateSelectedNodeStore() {
        const selectedNode = data.nodes.find(node => node.id === $selectedNodeId);
            selectedNodeStore.set(selectedNode || null);
    }
    
    console.log("sadddddddd");
    
    nodesDataStore.set(data.nodes)
    issuesDataStore.set(data.issues);
    

    onMount(async () => {
       

        
        updateSelectedNodeStore()
        
        interface RealtimePostgresInsertPayload<T> {
            eventType: string;
            new?: T;
            old?: T;
        }
        function handleRealtimeEvent(payload: RealtimePostgresInsertPayload<{ [key: string]: any }>) {
            switch (payload.eventType) {
                case 'INSERT': {
                    // Extract and cast the necessary properties from payload.new
                    console.log("insering", payload.new)
                    const newNode: Issue = payload.new as Issue;
                    
                    break;
                }
                case 'UPDATE': {
                    // Extract and cast the necessary properties from payload.new
                

                    break;
                }
                case 'DELETE': {
                    // For delete, payload.old might contain the deleted node's data
                
                    break;
                }
                default:
                    console.warn("Unhandled event type:", payload.eventType);
            }

        }

        const channels = supabase.channel('custom-all-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, handleRealtimeEvent)
        .subscribe();
    });


   





</script>
<ul>
    {#each $nodesDataStore as node}
      <li>{node.name}</li>
    {/each}
  </ul>
<h1>Issue Tracker</h1>

<h1>{$currentSelectedIssue?.id}</h1>
<h1>{currentSelectedNode?.id}</h1>

<a data-sveltekit-preload-data="hover" href="/">

	Get current stonk values
</a>



<button>search</button>
<h1>root . bread . etc</h1>

<div>
    {#each tabs as tab}
        <button on:click={() => setCurrentView(tab.id)}>{tab.name}</button>
    {/each}
</div>
{#if currentViewID === 'table'}


    <DataTable/>

{:else if currentViewID === 'kaban'}
  <Kaban/>
{:else if currentViewID === 'treemap'}
    <Treemap/>
{/if}
<button on:click={() => { show = !show; sidebarWidth = '50%'; }}>Expand Half Width</button>
<button on:click={() => { show = !show; sidebarWidth = '100%'; }}>Expand Full Width</button>

<Sidebar {show} width = {sidebarWidth} />

<button on:click={() => createNewNode()}>add</button>


<style> 
    #treemap {
      display: block;
      margin: auto;
      max-width: 60%;
      height: auto;
      background-color: #f0f0f0; /* Light grey background */
    }
  </style>