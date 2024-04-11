<script>
    export let items;
    export let command;
  
    let selectedIndex = 0;
  
    // Svelte doesn't have a direct equivalent to Vue's watch, but we can use reactive statements.
    $: if (items) {
      selectedIndex = 0;
    }
  
    // Handling key down actions, a similar approach can be used but slightly adjusted for Svelte
    function onKeyDown(event) {
      switch (event.key) {
        case 'ArrowUp':
          upHandler();
          break;
        case 'ArrowDown':
          downHandler();
          break;
        case 'Enter':
          enterHandler();
          break;
      }
    }
  
    function upHandler() {
      selectedIndex = ((selectedIndex + items.length) - 1) % items.length;
    }
  
    function downHandler() {
      selectedIndex = (selectedIndex + 1) % items.length;
    }
  
    function enterHandler() {
      selectItem(selectedIndex);
    }
  
    function selectItem(index) {
      const item = items[index];
      if (item) {
        command(item);
      }
    }
  </script>
  
  <style>
    .items {
      padding: 0.2rem;
      position: relative;
      border-radius: 0.5rem;
      background: #FFF;
      color: rgba(0, 0, 0, 0.8);
      overflow: hidden;
      font-size: 0.9rem;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0px 10px 20px rgba(0, 0, 0, 0.1);
    }
  
    .item {
      display: block;
      margin: 0;
      width: 100%;
      text-align: left;
      background: transparent;
      border-radius: 0.4rem;
      border: 1px solid transparent;
      padding: 0.2rem 0.4rem;
    }
  
    .is-selected {
      border-color: #000;
    }
  </style>
  
  <div class="items">
    {#if items.length}
      {#each items as item, index}
        <button
          class="item {selectedIndex === index ? 'is-selected' : ''}"
          on:click={() => selectItem(index)}
          on:keydown={onKeyDown}
        >
          {item}
        </button>
      {/each}
    {:else}
      <div class="item">No result</div>
    {/if}
  </div>
  