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
                    console.error('Failed to update issue in database', result.error);
                } else {
                    console.log('Issue updated successfully', item);
                }
            } catch (error) {
                console.error('Error updating issue', error);
            }
        });

        applyHideEmptyRowsAndColumns();

        board = [...board]; //Fix
        items = [...items];
    }
</script>

<style>
    .board {
        display: flex;
        flex-wrap: nowrap;
        width: 100%;
        padding: 1em;
        margin-bottom: 40px;
    }
</style>


<section class="board">
    {#each items as column (column.id)}
        <Column {column} {flipDurationMs} {handleDndConsiderCards} {handleDndFinalizeCards} {board}/>
    {/each}
</section>
