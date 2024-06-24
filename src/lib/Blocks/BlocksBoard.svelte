<script lang="ts">
	// This is done in a single file for clarity. A more factored version here: https://svelte.dev/repl/288f827275db4054b23c437a572234f6?version=3.38.2
    import { flip } from 'svelte/animate';
    import { dndzone } from 'svelte-dnd-action';
    




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



