<script>
    import BulletList from './featureList.svelte';
    import { selectedNodeId, selectedNodeStore, nodesDataStore} from "../../stores";
    import { Editor } from "@wakemanshawn/novel-svelte-shawnwakeman";
  </script>
  
  <main>
   
    <h1>
      
        {$selectedNodeStore?.name} 
       
      
    </h1>
    
    <Editor />
    <BulletList />
  </main>
  