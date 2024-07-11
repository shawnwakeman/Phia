<script lang="ts">
    import { flip } from 'svelte/animate';
    import { writable } from 'svelte/store';
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import { currentSelectedIssue, selectedIssues, openContextMenuId } from '../../../stores';
    import IssueView from '../issueView/IssueView.svelte';
    import * as Sheet from "$lib/components/ui/sheet";
    import { get } from 'svelte/store';
    import { onMount } from 'svelte';
    export let item;
    export let flipDurationMs;
    export let board;
    import * as Avatar from "$lib/components/ui/avatar";
    import { CircleUserRound } from 'lucide-svelte';
    let drawerOpen = writable(false);
    import { Button } from "$lib/components/ui/button";
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


    let isOpen = false;


    function handleContextMenu(event, issue) {
        event.preventDefault();
        openContextMenuId.set(issue.id);
    }

    function handleOpenChange(open) {
        if (!open) {
            openContextMenuId.set(null);
        }
    }

    onMount(() => {
        openContextMenuId.subscribe((id) => {

            
            isOpen = (id === item.id);
        });
    });


  </script>
  
<style>
    .card {
        height: 150px;
        min-height: 100px;
        width: 100%;
    
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        background: red;
        margin-top: 0.25em;
        margin-bottom: 0.25em;
        position: relative;
        user-select: none;
        box-sizing: border-box;
        border-radius: 12px;
    }
    .card.selected {
        border: 2px solid blue;
        background-color: #FFF700;
    }

    .top {
        
        width: 100%;
        background-color: lightblue;
        flex: 1;
    }

      .bottom {
            width: 100%;
            background-color: rgb(27, 22, 46);
            flex: 1;
        }

    .top-top {
        display: flex;
        justify-content: space-between;
        width: 100%;
    }

    .left {
        display: flex;
    }
</style>

<ContextMenu.Root open={isOpen} onOpenChange={handleOpenChange} closeOnOutsideClick={true} closeOnEscape={true}>
    <ContextMenu.Trigger>
        <div 
            class="card font-default" 
            data-id={item.id} 
            class:selected={selected.some(issue => issue.id === item.id)} 
            on:click={handleClick}
            on:contextmenu={(event) => handleContextMenu(event, item)}>

        
            <div class="top">
                <div class="top-top">
                    <div class="issue-id">#{item.project_specific_id}</div>
                    <div class="left">
                        <Avatar.Root class="w-12 h-12 bg-inherint" >
                            <Avatar.Image class="bg-transparent" src="" alt="@shadcn" />
                            <Avatar.Fallback class="bg-transparent">
                                <CircleUserRound class="w-12 h-12 "/>
                            </Avatar.Fallback>
                        </Avatar.Root>
                        <Button variant="outline">Button</Button>
                    </div>
                    

                </div>
              
                <div class="issue-name">{item.name}</div>
            </div>
        
            <div class="bottom">
                <div class="status-indicator">s</div>
                <div class="status-dot">s</div>
            </div>
        </div>
    </ContextMenu.Trigger>
    <ContextMenu.Content>
        <ContextMenu.Item>Profile</ContextMenu.Item>
        <ContextMenu.Item>Billing</ContextMenu.Item>
        <ContextMenu.Item>Team</ContextMenu.Item>
        <ContextMenu.Item>Subscription</ContextMenu.Item>
    </ContextMenu.Content>
</ContextMenu.Root>


  
<Sheet.Root bind:open={$drawerOpen}>
   

    <IssueView {drawerOpen} issue={item}/>
</Sheet.Root>