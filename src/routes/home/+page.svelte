<script lang="ts">
    import Sidebar from '$lib/Sidebar.svelte';

    import Board from '$lib/Home/Board.svelte';
    

</script>

<style>

  
    .main {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    .content {
        flex-grow: 1;
        
    }
  
   
  </style>

<main class="main">
    <Sidebar/>
    <div class="content">

    <Board/>
            
    </div>
</main>