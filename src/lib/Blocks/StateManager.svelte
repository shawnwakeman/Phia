<script lang>
    import { selectedNodeStore, nodesDataStore } from '../../stores';
  
    import { updateNodeAndChildrenState, updateNodeByID } from '$lib/supabaseClient';

    let value, state, olddata;

    selectedNodeStore.subscribe(data => {
        olddata = data
        value = data.value;
        state = data.state;
    });


    function specialFunction() {

        
        updateNodeAndChildrenState(olddata.id, state);
      
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

    <p>Selected Value: {value}</p>
    <p>Selected State: {state}</p>
</div>