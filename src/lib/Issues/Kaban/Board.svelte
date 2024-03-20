<script lang="ts">
	// This is done in a single file for clarity. A more factored version here: https://svelte.dev/repl/288f827275db4054b23c437a572234f6?version=3.38.2
    import { flip } from 'svelte/animate';
    import { dndzone } from 'svelte-dnd-action';
    import { updateIssue } from "$lib/supabaseClient";

    export let columnItems;


    console.log(columnItems);
    
    const flipDurationMs = 100;
    function handleDndConsiderColumns(e) {
        columnItems = e.detail.items;
        
        
    }
    function handleDndFinalizeColumns(e) {
        columnItems = e.detail.items;
    }
    function handleDndConsiderCards(cid, e) {
        const colIdx = columnItems.findIndex(c => c.id === cid);
        columnItems[colIdx].items = e.detail.items;
        columnItems = [...columnItems];
    }
    function handleDndFinalizeCards(cid, e) {
        const colIdx = columnItems.findIndex(c => c.id === cid);
        const newColumn = columnItems[colIdx];
        const updatedItems = e.detail.items.map((item, index) => ({
            ...item,
            state: newColumn.name, // Assuming the column name matches the issue state
            columnIndex: index // Set columnIndex based on the new order within the column
        }));

        // Update local state
        columnItems[colIdx].items = updatedItems;
        columnItems = [...columnItems];

        // Update state of each card in the database
        updatedItems.forEach(async (item, index) => {
            try {
                // Ensure updateIssue is modified to handle and persist columnIndex updates
                const result = await updateIssue({...item, columnIndex: index});
                if (!result.success) {
                    console.error('Failed to update issue in database', result.error);
                } else {
                    console.log('Issue updated successfully', item);
                }
            } catch (error) {
                console.error('Error updating issue', error);
            }
        });
    }
    function handleClick(event: MouseEvent) {

        alert('Draggable elements are still clickable :)');
    }
</script>
<style>
    .board {
        display: flex; /* Change to flex to lay out children inline */
        flex-wrap: nowrap; /* Prevent columns from wrapping */
        overflow-x: auto; /* Enable horizontal scrolling */
        overflow-y: hidden; /* Prevent vertical scrolling */
        height: 90vh;
        width: 100%;
        padding: 0.5em;
        margin-bottom: 40px;
    }
    .column {
        min-height: 100%;
        min-width: 250px; /* Use min-width to ensure content dictates size, but not smaller than 250px */
        padding: 0.5em;
        margin: 1em;
        float: none; /* Since we're using flexbox, float is not necessary */
        border: 1px solid #333333;
        display: flex; /* Added to ensure title and content are flex children */
        flex-direction: column; /* Stack title and content vertically */
        overflow-y: hidden; /* Updated - Ensure this is hidden to prevent double scrollbars */
    }
    .column-content {
        overflow-y: auto; /* Allow this area to scroll if content overflows */
        flex-grow: 1; /* Allow this area to expand to fill available space */
    }
    .column-title {
        margin-bottom: 1em;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .card {
        height: 15%;
        width: 100%;
        margin: 0.4em 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #b30a0a;
        border: 1px solid #333333;
    }
</style>


<section class="board">
    {#each columnItems as column (column.id)}
        <div class="column" animate:flip="{{duration: flipDurationMs}}">
            <div class="column-title">{column.name}</div>
            <div class="column-content" use:dndzone={{items: column.items, flipDurationMs}}
                 on:consider={(e) => handleDndConsiderCards(column.id, e)} on:finalize={(e) => handleDndFinalizeCards(column.id, e)}>
                {#each column.items as item (item.id)}
                    <div class="card" animate:flip="{{duration: flipDurationMs}}" on:click={handleClick}>
                        {item.name}
                        {item.id}
                        
                    </div>
                {/each}
            </div>
        </div>
    {/each}
</section>
