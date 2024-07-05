<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { addIssue } from '$lib/supabaseClient';
    import * as Dialog from "$lib/components/ui/dialog";
    import Editor from "$lib/dist/ui/editor/indexForIssueView.svelte";
    import { Editor as EditorType } from '@tiptap/core';
    import { onDestroy, onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    let isExpanded = writable(false);

    function toggleExpand() {
        isExpanded.update(value => !value);
    }

    let dialogOpen = false;
    let saveStatus = 'Saved';
    let editor: EditorType | undefined;

    let parent_id = 2;
    let name = "";
    let description = "";
    let state = "";
    let priority = "";
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

    function closeModal() {
        dialogOpen = false

    }

    onDestroy(() => {
     
        
    });
</script>

<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Trigger>
        <button>+ Add Issue</button>
    </Dialog.Trigger>
    <Dialog.Content on:close={closeModal}  class="bg-transparent border-none">

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
                    <input id="issue-title" type="text" placeholder="Issue Title" />
                </div>

                <div class:expanded={$isExpanded} class="flex flex-col">
                <Editor bind:editor> </Editor>
                </div>

                
                <div style="margin-top: 10px;">
                    <div style="display: flex; justify-content: left; margin-bottom: 10px;" class="input-container">
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>Status</DropdownMenu.Trigger>
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
                            <DropdownMenu.Trigger>Priortiy</DropdownMenu.Trigger>
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
                    <button style="margin-right: 10px;">Create Issue</button>
                </div>
              
            </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<style>
    .expanded {
        height: 65vh; /* Adjust the expanded height as needed */

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