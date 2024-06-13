<script lang="ts">
    import Sidebar from '$lib/Sidebar.svelte';

    import type { PageData } from './$types';
    
    export let data: PageData;
</script>

<style>

  
    .main {
      display: flex;
      height: 100vh;
      overflow: hidden;
      
    }
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background:  radial-gradient(ellipse at left top, #0f1216 0%, #0e1525 100%);
    }

    .gradient-bg {
      width: 100%;
      height: 100%;
    }
   
  </style>

<main class="main">
    <Sidebar/>

    <div class="content"></div>
      
</main>