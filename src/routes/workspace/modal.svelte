<script>
    import {showModal, selectedItem} from '../../stores'
    import CustomComponentA from './Pomodoro.svelte'; // Import the component you want to display in the modal
  
    let show = false;
    let item = null;
  
    // Subscribe to the stores
    showModal.subscribe(value => {
      show = value;
    });
  
    selectedItem.subscribe(value => {
      item = value;
    });
  
    function close() {
      showModal.set(false); // Close modal
    }
  </script>
  
  {#if show}
  <div class="modal-overlay" on:click={close}>
    <div class="modal-content" on:click|stopPropagation>
      <!-- Display your component with the selected item as a prop -->
      <CustomComponentA {item} />
    </div>
  </div>
  {/if}
  
  <style>
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  
    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      cursor: auto;
    }
  </style>
  