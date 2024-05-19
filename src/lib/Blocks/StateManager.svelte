<script lang>
    import { selectedNodeStore, nodesDataStore } from '../../stores';
  
    import { updateNodeByID } from '$lib/supabaseClient';

    let state, olddata;

    selectedNodeStore.subscribe(data => {
        olddata = data
   
        state = data?.state;
    });





    function specialFunction() {

        
        // updateNodeAndChildrenTargetState(olddata.id, state);
      
    }

 
</script>

<div>
    <!-- First Dropdown for 'value' -->


    <!-- Second Dropdown for 'state' -->
    <label for="stateDropdown">Select State:</label>
    <select id="stateDropdown" bind:value={state} on:change={specialFunction}>
        <option value="Open">Open</option>
        <option value="Planned">Planned</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
    </select>


    <p>Selected State: {state}</p>
</div>