<script lang="ts">
    import { flip } from 'svelte/animate';
    import { dndzone } from 'svelte-dnd-action';
    import { isDragging } from '../../../stores';
    import { updateIssue } from "$lib/supabaseClient";
    import Column from './Column.svelte';

    export let items = [];
    export let rowName;
    export let rowByField;
    export let columnByField;
    export let orderBy;
    export let applyHideEmptyRowsAndColumns;
    export let board;
    let exportingColumns = items;
    import { cubicOut } from 'svelte/easing';

    const flipDurationMs = 130;

    function handleDndConsiderCards(cid, e) {
        isDragging.set(true); 
        const colIdx = items.findIndex(c => c.id === cid);
        items[colIdx].items = e.detail.items;
        items = [...items];
 
    }

    

    async function handleDndFinalizeCards(cid, e) {
        isDragging.set(false); 
        const colIdx = items.findIndex(c => c.id === cid);
        const newColumn = items[colIdx];

        const updatedItems = e.detail.items.map((item, index) => {
            let updatedItem = {
                ...item,
                [rowByField]: rowName === `no ${rowByField}` ? null : rowName,
                [columnByField]: newColumn.name === `no ${columnByField}` ? null : newColumn.name,
            };
            return updatedItem;
        });

        updatedItems.sort((a, b) => {
            if (a[orderBy] < b[orderBy]) return -1;
            if (a[orderBy] > b[orderBy]) return 1;
            return 0;
        });

        items[colIdx].items = updatedItems;
        items = [...items];

        updatedItems.forEach(async (item, index) => {
            try {
                const result = await updateIssue({ ...item, columnIndex: index });
                if (!result.success) {
                 
                } else {
                   
                }
            } catch (error) {
               
            }
        });
        // Fix
        applyHideEmptyRowsAndColumns();

        board = [...board]; //Fix
        items = [...items];
    }
    import { onMount, afterUpdate } from 'svelte';
    import { gsap } from 'gsap';


 
    let boardContainer: HTMLElement;
    let prevHeight = 0;


    function calculateHeight() {
        if (!boardContainer) return 0;

        // Get the maximum height of all columns by summing the heights of their children (items)
        let maxHeight = 0;

        Array.from(boardContainer.children).forEach((col: HTMLElement) => {
            const columnContent = col.querySelector('.column-content') as HTMLElement;
            if (columnContent) {
                let colHeight = Array.from(columnContent.children).reduce((acc, item: HTMLElement) => {
                    return acc + item.getBoundingClientRect().height;
                }, 0);
                if (colHeight > maxHeight) {
                    maxHeight = colHeight;
                }
            }
        });

        return maxHeight + 100;
    }


    function animateHeightChange() {
        if (!boardContainer) return;

        // Calculate the new height
        const newHeight = calculateHeight();

        if (newHeight !== prevHeight) {
            // Animate the height change
            gsap.to(boardContainer, { height: newHeight, duration: 0.4 });

            // Update the previous height
            prevHeight = newHeight;
        }
    }




    afterUpdate(() => {
        setTimeout(() => {
            animateHeightChange();
        }, 0);  // Delay of 100ms before accepting updates
    });
    import { Separator } from "$lib/components/ui/separator";

</script>


<style>
    .board-container {
        display: flex;
        flex-direction: row;
        margin-left: 2em;
    }
</style>

<div class="board-container" bind:this={boardContainer}>
    {#each items as column (column.id)}
    
        <Column {column} {flipDurationMs} {handleDndConsiderCards} {handleDndFinalizeCards} {board}/>
        <Separator orientation="vertical" />

    {/each}
</div>