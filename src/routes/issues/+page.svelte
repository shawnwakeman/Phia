<script lang="ts">
    import Kaban from '../../lib/Issues/Kaban.svelte'
    import Table from '../../lib/Issues/Table.svelte'
    import Treemap from '../../lib/Issues/Treemap.svelte'
    import type { PageData } from './$types';
    
    export let data: PageData;

    let tabs = [{id: "table", name: "table"}, {id: "kaban", name: "kaban"}, {id: "treemap", name: "treemap"}]

    let currentViewID = "treemap"

    function setCurrentView(viewid: string) {
        currentViewID = viewid;
    }


    const dataDeepNested =  {
  "name": "Root",
  "children": [
    {
      "name": "Category 1",
      "children": [
        { 
          "name": "Subcategory 1", 
          "children": [
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
<div>
    {#each tabs as tab}
        <button on:click={() => setCurrentView(tab.id)}>{tab.name}</button>
    {/each}
</div>

{#if currentViewID === 'table'}
  <Table />
{:else if currentViewID === 'kaban'}
  <Kaban />
{:else if currentViewID === 'treemap'}

    <Treemap data={dataDeepNested} />


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