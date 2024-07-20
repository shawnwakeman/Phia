<script lang="ts">
    import Sidebar from '$lib/Sidebar.svelte';
    import { setSetting  } from "$lib/supabaseClient";
    import Board from '$lib/Home/Board.svelte';
    import { settings } from "../../lib/stores";

    import type { UserSettings } from '../../types/collection';
	export let data: { projectIds: any; settings: UserSettings  };

    settings.set(data.settings)
    
    import AddComponent from '$lib/Home/AddComponent.svelte';
	import { Rows3, SquareKanban, Network } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button/index.js";

    function changeState(state: boolean) {
        $settings.home.grid.usingSimple = state
    }

    
</script>


<main class="main">
    <Sidebar/>

    <div class="content-issues">
    <div class="layout" id="layout-id">
        <div class="left-section">
      
          <h1>adss</h1>

        </div>
        <div class="middle-section">
            
            
            <AddComponent/>
            <h1>ads</h1>
     
           
        </div>
        <div class="right-section">
     
         
            <h1>ads</h1>

            <Button
                variant="outline"
                size="icon"
                class="bg-transparent border-none group p-0 m-0"
                on:click={() => changeState(true)}
            >
                <SquareKanban
                    class="w-4 h-4 text-current group-hover:text-highlight-color"
                />
            </Button>
            <Button
                variant="outline"
                size="icon"
                class="bg-transparent border-none group p-0 m-0"
                on:click={() => changeState(false)}
            >
                <Network
                    class="w-4 h-4 text-current group-hover:text-highlight-color"
                />
            </Button>
        </div>


    </div>


    <div class="internals" id="internals-id">
        <Board/>
    </div>

   

    </div>



</main>

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
        overflow: hidden;
        user-select: none;
        background-color: #1f2937;
    }

    .internals {
        overflow: hidden;
        height: 100%;
         background: rgba(21, 21, 26, 0.349);   
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
