<script lang="ts">
    import Kaban from '../../lib/Issues/Kaban.svelte'
    import Table from '../../lib/Issues/Table.svelte'
    import Treemap from '../../lib/Issues/Treemap.svelte'
    import type { PageData } from './$types';
    import type { Issue, Node } from "../../types/collection";
    import { fetchNestedIssues } from "../../lib/supabaseClient";
    import { selectedNodeStore } from "../../stores";
    export let data: PageData;

    let tabs = [{id: "table", name: "table"}, {id: "kaban", name: "kaban"}, {id: "add node", name: "+"} , {id: "half open", name: "1/2 o"}, {id: "full open", name: "o"}]

    let currentViewID = "treemap"

    function setCurrentView(viewid: string) {
        currentViewID = viewid;
    }

    let issues: Issue[] = [];
    let currentSelectedNode: Node | null = null;



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



</script>

<h1>Issue Tracker</h1>

<button>search</button>
<h1>root . bread . etc</h1>
<h1>filters</h1>
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

<style>
    #treemap {
      display: block;
      margin: auto;
      max-width: 60%;
      height: auto;
      background-color: #f0f0f0; /* Light grey background */
    }
  </style>