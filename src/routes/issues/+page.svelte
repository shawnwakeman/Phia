<script lang="ts">
    import Kaban from '../../lib/Issues/Kaban.svelte'
    import Table from '../../lib/Issues/Table.svelte'
    import Treemap from '../../lib/Issues/Treemap.svelte'
    import Sidebar from '../../lib/Issues/Sidebar.svelte'
    import type { PageData } from './$types';
    import type { Issue, Node } from "../../types/collection";
    import { fetchNestedIssues, addIssue, supabase } from "../../lib/supabaseClient";
    import { selectedNodeStore } from "../../stores";
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';


    function navigateToNodes () {
        goto('/');
    }
    export let data: PageData;

    let tabs = [{id: "table", name: "table"}, {id: "kaban", name: "kaban"}]

    let currentViewID = "treemap"

    let show = false;
    let sidebarWidth: string = "50%"

    function setCurrentView(viewid: string) {
        currentViewID = viewid;
    }

    let issues: Issue[] = [];


    let currentSelectedNode: Node | null = null
    $: currentSelectedNode = $selectedNodeStore;


    function createNewNode() {
        console.log("no call");
        

        addIssue(currentSelectedNode?.id ?? null);

    }


    $: if (currentSelectedNode) {
        fetchNestedIssues(currentSelectedNode.id).then(fetchedIssues => {
            issues = fetchedIssues;
            
        });
    } else {
        issues = []; // Reset issues if no node is selected
    }

    // Subscribe to the selectedNodeStore
    selectedNodeStore.subscribe(value => {
        currentSelectedNode = value;     
    });




    const dataDeepNested =  {
  "name": "Root",
  "children": [
    {
      "name": "Category 1",
      "children": [
        { 
          "name": "Subcategory 1", 
          "children": [
            { "name": "Item 2", "value": 30 },
            { "name": "Item 2", "value": 30 }
          ]
        },
        { 
          "name": "Subcategory 2", 
          "value": 50 
        }
      ]
    },
    {
      "name": "Category 2",
      "children": [
        {
          "name": "Subcategory 3",
          "value": 150
        },
        {
          "name": "Subcategory 4",
          "value": 150
        }
      ]
    }
  ]
};
onMount(() => {
    
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

<h1>Issue Tracker</h1>
<h1>{currentSelectedNode?.id}</h1>
<button on:click={() => navigateToNodes()}>back</button>
<button>search</button>
<h1>root . bread . etc</h1>
<Treemap data={dataDeepNested} />
<div>
    {#each tabs as tab}
        <button on:click={() => setCurrentView(tab.id)}>{tab.name}</button>
    {/each}
</div>
{#if currentViewID === 'table'}
  <Table rows={issues} />
{:else if currentViewID === 'kaban'}
  <Kaban rows={issues} />

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