<script lang="ts">
	// This is done in a single file for clarity. A more factored version here: https://svelte.dev/repl/288f827275db4054b23c437a572234f6?version=3.38.2
    import { flip } from 'svelte/animate';
    import { dndzone } from 'svelte-dnd-action';
    import { updateIssue, addOrUpdateConfig } from "$lib/supabaseClient";
    import { currentSelectedIssue} from "../../../stores";

    export let columnItems;


    console.log(columnItems);
    let searchTerm = '';

    $: filteredColumnItems = columnItems.map(column => ({
        ...column,
        items: column.items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }));


    const flipDurationMs = 100;
    function handleDndConsiderColumns(e) {
        columnItems = e.detail.items;
        
        
    }
    async function handleDndFinalizeColumns(e) {
        columnItems = e.detail.items;

        // Prepare the data for updating the database
        // Assuming your backend expects an array of objects with id and newIndex fields
        const updates = columnItems.map((column, newIndex) => ({
            id: column.id, // The column's ID
            newIndex: newIndex // The new position of the column
        }));

        // Update each column's position in the database
        for (const update of updates) {
            try {
                const result = await addOrUpdateConfig(update.id, update.newIndex);
                if (!result.success) {
                    console.error('Failed to update column position in database', result.error);
                } else {
                    console.log(`Column ${update.id} position updated to ${update.newIndex}`);
                }
            } catch (error) {
                console.error('Error updating column position', error);
            }
        }
    }

    // Dummy function - replace with your actual database update logic


    function handleDndConsiderCards(cid, e) {
        const colIdx = columnItems.findIndex(c => c.id === cid);
        columnItems[colIdx].items = e.detail.items;
        columnItems = [...columnItems];
    }
    function handleDndFinalizeCards(cid, e) {
        console.log("ads");
        
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
    function handleClick(event) {
    // Directly retrieve the 'data-id' attribute from the event target
    const issueId = event.target.dataset.id;

    if (issueId) {
        // Attempt to find the clicked issue from 'columnItems'
        const clickedIssue = columnItems
            .flatMap(column => column.items)
            .find(issue => issue.id === parseInt(issueId, 10)); // Convert string ID back to number

        if (clickedIssue) {
            currentSelectedIssue.set(clickedIssue);
            console.log('Selected issue:', clickedIssue);
        } else {
            console.log("Issue not found with ID:", issueId);
        }
    } else {
        console.log("No issue ID found on the clicked element.");
    }

    // Optional: Prevent event from bubbling if necessary
    // event.stopPropagation();
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
        min-height: 50%;
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

<input type="text" placeholder="Search issues..." bind:value={searchTerm} />

<!-- Use filteredColumnItems for rendering -->
<section class="board" use:dndzone={{items:columnItems, flipDurationMs, type:'columns'}} on:consider={handleDndConsiderColumns} on:finalize={handleDndFinalizeColumns}>
    {#each filteredColumnItems as column (column.id)}
    <div class="column" animate:flip="{{duration: flipDurationMs}}">
        <div class="column-title">{column.name}</div>
        <div class="column-content" use:dndzone={{items:column.items, flipDurationMs}}
             on:consider={(e) => handleDndConsiderCards(column.id, e)} on:finalize={(e) => handleDndFinalizeCards(column.id, e)}>
            {#each column.items as item (item.id)}
                <div class="card" data-id={item.id} animate:flip="{{duration: flipDurationMs}}" on:click={handleClick}>
                    {item.name}
                </div>
            {/each}
        </div>
    </div>
{/each}

</section>