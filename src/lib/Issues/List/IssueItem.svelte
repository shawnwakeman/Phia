<script lang="ts">
    import { flip } from 'svelte/animate';
    import { writable } from 'svelte/store';
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import { currentSelectedIssue, selectedIssues, selectionAnchor, openContextMenuId   } from '../../../stores';
    import * as Sheet from "$lib/components/ui/sheet";
    import { get } from 'svelte/store';
    import IssueView from '../issueView/IssueView.svelte';
    import { Button } from "$lib/components/ui/button";
    export let issue;
    export let groupedIssues; // Assuming `groupedIssues` is passed as a prop to this component
    import { onMount } from 'svelte';
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

            currentSelectedIssue.set(issue);
            selectedIssues.set([])
            drawerOpen.set(true);
            console.log("triggerd");
                
      
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

    function buttonClickHandler(buttonName) {
        console.log(`${buttonName} clicked`);
        // Your button click handler logic here
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
 
            
            isOpen = (id === issue.id);
        });
    });
</script>


<ContextMenu.Root open={isOpen} onOpenChange={handleOpenChange} closeOnOutsideClick={true} closeOnEscape={true}>

    <ContextMenu.Trigger>


        <div class="issue-item" class:selected={selected.some(i => i.id === issue.id)} 
            on:click={(event) => clickHandler(event, issue)}
            on:contextmenu={(event) => handleContextMenu(event, issue)}
            >
            <!-- {#if selected.some(i => i.id === issue.id)}
            <div class="checkbox-div">
                <input type="checkbox" on:click|stopPropagation={() => toggleSelection(issue)} checked={true} />
            </div>
             
            {/if} -->
            <div class="issue-content">
                <h1 class="issue-name">
                    <span class="issue-id">#{issue.id}</span>
                    <span class="separator">|</span>
                    <span class="issue-name-text">{issue.name}</span>
                </h1>
                <div class="button-row" on:click|stopPropagation={() => buttonClickHandler('Button 1')}>
                    <Button variant="outline">Button</Button>
                    <Button variant="outline">Button</Button>
                    <Button variant="outline">Button</Button>

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
    <IssueView {drawerOpen} issue={issue}/>
</Sheet.Root>

<style>
.issue-item {
    border: 2px solid #22262c;
    border-radius: 8px;
    padding: 8px;
    margin-left: 24px;
    margin-right: 16px;
    margin-top: 12px;
    margin-bottom: 12px;
    background-color: hsl(218, 15%, 11%);
    display: flex;
    align-items: center; /* Align items to center */
    cursor: pointer;
    color: #adadad;
    transition: background-color 0.3s ease;
}

.issue-item:hover {
    background-color: #2b3038;
    cursor: pointer;
}

.issue-item.selected {
    background-color: rgb(34, 48, 87);
}

.issue-item.selected:hover {
    background-color: rgb(34, 48, 87); /* Same as selected background color to remove hover effect */
}

.issue-content {
    display: flex;
    flex-direction: row; /* Change to row for horizontal alignment */
    align-items: center; /* Center items vertically */
    width: 100%;
    justify-content: space-between; /* Space out heading and buttons */
}

.issue-name {
    font-size: 1.125em;
    color: #7e7e7e;
    flex: 1; /* Allow the heading to take available space */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 5px;
}

.issue-id {
    color: #a2a8b3;
    font-size: 0.9em;
}

.issue-name-text {
    color: #a7a9ac;
    font-weight: bold;
}

.separator {
    color: #888;
    font-size: 0.8em;
}

.button-row {
    display: flex;
    gap: 8px; /* Add some space between buttons */
    flex-shrink: 0; /* Prevent buttons from shrinking */
}







</style>