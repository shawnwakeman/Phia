<script>
    import BulletList from './featureList.svelte';
    import { selectedNodeId, selectedNodeStore, nodesDataStore} from "../../stores";
    import { Editor } from "@wakemanshawn/novel-svelte-shawnwakeman";
    import Breadcrums from './breadcrums.svelte';
  </script>
  
  <main>
   
    <h1>
      
        #{$selectedNodeStore?.id} - {$selectedNodeStore?.name} 
       
      
    </h1>
    <Breadcrums/>
    <Editor />
    <BulletList />
  </main>
  