<!-- Tooltip.svelte -->
<script>
    export let alignImage;
  </script>
  
  <style>
    .tooltip {
      position: absolute;
      background-color: white;
      border: 1px solid black;
      padding: 5px;
      border-radius: 5px;
      z-index: 1000;
    }
    .tooltip button {
      margin: 2px;
      padding: 5px;
    }
  </style>
  
  <div class="tooltip">
    <button on:click={() => alignImage('left')}>Left</button>
    <button on:click={() => alignImage('center')}>Center</button>
    <button on:click={() => alignImage('right')}>Right</button>
  </div>
  