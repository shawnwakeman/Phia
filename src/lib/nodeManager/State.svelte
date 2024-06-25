<script lang="ts">
    import { selectedNodeStore, currentBlock } from '../../stores';
    import { updateNodeAndChildrenState, updateNodeByID, updateNodeAndChildrenTargetState } from '$lib/supabaseClient';
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

    let value, state, olddata;

    selectedNodeStore.subscribe(data => {
        olddata = data;
        value = data.value;
        state = data.state;
    });

    function handleChange() {
        const numericValue = Number(value);
        updateNodeByID(olddata.id, {
            name: olddata.name,
            value: numericValue,
            parent_id: olddata.parent_id,
            state: state
        });
    }

    function specialFunction() {
        updateNodeAndChildrenState(olddata.id, state);
    }

    function handleTargetStates() {
        if ($currentBlock) {
            if (state == "Remove") {
          
                
                updateNodeAndChildrenTargetState(olddata.id, state, $currentBlock.snapshot_id, true);
            } else {
                updateNodeAndChildrenTargetState(olddata.id, state, $currentBlock.snapshot_id);
            }
        }

    
    }
</script>

<style>


</style>

<div class="feature-container">
    <h1>Data</h1>

    <DropdownMenu.Root>
        <DropdownMenu.Trigger>Select Value</DropdownMenu.Trigger>
        <DropdownMenu.Content>
            <DropdownMenu.Group>
                <DropdownMenu.Item on:click={() => { value = 1; handleChange(); }}>low</DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => { value = 2.25; handleChange(); }}>Medium</DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => { value = 5.0625; handleChange(); }}>High</DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => { value = 11.3907; handleChange(); }}>Crucial</DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => { value = 25.6313; handleChange(); }}>extraCritical</DropdownMenu.Item>
            </DropdownMenu.Group>
        </DropdownMenu.Content>
    </DropdownMenu.Root>

    <DropdownMenu.Root>
        <DropdownMenu.Trigger>Select State</DropdownMenu.Trigger>
        <DropdownMenu.Content>
            <DropdownMenu.Group>
                <DropdownMenu.Item on:click={() => { state = "Open"; specialFunction(); }}>Open</DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => { state = "Planned"; specialFunction(); }}>Planned</DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => { state = "In Progress"; specialFunction(); }}>In Progress</DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => { state = "Completed"; specialFunction(); }}>Completed</DropdownMenu.Item>
            </DropdownMenu.Group>
        </DropdownMenu.Content>
    </DropdownMenu.Root>

    <DropdownMenu.Root>
        <DropdownMenu.Trigger>Select Cycle</DropdownMenu.Trigger>
        <DropdownMenu.Content>
            <DropdownMenu.Group>
                <DropdownMenu.Item on:click={() => { state = "Open"; handleTargetStates(); }}>Open</DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => { state = "Planned"; handleTargetStates(); }}>Planned</DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => { state = "In Progress"; handleTargetStates(); }}>In Progress</DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => { state = "Completed"; handleTargetStates(); }}>Completed</DropdownMenu.Item>
                <DropdownMenu.Item on:click={() => { state = "Remove"; handleTargetStates(); }}>remove</DropdownMenu.Item>
            </DropdownMenu.Group>
        </DropdownMenu.Content>
    </DropdownMenu.Root>




</div>
