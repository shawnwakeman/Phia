<script lang="ts">
    import { flip } from 'svelte/animate';
    import { dndzone } from 'svelte-dnd-action';
    import {isDragging, issuesSelectedItems} from '../../../stores'
    import { updateIssue } from "$lib/supabaseClient";
 
    import Card from './Card.svelte';


    export let columnItems;
    export let rowName;
    export let rowByField;
    export let columnByField;
    export let orderBy;


   
    export let applyHideEmptyRowsAndColumns;
    export let board;
    let exportingColumns = columnItems;

    const flipDurationMs = 130;



    function handleDndConsiderCards(cid, e) {

        
        // set isdragging store to true
        isDragging.set(true); 
        const colIdx = columnItems.findIndex(c => c.id === cid);
        columnItems[colIdx].items = e.detail.items;
        columnItems = [...columnItems];
    }

    async function handleDndFinalizeCards(cid, e) {
        isDragging.set(false); // set isDragging to false
        const colIdx = columnItems.findIndex(c => c.id === cid);
        const newColumn = columnItems[colIdx];

        const updatedItems = e.detail.items.map((item, index) => {
            let updatedItem = {
                ...item,
                [rowByField]: rowName === `no ${rowByField}` ? null : rowName,
                [columnByField]: newColumn.name === `no ${columnByField}` ? null : newColumn.name,
            };
            return updatedItem;
        });

        // Sort updated items in the new column based on the orderBy field
        updatedItems.sort((a, b) => {
            if (a[orderBy] < b[orderBy]) return -1;
            if (a[orderBy] > b[orderBy]) return 1;
            return 0;
        });

        columnItems[colIdx].items = updatedItems;
        columnItems = [...columnItems];

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

        board = [...board];
        columnItems = [...columnItems];
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
    .column {
  
        min-height: 200px;
        flex: 0 0 370px; /* Prevent columns from growing or shrinking */
        padding: 0.5em;
        margin: 1em;
        border: 1px solid #333333;
        display: flex;
        flex-direction: column;
        overflow: hidden; /* Ensure no internal scrollbar */
    }
    .column-content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        width: 100%;
    }
    .column-titles {
        display: flex;
        justify-content: space-around;
        margin-bottom: 1em;
    }
    .column-title {
        margin-bottom: 1em;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .card {
        height: 15%;
        min-height: 100px;
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
      <div class="column">
        <!-- <div class="column-title">{column.name}</div> -->
        <div class="column-content" use:dndzone={{ items: column.items, flipDurationMs }}
             on:consider={(e) => handleDndConsiderCards(column.id, e)} on:finalize={(e) => handleDndFinalizeCards(column.id, e)}>
          {#each column.items as item (item.id)}
            
            <div animate:flip="{{duration: flipDurationMs}}" >
                <Card {item} {flipDurationMs} />
            </div>
          {/each}
        </div>
      </div>
    {/each}
</section>