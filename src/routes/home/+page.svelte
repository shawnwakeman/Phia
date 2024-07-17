<script lang="ts">
    import Sidebar from '$lib/Sidebar.svelte';

    import Board from '$lib/Home/Board.svelte';
    

</script>

<style>

    html, body {
        height: 100%;
        margin: 0;
    }

    .main {
      display: flex;
      
      height: 100vh;
  
      overflow: hidden;
      /* background-color: rgb(31, 41, 55); */
    }

    .content-issues {
  
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: auto;
        user-select: none;
    }

    .internals {
        overflow: hidden;
        height: 100%;
         /* background: rgb(6, 6, 8);    */
        margin-left: 12px;
        margin-right: 12px;
        margin-bottom: 12px;
        border-radius:   8px;

     

    }

    .layout {
        display: flex;
        padding-top: 10px;
        padding-bottom: 10px;
        padding-left: 25px;
        padding-right: 25px;
    }



    .left-section {
        flex: 1;
        display: flex;
        align-items: center; /* Centers content vertically */
        
    }

    .middle-section {
  

        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    .right-section {
        flex: 1;
        display: flex;
   
        align-items: center; /* Centers content vertically */
        justify-content: right; /* Centers content horizontally */
        text-align: center; /* Centers text horizontally within the flex container */
    }



   
  </style>

<main class="main">
    <Sidebar/>

    <div class="content-issues">
    <div class="layout" id="layout-id">
        <div class="left-section">

          <h1>adss</h1>

        </div>
        <div class="middle-section">
            
            
         
            <h1>ads</h1>
     
           
        </div>
        <div class="right-section">
     
         
            <h1>ads</h1>

        
        </div>


    </div>


    <div class="internals">
        <Board/>
    </div>

   

    </div>



</main>