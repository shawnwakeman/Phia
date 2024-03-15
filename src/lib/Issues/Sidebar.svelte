<script lang="ts">
    export let show: boolean = false;
    export let width: string = '50%'; // Default to half width
  </script>
  
  <div class="sidebar" style="transform: {show ? 'translateX(0)' : 'translateX(100%)'}; width: {width}">
    <button on:click={() => show = false}>Close</button>
    <!-- Sidebar content -->
    <p>Sidebar content...</p>
  </div>
  
  <style>
    .sidebar {
      position: fixed;
      right: 0;
      top: 0;
      height: 100%;
      background-color: #f4f4f4;
      box-shadow: -2px 0 5px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s ease, width 0.3s ease;
    }
  </style>
  