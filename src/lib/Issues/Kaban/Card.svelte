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
    import Breadcrums from './breadcrums.svelte';
    let selected = [];

    selectedIssues.subscribe(value => {
        selected = value;
    });


    function handleClick(event) {
        const issueId = item.id;
  
        
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
    function handleClickF(event: Event) {
        event.stopPropagation();
        // Your additional click logic here
        console.log('Button clicked!');
    }
  </script>
  
<style>
    .card {
      
        min-height: 100px;
    
    

   
   
      
        margin-top: 1em;
        margin-bottom: 0.5em;
        outline: none;
        box-shadow: none;
    

        
    }
    .card:active,
    .card:focus {
        outline: none;
        box-shadow: none;
    }
    .card:hover * {
        border-color: rgb(90, 97, 107); 
    }

    

    



    .top {
        
        width: 100%;
        background-color: hsl(214, 14%, 15%);
        flex: 1;
        border-radius: 10px 10px 0px 0px;
        border-top: 2px solid rgba(255, 0, 0, 0);
        border-left: 2px solid rgba(255, 0, 0, 0);
        border-right: 2px solid rgba(255, 0, 0, 0);
        border-bottom: none;
        transition: border-color 0.3s ease, background-color 0.3s ease;
    }

    .top.selected {
        border-color: rgb(52, 102, 196); 
        
    }

    .bottom.selected {
        border-color: rgb(52, 102, 196); 

    }



    

      .bottom {
            width: 100%;
            background-color: hsl(210, 13%, 20%);
            flex: 1;
            border-radius: 0px 0px 10px 10px;
            flex-wrap: wrap;
            border-top: none;
            border-left: 2px solid rgba(255, 0, 0, 0);
            border-right: 2px solid rgba(255, 0, 0, 0);
            border-bottom: 2px solid rgba(255, 0, 0, 0);
            transition: border-color 0.3s ease, background-color 0.3s ease;
        }

        .button-style {
            background-color: #3892ff;
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
            on:click={handleClick}
            on:contextmenu={(event) => handleContextMenu(event, item)}>

        
            <div class="top " class:selected={selected.some(issue => issue.id === item.id)} >
                <div class="top-top px-2">
                    <div class="issue-id font-medium text-lg pt-5">#{item.project_specific_id}</div>
                    <div class="left pt-2">

                        <Button on:click={handleClickF} class="rounded-full h-7" variant="outline">Button</Button>
                        
                        <Button class="h-7 w-7" variant="ghost">
                            <Avatar.Root class="w-6 h-6 bg-inherint" >
                                <Avatar.Image class="bg-transparent" src="" alt="@shadcn" />
                                <Avatar.Fallback class="bg-transparent">
                                    <CircleUserRound/>
                                </Avatar.Fallback>
                            </Avatar.Root>

                        </Button>
                        
                       
                    </div>
                    

                </div>
              
                <div class="issue-name text-xl font-bold px-2">{item.name}</div>
                <div class="pl-2">
                      
                        <Breadcrums issue={item}/>
               
                    
                </div>
           
            </div>
        
            <div class="bottom px-2 py-3" class:selected={selected.some(issue => issue.id === item.id)} >
                <div >
                    <Button class="rounded px-2 h-7 bg-[#21262c]" variant="outline">P</Button>
                    <Button class="rounded px-2 h-7 bg-[#21262c]" variant="outline">P</Button>
        
                    <Button class="rounded-md px-2 h-7 bg-[#21262c]" variant="outline">stage</Button>
    
                    <Button class="rounded px-2 h-7 bg-[#21262c]" variant="outline">cycle</Button>
                    <Button class="rounded px-2 h-7  bg-[#21262c]" variant="outline">Button</Button>
                </div>
          
              
                

              
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