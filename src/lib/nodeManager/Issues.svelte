<script lang="ts">

    import { selectedNodeStore } from "../../stores";
    import { fetchNestedIssues } from "../supabaseClient";
    

    import type { Issue, Node } from "../../types/collection";
  
    
        let issues: Issue[] = [];
        let currentSelectedNode: Node | null = null;
    
        $: if (currentSelectedNode) {
            fetchNestedIssues(currentSelectedNode.id).then(fetchedIssues => {
                issues = fetchedIssues;
            });
        } else {
            issues = []; // Reset issues if no node is selected
        }
    
        // Subscribe to the selectedNodeStore
        selectedNodeStore.subscribe(value => {
            currentSelectedNode = value;     
        });
    
    </script>
    
    


{#each issues as issue}
    <p>{issue.id}</p>
{/each}
   
       
            
