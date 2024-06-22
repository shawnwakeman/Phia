<script lang="ts">
    import { selectedNodeStore, nodesDataStore } from '../../stores';
    import { updateNodeAndChildrenState, updateNodeByID } from '$lib/supabaseClient';
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
</script>

<style>

.feature-container {
        padding: 30px;
                margin-right: 3vw;
        margin-left: 3vw;
        margin-top: 2vw; 
        margin-bottom: 2vw;
        /* padding-top: 600px; */

        background: hsl(227, 36%, 5%, 0.5);
        background-image: radial-gradient(circle at 89% 12%, hsla(223, 45%, 10%, 0.639) 0%, hsla(227, 69%, 3%, 0.64) 122%), url('/noise.svg'); 
            

        border-radius: 24px; 
     
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        box-shadow:  -10px 10px 24px hsla(223, 33%, 4%, 0.753);
        color: white;
        



    }

    .feature-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 24px; 
        border: 1px solid transparent;
        background: linear-gradient(210deg,hsl(0, 0%, 100%),hsl(222, 12%, 22%)) border-box;
        -webkit-mask:
            linear-gradient(#fff 0 0) padding-box, 
            linear-gradient(#fff 0 0);
        -webkit-mask-composite: destination-out;
        mask-composite: exclude;
        pointer-events: none;  /* Ignore all pointer events */
                
        
    }

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


</div>
