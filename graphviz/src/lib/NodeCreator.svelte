<script lang="ts">
    import { writable } from 'svelte/store';
    import { addNode } from "$lib/supabaseClient";
  
    const isPopupVisible = writable(false);
  
    function togglePopup() {
      isPopupVisible.update((value) => !value);
    }



    function deletes() {
      isPopupVisible.update((value) => !value);
    }

    function updates() {
      isPopupVisible.update((value) => !value);
    }

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
      <button on:click={addNode}>addNode</button>
      <button on:click={deletes}>addDefult</button>
      <button on:click={updates}>addDefult</button>

      <button on:click={togglePopup}>Close</button>
    </div>
  {/if}
  