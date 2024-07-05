<script lang="ts">
    import { flip } from 'svelte/animate';
    import { writable } from 'svelte/store';
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import { currentSelectedIssue, selectedIssues } from '../../../stores';
    import * as Drawer from "$lib/components/ui/drawer";
    import { get } from 'svelte/store';
    export let item;
    export let flipDurationMs;
    export let board;
    
  
    let drawerOpen = writable(false);
    
    let selected = [];

    selectedIssues.subscribe(value => {
        selected = value;
    });


    function handleClick(event) {
        const issueId = event.target.dataset.id;
  
        if (issueId) {
            const clickedIssue = item;
            let selected = get(selectedIssues);

            if (event.ctrlKey || event.metaKey) { // Ctrl or Cmd key
                if (selected.some(issue => issue.id === clickedIssue.id)) {
                    selected = selected.filter(issue => issue.id !== clickedIssue.id);
                } else {
                    selected = [...selected, clickedIssue];
                }
            } else if (event.shiftKey) { // Shift key
                if (event.shiftKey) { // Shift key
                    if (selected.length > 0) {
                        const lastSelected = selected[selected.length - 1];

                        let lastSelectedPos = { row: -1, col: -1, index: -1 };
                        let clickedIssuePos = { row: -1, col: -1, index: -1 };

                        // Find positions of last selected and clicked issue in the board grid
                        board.forEach((row, rowIndex) => {
                            row.columns.forEach((column, colIndex) => {
                                column.items.forEach((issue, issueIndex) => {
                                    if (issue.id === lastSelected.id) {
                                        lastSelectedPos = { row: rowIndex, col: colIndex, index: issueIndex };
                                    }
                                    if (issue.id === clickedIssue.id) {
                                        clickedIssuePos = { row: rowIndex, col: colIndex, index: issueIndex };
                                    }
                                });
                            });
                        });

                        const minRow = Math.min(lastSelectedPos.row, clickedIssuePos.row);
                        const maxRow = Math.max(lastSelectedPos.row, clickedIssuePos.row);
                        const minCol = Math.min(lastSelectedPos.col, clickedIssuePos.col);
                        const maxCol = Math.max(lastSelectedPos.col, clickedIssuePos.col);

                        let newSelected: Issue[] = [];
                        for (let rowIndex = minRow; rowIndex <= maxRow; rowIndex++) {
                            for (let colIndex = minCol; colIndex <= maxCol; colIndex++) {
                                const itemsInCell = board[rowIndex].columns[colIndex].items;
                                for (let i = 0; i < itemsInCell.length; i++) {
                                    const issue = itemsInCell[i];

                                    // Add issues in range
                                    if (rowIndex === lastSelectedPos.row && colIndex === lastSelectedPos.col) {
                                        if (rowIndex === clickedIssuePos.row && colIndex === clickedIssuePos.col) {
                                            // Same cell, range within the cell
                                            if (
                                                (i >= lastSelectedPos.index && i <= clickedIssuePos.index) ||
                                                (i <= lastSelectedPos.index && i >= clickedIssuePos.index)
                                            ) {
                                                newSelected.push(issue);
                                            }
                                        } else if (i >= lastSelectedPos.index) {
                                            newSelected.push(issue);
                                        }
                                    } else if (rowIndex === clickedIssuePos.row && colIndex === clickedIssuePos.col) {
                                        if (i <= clickedIssuePos.index) {
                                            newSelected.push(issue);
                                        }
                                    } else {
                                        newSelected.push(issue);
                                    }
                                }
                            }
                        }

        // Remove duplicates by creating a Set
        selected = Array.from(new Set([...selected, ...newSelected]));
    } else {
        // Only select the clicked issue
        selected = [clickedIssue];
    }
} else {
    // Only select the clicked issue
    selected = [clickedIssue];
}

            } else { // Normal click
                currentSelectedIssue.set(clickedIssue);
                drawerOpen.set(true);
            }

            selectedIssues.set(selected);

            console.log('Selected issues:', selected);
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
        padding: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        background-color: #b30a0a;
        border: 1px solid #333333;
        position: relative;
        user-select: none;
        box-sizing: border-box;
    }
    .card.selected {
        border: 2px solid blue;
        background-color: #FFF700;
    }
</style>

<ContextMenu.Root>
    <ContextMenu.Trigger>
        <div 
            class="card" 
            data-id={item.id} 
            class:selected={selected.some(issue => issue.id === item.id)} 
            on:click={handleClick}>
            <div><strong>ID:</strong> {item.id}</div>
            <div><strong>Name:</strong> {item.name}</div>
            <div><strong>Node ID:</strong> {item.node_id}</div>
            <div><strong>#</strong>{item.project_specific_id}</div>
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
  </Drawer.Root>