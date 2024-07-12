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

    .column-content {
        min-height: 100px;
        
        display: flex;
        flex-direction: column;
        width: 400px;
        flex-grow: 1;
        flex-shrink: 1;
        margin-right: 1.5em;
        margin-left: 1.5em;
      
    }




    @media (max-width: 1600px) {
    .column-content {
        width: 300px;
    }
    }






</style>


    <div class="column-content" use:dndzone={{ items: column.items, flipDurationMs }}
         on:consider={(e) => handleDndConsiderCards(column.id, e)} on:finalize={(e) => handleDndFinalizeCards(column.id, e)}>
     
        {#each column.items as item (item.id)}
            <div animate:flip={{ duration: flipDurationMs }}>
                <Card {item} {flipDurationMs} {board} />
            </div>
        {/each}
    </div>


