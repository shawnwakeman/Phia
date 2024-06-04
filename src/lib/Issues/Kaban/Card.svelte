<script lang="ts">
    import { flip } from 'svelte/animate';
    import { writable } from 'svelte/store';
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import { currentSelectedIssue } from "../../../stores";
    import * as Drawer from "$lib/components/ui/drawer";
    export let item;
    export let flipDurationMs;

    const drawerOpen = writable(false); // Store to control drawer visibility
  
    function handleClick(event) {
        const issueId = event.target.dataset.id;
  
        if (issueId) {
            const clickedIssue = item;
            currentSelectedIssue.set(clickedIssue);
            console.log('Selected issue:', clickedIssue);
            drawerOpen.set(true); // Open the drawer
        } else {
            console.log("No issue ID found on the clicked element.");
        }
    }
  </script>
  
  <style>
  .card {
      height: 15%;
      min-height: 100px;
      width: 100%;
      margin: 0.4em 0;
      padding: 10px; /* Added padding for better text spacing */
      display: flex;
      flex-direction: column; /* Make the content flow vertically */
      justify-content: center;
      align-items: flex-start; /* Align items to the start for text wrapping */
      background-color: #b30a0a;
      border: 1px solid #333333;
      position: relative;
      user-select: none; /* Prevent text selection */
      box-sizing: border-box; /* Include padding in the element's total width and height */
  }
  </style>
  
  <ContextMenu.Root>
    <ContextMenu.Trigger>
      <div class="card" data-id={item.id} on:click={handleClick}>
        <div><strong>ID:</strong> {item.id}</div>
        <div><strong>Name:</strong> {item.name}</div>
        <div><strong>Node ID:</strong> {item.node_id}</div>
        <div><strong>#</strong>{item.project_specific_id}</div>
        <div><strong>Cycle:</strong> {item.cycle}</div>
        <div><strong>Created At:</strong> {item.created_at}</div>
        <div><strong>State:</strong> {item.state}</div>
        <div><strong>Priority:</strong> {item.priority}</div>
        <div><strong>Assignee:</strong> {item.assignee}</div>
        <div><strong>Tags:</strong> {item.tags}</div>
        <div><strong>Creator ID:</strong> {item.creator_id}</div>
        <div><strong>Completed At:</strong> {item.completed_at}</div>
        <div><strong>Due Date:</strong> {item.due_date}</div>
       
      </div>
    </ContextMenu.Trigger>
    <ContextMenu.Content>
      <ContextMenu.Item>Profile</ContextMenu.Item>
      <ContextMenu.Item>Billing</ContextMenu.Item>
      <ContextMenu.Item>Team</ContextMenu.Item>
      <ContextMenu.Item>Subscription</ContextMenu.Item>
    </ContextMenu.Content>
  </ContextMenu.Root>
  
  <!-- <Drawer.Root bind:open={$drawerOpen}>
    <Drawer.Content>
      <Drawer.Header>
        <Drawer.Title>Issue Details</Drawer.Title>
        <Drawer.Description>Details of the selected issue.</Drawer.Description>
      </Drawer.Header>
      <div>
        <div><strong>Name:</strong> {item.name}</div>
        <div><strong>Description:</strong> {item.description}</div>
        <div><strong>Node ID:</strong> {item.node_id}</div>
        <div><strong>#</strong>{item.project_specific_id}</div>
        <div><strong>Cycle:</strong> {item.cycle}</div>
        <div><strong>Description:</strong> {item.description}</div>
        <div><strong>Created At:</strong> {item.created_at}</div>
        <div><strong>State:</strong> {item.state}</div>
        <div><strong>Priority:</strong> {item.priority}</div>
        <div><strong>Assignee:</strong> {item.assignee}</div>
        <div><strong>Tags:</strong> {item.tags}</div>
        <div><strong>Creator ID:</strong> {item.creator_id}</div>
        <div><strong>Completed At:</strong> {item.completed_at}</div>
        <div><strong>Due Date:</strong> {item.due_date}</div>

      </div>
      <Drawer.Footer>
        <button on:click={() => drawerOpen.set(false)}>Submit</button>
        <Drawer.Close>Cancel</Drawer.Close>
      </Drawer.Footer>
    </Drawer.Content>
  </Drawer.Root> -->