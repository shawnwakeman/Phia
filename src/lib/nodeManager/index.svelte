<script>
    import BulletList from './featureList.svelte';
    import { selectedNodeId, selectedNodeStore, nodesDataStore} from "../../stores";
    import { Editor } from "@wakemanshawn/novel-svelte-shawnwakeman";
    import Breadcrums from './breadcrums.svelte';
    import Issues from '$lib/nodeManager/Issues.svelte';
    import State from './State.svelte';
    import DataTable from '$lib/Issues/DataTable/DataTable.svelte';

  </script>
  
  <main>
   
    <h1>
      
        #{$selectedNodeStore?.id} - {$selectedNodeStore?.name} 
       
      
    </h1>
    <Breadcrums/>
    <State/>
    <Editor/>
    <BulletList />
    <Issues />
    
  </main>
  <style>
    main {
        max-height: 90vh; /* Limits the height and enables scrolling */
        overflow-y: auto; /* Enables vertical scrolling */
        padding: 20px; /* Optional: Adds some spacing inside the main container */
        background: #f4f4f4; /* Optional: Sets a background color for the main area */
    }
</style>