
<script>
    import Sidebar from "$lib/Sidebar.svelte";
    
    export let data;

</script>

<div class="root-container">
    <Sidebar/>
    <div class="slot-content">
        <slot></slot>
    </div>
</div>


<style>
    .root-container {
        height: 100svh;
        background-image: 
		linear-gradient(
			150deg,
			hsla(0, 0%, 10%, 0.531) 0%,
			hsla(154, 33%, 8%, 0.575) 50%
		),
		url("/noiseSide.svg");
        margin: 0;
        padding: 0;
        display: flex;
        overflow: hidden;
        box-sizing: border-box; 

    }

    .slot-content {
        min-width: calc(100dvw - 3.5rem);
        overflow-x: hidden; /* Hides horizontal overflow */

        box-sizing: border-box;
        overflow: hidden;
    }
</style>




