<script>
    import { onMount } from 'svelte';
    import { blocksDataStore, currentBlock } from '../../../stores';


    let timelineContainer;
    let newEventDate = ''; // Holds the date for adding or modifying events
    let selectedEventDate = '';

    // Function to calculate the difference in days between two dates
    function dateDiffInDays(date1, date2) {
        const dt1 = new Date(date1);
        const dt2 = new Date(date2);
        const diffTime = Math.abs(dt2 - dt1);
        console.log(Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function selectEvent(event) {
        console.log(event);
        selectedEventDate = event.created_at;
        currentBlock.set(event) // Set the selected event date to the input field
        console.log(selectedEventDate);
    }

    function addEvent() {
        let newDate;
        blocksDataStore.update(blocks => {
            if (blocks.length === 0) {
                newDate = new Date(); // Or set a specific start date
            } else {
                newDate = new Date(blocks[blocks.length - 1].created_at);
                newDate.setDate(newDate.getDate() + 10);
            }
            const newBlock = {
                created_at: newDate.toISOString().split('T')[0],
                project_id: 1, // Default or dynamically set project_id
                snapshot_id: blocks.length + 1 // Increment snapshot_id or set appropriately
            };
            return [...blocks, newBlock];
        });

        setTimeout(() => {
            const newEventElement = timelineContainer.querySelectorAll('.event')[blocksDataStore.length - 1];
            if (newEventElement) {
                const elementTop = newEventElement.offsetTop;
                const elementHeight = newEventElement.offsetHeight;
                const containerHeight = timelineContainer.offsetHeight;
                const scrollTo = elementTop + elementHeight / 2 - containerHeight / 2;
                timelineContainer.scrollTo({ top: scrollTo, behavior: 'smooth' });
            }
        }, 0);
    }


    function findClosestEventIndex() {
        const currentDate = new Date();
        let closestIndex = 0;
        let minDiff = Infinity;
        $blocksDataStore.forEach((block, index) => {
            const blockDate = new Date(block.created_at);
            const diff = Math.abs(blockDate - currentDate);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = index;
            }
        });
        return closestIndex;
    }

    onMount(() => {
        const closestIndex = findClosestEventIndex();
        const closestEventElement = timelineContainer.querySelectorAll('.event')[closestIndex];
        if (closestEventElement && $blocksDataStore.length > 0) {
            selectedEventDate = $blocksDataStore[closestIndex].created_at;
            const elementTop = closestEventElement.offsetTop;
            const elementHeight = closestEventElement.offsetHeight;
            const containerHeight = timelineContainer.offsetHeight;
            const scrollTo = elementTop + elementHeight / 2 - containerHeight / 2;
            timelineContainer.scrollTo({
                top: scrollTo,
                behavior: 'smooth'
            });
        }
    });


function formatDate(dateString) {
    
    const options = { month: 'short', day: 'numeric' }; // Short month name and day
    return new Date(dateString).toLocaleDateString('en-US', options);
}


</script>

<style>
    .timeline-container {
        min-width: 150px; /* Adjust as needed to prevent shrinking */
        height: 100%;
        overflow-y: auto;
        border: 1px solid #ddd;
        padding: 10px;
        direction: rtl; /* Set the direction of the scrollbar to the left */
    }

    .timeline {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        position: relative;
        min-width: 100px; /* Ensure the timeline itself does not shrink */
        direction: ltr; /* Reset the direction for the content */
        padding-bottom: 200px;
    }

    .event {
        display: flex;
        align-items: center;
        position: relative;
        cursor: pointer;
        flex-direction: row-reverse; /* Adjust direction for items */
    }
    .circle {
        width: 20px;
        height: 20px;
        background-color: #3498db;
        border-radius: 50%;
        margin-left: 10px; /* Adjust margin to the left */
        position: relative;
    }

    .line {
        position: absolute;
        width: 2px;
        background-color: #3498db;
        top: 10px; /* Adjust starting point as needed */
        bottom: 10px; /* Adjust endpoint to stop before the bottom */
        right: 9px; /* Position line to the right of the circles */
    }




    .name {
        font-size: 15px;
        font-weight: bold;
        white-space: normal; /* Allows text to wrap */
        width: 65px; /* Adjust max-width as needed */
        word-wrap: break-word; /* Ensures words break properly */
    }

    .date {
        font-size: 14px;
        color: gray;
    }

    .add-circle {
        width: 20px;
        height: 20px;
        background-color: #00ff37;
        border-radius: 50%;
        margin-left: 10px; /* Adjust margin to the left */
        position: relative;
    }

    .highlight {
        border: 2px solid #f39c12; /* Highlight styling */
        padding: 5px;
        border-radius: 10px;
    }

</style>


<div class="timeline-container" bind:this={timelineContainer}>
    <div class="timeline">
        {#each $blocksDataStore as block, index}
            <div class="event" style="margin-bottom: {index < $blocksDataStore.length - 1 ? dateDiffInDays(block.created_at, $blocksDataStore[index + 1].created_at) * 8 + 'px' : '0'};">
                <div class="circle {selectedEventDate === block.created_at ? 'highlight' : ''}" on:click={() => selectEvent(block)}></div>
                <div>
                    <div class="name">{`Block ${block.snapshot_id}`}</div>
                    <div class="date">{formatDate(block.created_at)}</div>
                </div>
                {#if index < $blocksDataStore.length - 1}
                    <div class="line" style="height: {dateDiffInDays(block.created_at, $blocksDataStore[index + 1].created_at) * 5 + 1000}px; top: -100px;"></div>
                {:else}
                    <div class="line" style="height: 1000px; top: -100px;"></div>
                {/if}
            </div>
        {/each}
        <div class="event" style="margin-top: 80px; cursor: pointer;" on:click={addEvent}>
            <div class="line" style="height: 2000px; top: -100px;"></div>
            <div class="add-circle"></div>
            <div class="name">Add Block</div>
        </div>
    </div>
</div>