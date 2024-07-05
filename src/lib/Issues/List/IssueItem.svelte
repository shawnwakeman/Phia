<script lang="ts">
    import { flip } from 'svelte/animate';
    import { writable } from 'svelte/store';
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import { currentSelectedIssue, selectedIssues, selectionAnchor } from '../../../stores';
    import * as Drawer from "$lib/components/ui/drawer";
    import { get } from 'svelte/store';
  
    export let issue;
    export let groupedIssues; // Assuming `groupedIssues` is passed as a prop to this component

    let drawerOpen = writable(false);
    let selected = [];
    let anchorIssue = null;

    selectedIssues.subscribe(value => {
        selected = value;
    });


    // Flatten the grouped issues for easier index handling
    const allIssues = groupedIssues.flatMap(group => group.issues);

    function clickHandler(event: MouseEvent, issue) {
        let currentSelection = get(selectedIssues);
        let anchor = get(selectionAnchor);

        if (event.shiftKey) {
            if (!anchor) {
            // If no anchor is set, set the anchor to the current issue
            selectionAnchor.set(issue);
            toggleSelection(issue);
        } else {
            // If anchor is already set, select the range
            let startIndex = allIssues.findIndex(i => i.id === anchor.id);
            let endIndex = allIssues.findIndex(i => i.id === issue.id);

            if (startIndex !== -1 && endIndex !== -1) {
                let newSelection = allIssues.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);
                selectedIssues.update(sel => [...new Set([...sel, ...newSelection])]);
            }

            // Update the anchor to the current issue for subsequent shift-clicks
   
        }
            
        } else if (event.ctrlKey || event.metaKey) {
            toggleSelection(issue);

            selectionAnchor.set(null);
        } else {
            const target = event.target as HTMLElement;
            if (target.classList.contains('issue-item')) {
                currentSelectedIssue.set(issue);
                selectedIssues.set([])
                drawerOpen.set(true);
            }
        }

        console.log(get(selectedIssues));
    }

    function toggleSelection(issue) {
        selectedIssues.update(sel => {
            if (sel.some(i => i.id === issue.id)) {
                return sel.filter(item => item.id !== issue.id);
            } else {
                return [...sel, issue];
            }
        });

        console.log(get(selectedIssues));
    }
</script>

<ContextMenu.Root>
    <ContextMenu.Trigger>


        <div class="issue-item" class:selected={selected.some(i => i.id === issue.id)} on:click={(event) => clickHandler(event, issue)}>
            {#if selected.some(i => i.id === issue.id)}
                <input type="checkbox" on:click|stopPropagation={() => toggleSelection(issue)} checked={true} />
            {/if}
            <h1 class="issue-name" on:click|stopPropagation={() => console.log("asd")}>{issue.name} - {issue.id}</h1>
        </div>
    </ContextMenu.Trigger>
    <ContextMenu.Content>
        <ContextMenu.Item>Profile</ContextMenu.Item>
        <ContextMenu.Item>Billing</ContextMenu.Item>
        <ContextMenu.Item>Team</ContextMenu.Item>
        <ContextMenu.Item>Subscription</ContextMenu.Item>
    </ContextMenu.Content>
</ContextMenu.Root>


<Drawer.Root bind:open={$drawerOpen}>
    <Drawer.Content>
        <Drawer.Header>
            <Drawer.Title>Issue Details</Drawer.Title>
            <Drawer.Description>Details of the selected issue.</Drawer.Description>
        </Drawer.Header>
        <div>
            <div><strong>Name:</strong> {issue.name}</div>
            <div><strong>Description:</strong> {issue.description}</div>
            <div><strong>Node ID:</strong> {issue.node_id}</div>
            <div><strong>#</strong>{issue.project_specific_id}</div>
            <div><strong>Cycle:</strong> {issue.cycle}</div>
            <div><strong>Description:</strong> {issue.description}</div>
            <div><strong>Created At:</strong> {issue.created_at}</div>
            <div><strong>State:</strong> {issue.state}</div>
            <div><strong>Priority:</strong> {issue.priority}</div>
            <div><strong>Assignee:</strong> {issue.assignee}</div>
            <div><strong>Tags:</strong> {issue.tags}</div>
            <div><strong>Creator ID:</strong> {issue.creator_id}</div>
            <div><strong>Completed At:</strong> {issue.completed_at}</div>
            <div><strong>Due Date:</strong> {issue.due_date}</div>
        </div>
        <Drawer.Footer>
            <button on:click={() => drawerOpen.set(false)}>Submit</button>
            <Drawer.Close>Cancel</Drawer.Close>
        </Drawer.Footer>
    </Drawer.Content>
</Drawer.Root>

<style>
    .issue-item {
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 16px;
        margin: 16px;
        background-color: #f9f9f9;
        display: flex;
        align-items: center;
        cursor: pointer;
    }

    .selected {
        background-color: red;
    }

    .issue-name {
        font-size: 1.5em;
        margin-left: 8px;
        color: #333;
    }

    .issue-item input[type="checkbox"] {
        margin-right: 8px;
    }
</style>