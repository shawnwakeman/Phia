
      <script lang="ts">
        import { type Issue } from "../../../types/collection";
        import * as Drawer from "$lib/components/ui/drawer";
        import Editor from "$lib/dist/ui/editor/indexForIssues.svelte"
        import IssueTitle from "./IssueTitle.svelte";
        import { onMount } from 'svelte';
        export let drawerOpen;
        export let issue: Issue;
        import * as Sheet from "$lib/components/ui/sheet";
        let saveStatus = 'Saved';
        let isTextSelected = false;




     

          
     
    
       
    </script>
    
    
    <Sheet.Content style="background: none; border: none;" class="drawer-content">
        
    


        <div class="container">

            <div class="issue-title-container">
                <IssueTitle issue={issue} />
              </div>
    
    
           
              <div class="editor-container">
                <Editor
                  onUpdate={() => {
                    saveStatus = 'Unsaved';
                  }}
                  onDebouncedUpdate={async () => {
                    saveStatus = 'Saving...';
            
                    setTimeout(() => {
                      saveStatus = 'Saved';
                    }, 500);
                  }}
                />
              </div>
            
              <div class="feature-container grid grid-cols-4 gap-6 icons lol-class">
                <div><strong>State:</strong> {issue.state}</div>
                <div><strong>Priority:</strong> {issue.priority}</div>
                <div><strong>Assignee:</strong> {issue.assignee}</div>
                <div><strong>Tags:</strong> {issue.tags}</div>
                <div><strong>Due Date:</strong> {issue.due_date}</div>
                <div><strong>Node:</strong> {issue.node_id}</div>
                <div><strong>Due Date:</strong> {issue.due_date}</div>
                <div><strong>Links:</strong> {null}</div>
              </div>
        </div>
    
      </Sheet.Content>
    
      <style>
        .container {
          display: flex;
          height: 100dvh; /* Full height of the viewport */
          padding: 0;
          flex-direction: column; /* Arrange children vertically */

        }


              
        .issue-title-container {
          
            height: 20%;
         
      
        }
        
        .editor-container {
 
            height: 60%;
        }
      



        .lol-class {
            height: 20%;
     
        }
      </style>