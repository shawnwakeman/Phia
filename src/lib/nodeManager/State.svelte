<script lang>
    import { selectedNodeStore, nodesDataStore } from '../../stores';
  
    import { updateNodeByID } from '$lib/supabaseClient';

    let value, state, olddata;

    selectedNodeStore.subscribe(data => {
        olddata = data
        value = data.value;
        state = data.state;
    });

    function handleChange() {
    
        specialFunction();
    }

    function specialFunction() {

        const numericValue = Number(value);
        updateNodeByID(olddata.id, {
            name: olddata.name,
            value: numericValue ,
            parent_id: olddata.parent_id,
            state: state
        })
    }

 
</script>

<div>
    <!-- First Dropdown for 'value' -->
    <label for="valueDropdown">Select Value:</label>
    <select id="valueDropdown" bind:value={value} on:change={handleChange}>
        <option value=1>low</option>
        <option value=3>Medium</option>
        <option value=5>High</option>
        <option value=10>Critical</option>


    </select>

    <!-- Second Dropdown for 'state' -->
    <label for="stateDropdown">Select State:</label>
    <select id="stateDropdown" bind:value={state} on:change={handleChange}>
        <option value="Open">Open</option>
        <option value="Planned">Planned</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
    </select>

    <p>Selected Value: {value}</p>
    <p>Selected State: {state}</p>
</div>