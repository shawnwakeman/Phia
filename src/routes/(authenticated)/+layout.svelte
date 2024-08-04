
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
       
        margin: 0;
        padding: 0;
        display: flex;
        overflow: hidden;
        box-sizing: border-box; 

    }

    .slot-content {
        flex: 1;
    
        box-sizing: border-box;
        overflow: hidden;
    }
</style>




