<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { addIssue, saveSummary } from '$lib/supabaseClient';
    import * as Dialog from "$lib/components/ui/dialog";
    import Editor from "$lib/dist/ui/editor/indexForIssueView.svelte";
    import { Editor as EditorType } from '@tiptap/core';
    import { onDestroy, onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { fade } from "svelte/transition";
    import { DiamondPlus    } from 'lucide-svelte';
    let isExpanded = writable(false);

    function toggleExpand() {
        isExpanded.update(value => !value);
    }

    let dialogOpen = false;
    let saveStatus = 'Saved';
    let editor: EditorType | undefined;

    let parent_id = 2;
    let name = "";
    let state = "state";
    let priority = "Priority";
    let cycle;
    let tags = "";
    let due_date;
    let creator = "";
    let assignee = "";

    let showEditor = true;



    function resetForm() {
        name = "";
        description = "";
        state = "";
        priority = "";
        cycle = undefined;
        tags = "";
        due_date = undefined;
        creator = "";
        assignee = "";
        saveStatus = 'Saved';
        if (editor) {
            editor.commands.clearContent();
        }
    }

    function handleIssue() {
        addIssue(2, name, editor?.getJSON(), state, priority, null, null, null, null, null)
    }

    function closeModal() {
        dialogOpen = false

    }

    onDestroy(() => {
     
        
    });
</script>

<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Trigger>
        <Button variant="outline" size="icon" class="bg-transparent border-none group p-0 m-0">
            <DiamondPlus  class="w-4 h-4 text-current group-hover:text-highlight-color" />
        </Button>
    </Dialog.Trigger>
    <Dialog.Content on:close={closeModal}  
        transition={fade}
       

    >

        <style>
            [data-melt-dialog-close] {
                display: none;
            }

            

        </style>


        <Dialog.Header>
            <Dialog.Title>
                <div style="display: flex; justify-content: space-between; align-items: center;" >

                 
                    <div class="bottom-container">
                        <h1>Add New Issue</h1>
                    </div>

                    <div class="bottom-container">
                        <div>
                            <button style="margin-right: 10px;" on:click={toggleExpand}>Expand</button>
                            <button on:click={closeModal}>X</button>
                        </div>
                    </div>
                  
                    
                </div>

      
            </Dialog.Title>
        </Dialog.Header>
           
            <Dialog.Description >
           
                <div class="input-container">
                    <input id="issue-title" type="text" placeholder="Issue Title" bind:value={name}/>
                </div>

                <div class="flex flex-col max-h-[50vh]" class:expanded={$isExpanded} >
                <Editor bind:editor> </Editor>
                </div>

                
                <div style="margin-top: 10px;">
                    <div style="display: flex; justify-content: left; margin-bottom: 10px;" class="input-container">
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>parent</DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                                <DropdownMenu.Label>My Account</DropdownMenu.Label>
                                <DropdownMenu.Separator />
                               
                            </DropdownMenu.Content>
                          </DropdownMenu.Root>
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>{state}</DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                                <DropdownMenu.Label>My Account</DropdownMenu.Label>
                                <DropdownMenu.Separator />
                                <DropdownMenu.RadioGroup bind:value={state}>
                                    <DropdownMenu.RadioItem value="open">Open</DropdownMenu.RadioItem>
                                    <DropdownMenu.RadioItem value="doing">Doing</DropdownMenu.RadioItem>
                                    <DropdownMenu.RadioItem value="done">Done</DropdownMenu.RadioItem>
                                  </DropdownMenu.RadioGroup>
                            </DropdownMenu.Content>
                          </DropdownMenu.Root>
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger>{priority}</DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                                <DropdownMenu.Label>My Account</DropdownMenu.Label>
                                <DropdownMenu.Separator />
                                <DropdownMenu.RadioGroup bind:value={priority}>
                                    <DropdownMenu.RadioItem value="Priority">No Priority</DropdownMenu.RadioItem>
                                    <DropdownMenu.RadioItem value="urgent">Urgent</DropdownMenu.RadioItem>
                                    <DropdownMenu.RadioItem value="high">High</DropdownMenu.RadioItem>
                                    <DropdownMenu.RadioItem value="medium">Medium</DropdownMenu.RadioItem>
                                    <DropdownMenu.RadioItem value="low">Low</DropdownMenu.RadioItem>
                                  </DropdownMenu.RadioGroup>
                            </DropdownMenu.Content>
                          </DropdownMenu.Root>
                         
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger>Assignee</DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                              <DropdownMenu.Group>
                                <DropdownMenu.Label>My Account</DropdownMenu.Label>
                                <DropdownMenu.Separator />
                                <DropdownMenu.Item>Profile</DropdownMenu.Item>
                                <DropdownMenu.Item>Billing</DropdownMenu.Item>
                                <DropdownMenu.Item>Team</DropdownMenu.Item>
                                <DropdownMenu.Item>Subscription</DropdownMenu.Item>
                              </DropdownMenu.Group>
                            </DropdownMenu.Content>
                          </DropdownMenu.Root>
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger>Cycle</DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                              <DropdownMenu.Group>
                                <DropdownMenu.Label>My Account</DropdownMenu.Label>
                                <DropdownMenu.Separator />
                                <DropdownMenu.Item>Profile</DropdownMenu.Item>
                                <DropdownMenu.Item>Billing</DropdownMenu.Item>
                                <DropdownMenu.Item>Team</DropdownMenu.Item>
                                <DropdownMenu.Item>Subscription</DropdownMenu.Item>
                              </DropdownMenu.Group>
                            </DropdownMenu.Content>
                          </DropdownMenu.Root>
                    </div>

                </div>
      
            </Dialog.Description>
            <Dialog.Footer>
                <div class="bottom-container" style="display: flex; justify-content: flex-end; align-items: center;">
                    <div style="display: flex; align-items: center; margin-right: 10px;">
                        <label for="create-more" style="margin-right: 10px;">Create More</label>
                        <input id="create-more" type="checkbox" />
                    </div>
                    <button on:click={handleIssue} class="margin-right: 10px;">Create Issue</button>
                </div>
              
            </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<style>
    .expanded {
        height: 68vh;
        max-height: 85vh;
    }

    .custom-width {
        width: 80%;
    }

    .input-container {
            background-color: #f0f0f0; /* Background color of the rounded rectangle */
            border-radius: 5px; /* Rounded corners */
            padding: 10px; /* Padding inside the rectangle */
            width: 100%; /* Full width */
            margin-bottom: 10px; /* Margin below the container */
    }

    .bottom-container {
            background-color: #f0f0f0; /* Background color of the rounded rectangle */
            border-radius: 5px; /* Rounded corners */
            padding: 10px; /* Padding inside the rectangle */
    }
        
    #issue-title {
        width: 100%; /* Full width of the input */
        border: none; /* Remove default border */
        outline: none; /* Remove outline */
        background: none; /* Remove default background */
    }
    
    #issue-title::placeholder {
        color: #999; /* Placeholder color */
    }




</style>