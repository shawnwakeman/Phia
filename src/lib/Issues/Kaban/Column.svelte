<script lang="ts">
    import { dndzone } from 'svelte-dnd-action';
    import { flip } from 'svelte/animate';
    import Card from './Card.svelte';
    import { selectedIssues } from '../../../stores';
    import { get } from 'svelte/store';
    import AddButton from './AddButton.svelte';
    export let column;
    export let flipDurationMs;
    export let handleDndConsiderCards;
    export let handleDndFinalizeCards;
    export let board;
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import autoAnimate from '@formkit/auto-animate';
    $: selected = get(selectedIssues);

    let isHovered = false;



    function handleMouseEnter() {
        isHovered = true;
    }

    function handleMouseLeave() {
        isHovered = false;
    }


    
</script>

<style>
    .column {
        flex: 0 0 370px;
        padding: 0.5em;
        margin: 1em;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
     
    }


    .column-content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        width: 100%;
        height: fit-content; /* Set initial height */
    }




    .column:hover .plus-button {
        display: flex;
    }


</style>

<div class="column" on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
    <div class="column-content" use:dndzone={{ items: column.items, flipDurationMs }}
         on:consider={(e) => handleDndConsiderCards(column.id, e)} on:finalize={(e) => handleDndFinalizeCards(column.id, e)}>
     
        {#each column.items as item (item.id)}
            <div animate:flip={{ duration: flipDurationMs }}>
                <Card {item} {flipDurationMs} {board} />
            </div>
        {/each}

    
    </div>

</div>
