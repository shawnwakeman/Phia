<script lang="ts">
    import { fetchNestedIssues, updateIssue, deleteIssue } from "../../supabaseClient";
    import type { Issue, Node } from "../../../types/collection";
  
    import { Input } from "$lib/components/ui/input";
    import { issuesDataStore } from "../../../stores";
    let issue: Issue;
    export let issueID: string;

    let issueIndex = parseInt(issueID, 10);
    

    $: issueIndex, issue = $issuesDataStore[issueIndex];
    



    async function saveChanges(issue: Issue) {
      try {
        const updatedIssue = await updateIssue(issue);
        console.log("Issue updated successfully", updatedIssue);
      } catch (error) {
        console.error("Failed to update issue", error);
      }
    }

    function handleBlur() {

        issue = $issuesDataStore[issueIndex];
       
        saveChanges(issue);
        
    }

    issue = $issuesDataStore[issueIndex];
    
    console.log(issue);
    
    
  </script>
  

{#if issue}
  <Input type="text" bind:value={issue.name} on:blur={handleBlur} />
{/if}