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
  
   
  </style>

<main class="main">
    <Sidebar/>
    asd
</main>