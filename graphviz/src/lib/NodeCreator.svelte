<script lang="ts">
    import { writable, get } from 'svelte/store';
    
    import { addNode } from "$lib/supabaseClient";
    import { deleteNodeById } from "$lib/supabaseClient";
    import { updateNodeByID } from "$lib/supabaseClient";
    import { selectedNodeId } from '../stores';
    const isPopupVisible = writable(false);

    let name = '';
    let value = 0;
    let parentId = 0;
  
    function togglePopup() {
      isPopupVisible.update((value) => !value);
    }


    // Implementation to add a node

    


  </script>
  
  <style>
    .popup {
      position: fixed;
      top: 70%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      display: none;
    }
    .popup.visible {
        border-radius: 8px;
      display: block;
    }
  </style>
  
  <button on:click={togglePopup}>Toggle Popup</button>

  
  {#if $isPopupVisible}
  <div class="popup visible">
    <p>This is a popup!</p>
    
    <label for="name">Name:</label>
    <input id="name" type="text" bind:value={name} />

    <label for="value">Value:</label>
    <input id="value" type="number" bind:value={value} />

    <label for="parentId">Parent ID:</label>
    <p>{$selectedNodeId}</p>
    
    <button on:click={() => addNode(name, value, get(selectedNodeId))}>Enter</button>
    <button on:click={togglePopup}>Close</button>
  </div>
{/if}

  <!-- <button on:click={() => deleteNodeById(280)}>del</button>
  <button on:click={() => updateNodeByID(280, {
    name: "Updated Node Name",
    value: 10,
    parent_id: 272
})}>cunm</button> -->
