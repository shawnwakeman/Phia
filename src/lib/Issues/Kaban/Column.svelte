<script lang="ts">
    import { dndzone } from 'svelte-dnd-action';
    import { flip } from 'svelte/animate';
    import Card from './Card.svelte';

    export let column;
    export let flipDurationMs;
    export let handleDndConsiderCards;
    export let handleDndFinalizeCards;
    export let board;

  


    
</script>

<style>
    .column {
        
    }

    .column-content {
        min-height: 100px;
        display: flex;
        flex-direction: column;
        width: 500px;
  
     
  

    }







</style>

<div class="column">
    <div class="column-content" use:dndzone={{ items: column.items, flipDurationMs }}
         on:consider={(e) => handleDndConsiderCards(column.id, e)} on:finalize={(e) => handleDndFinalizeCards(column.id, e)}>
     
        {#each column.items as item (item.id)}
            <div animate:flip={{ duration: flipDurationMs }}>
                <Card {item} {flipDurationMs} {board} />
            </div>
        {/each}
    </div>
</div>

