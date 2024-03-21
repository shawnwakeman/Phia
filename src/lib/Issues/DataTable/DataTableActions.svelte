<script lang="ts">

    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Button } from "$lib/components/ui/button";
    import type { Issue, Node } from "../../../types/collection";
    import { fetchNestedIssues, updateIssue, deleteIssue } from "../../supabaseClient";
    import { selectedNodeStore, issuesDataStore, nodesDataStore} from "../../../stores";
    export let issue: Issue;

    
    async function saveChanges(issue: Issue) {
      try {
        const updatedIssue = await updateIssue(issue);
        console.log("Issue updated successfully", updatedIssue);
      } catch (error) {
        console.error("Failed to update issue", error);
      }
    }
  
    async function deleteRows(issue: Issue) {
      try {
        const updatedIssue = await deleteIssue(issue);
        console.log("Issue deleted successfully", updatedIssue);
        // After deleting, you might want to remove the issue from 'rows' to update the UI accordingly
      } catch (error) {
        console.error("Failed to delete issue", error);
      }
    }
  </script>
   
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild let:builder>
      <Button
        variant="ghost"
        builders={[builder]}
        size="icon"
        class="relative h-8 w-8 p-0"
      >
        <span class="sr-only">Open menu</span>
        <h1>yo</h1>
     
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        <DropdownMenu.Label>Actions</DropdownMenu.Label>
        <DropdownMenu.Item on:click={() => deleteIssue(issue)}>
            Delete Issue
          </DropdownMenu.Item>
      <DropdownMenu.Item>View customer</DropdownMenu.Item>
      <DropdownMenu.Item>View payment details</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>