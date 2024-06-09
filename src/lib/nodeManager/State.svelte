<script lang>
    import { selectedNodeStore, nodesDataStore } from '../../stores';
  
    import { updateNodeAndChildrenState, updateNodeByID } from '$lib/supabaseClient';


    let value, state, olddata;

    selectedNodeStore.subscribe(data => {
        olddata = data
        value = data.value;
        state = data.state;
    });

    function handleChange() {
    
        const numericValue = Number(value);
        updateNodeByID(olddata.id, {
            name: olddata.name,
            value: numericValue ,
            parent_id: olddata.parent_id,
            state: state
        })
    }

    function specialFunction() {

        
        updateNodeAndChildrenState(olddata.id, state);
      
    }

 
</script>

<div>
    <!-- First Dropdown for 'value' -->
    <label for="valueDropdown">Select Value:</label>
    <select id="valueDropdown" bind:value={value} on:change={handleChange}>
        <option value=1>low</option>
        <option value=2.25>Medium</option>
        <option value=5.0625>High</option>
        <option value=11.3907>Crucial</option>
        <option value=25.6313>extraCritical</option>


    </select>

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