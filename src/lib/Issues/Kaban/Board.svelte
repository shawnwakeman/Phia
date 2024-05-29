<script lang="ts">
    import { flip } from 'svelte/animate';
    import { dndzone } from 'svelte-dnd-action';
    import {isDragging} from '../../../stores'
    import { updateIssue } from "$lib/supabaseClient";
    import { currentSelectedIssue } from "../../../stores";
  
    export let columnItems;
    export let rowName;
    export let rowByField;
    export let columnByField;
    export let orderBy;

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
        const updatedItems = e.detail.items.map((item, index) => ({
            ...item,
            [rowByField]: rowName,
            [columnByField]: newColumn.name
        }));

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
    }

    function handleClick(event) {
        const issueId = event.target.dataset.id;

        if (issueId) {
            const clickedIssue = columnItems
                .flatMap(column => column.items)
                .find(issue => issue.id === parseInt(issueId, 10));

            if (clickedIssue) {
                currentSelectedIssue.set(clickedIssue);
                console.log('Selected issue:', clickedIssue);
            } else {
                console.log("Issue not found with ID:", issueId);
            }
        } else {
            console.log("No issue ID found on the clicked element.");
        }
    }


    // let boardContainer;
    
    // let isDragging = false;
    // let startX = 0;
    // let startY = 0;
    // let scrollLeft = 0;
    // let scrollTop = 0;


    // function handleMouseDown(event) {
    //     isPanning = true;
    //     startX = event.pageX - boardContainer.offsetLeft;
    //     startY = event.pageY - boardContainer.offsetTop;
    //     scrollLeft = boardContainer.scrollLeft;
    //     scrollTop = boardContainer.scrollTop;
    //     boardContainer.style.cursor = 'grabbing';
    //     // Add grabbing style to column titles as well
    //     columnTitlesContainer.style.cursor = 'grabbing';
    // }

    // function handleMouseUp() {
    //     isPanning = false;
    //     boardContainer.style.cursor = 'grab';
    //     columnTitlesContainer.style.cursor = 'grab'; // Reset cursor style
    // }

    // function handleMouseMove(event) {
    //     if (!isPanning) return;
    //     event.preventDefault();
    //     requestAnimationFrame(() => {
    //         console.log("as");
            
    //         const x = event.pageX - boardContainer.offsetLeft;
    //         const y = event.pageY - boardContainer.offsetTop;
    //         const walkX = (x - startX);
    //         const walkY = (y - startY);
    //         boardContainer.scrollLeft = scrollLeft - walkX;
    //         columnTitlesContainer.scrollLeft = boardContainer.scrollLeft; // Sync scroll position
    //         boardContainer.scrollTop = scrollTop - walkY;
    //     });
    // }

</script>

<style>

    .board {
        display: flex;
        flex-wrap: nowrap;
        width: 100%;
        padding: 0.5em;
        margin-bottom: 40px;

    }
    .column {
        width: 300px;
        min-width: 300px;
        min-height: 200px; 
        flex-grow: 1;     
        padding: 0.5em;
        margin: 1em;
        border: 1px solid #333333;
        display: flex;
        flex-direction: column;
        overflow: hidden;  /* Ensure no internal scrollbar */
    }
    .column-content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
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
        <div class="column-title">{column.name}</div>
        <div class="column-content" use:dndzone={{ items: column.items, flipDurationMs }}
             on:consider={(e) => handleDndConsiderCards(column.id, e)} on:finalize={(e) => handleDndFinalizeCards(column.id, e)}>
          {#each column.items as item (item.id)}
            <div class="card" data-id={item.id} animate:flip={{ duration: flipDurationMs }} on:click={handleClick}>
              {item.name}
            </div>
          {/each}
        </div>
      </div>
    {/each}
</section>
