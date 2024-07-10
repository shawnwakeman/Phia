<script lang="ts">


    import { selectedNodeId, currentSelectedIssue, nodesDataStore} from "../../../stores";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import Breadcrums from "./breadcrums.svelte";
    import type { Issue } from '../../../types/collection';
    export let issue: Issue;
 
</script>

<style>
        h1 {
            outline: none;
        }

        
    .gradient-title {
        color: hsl(226, 100%, 70%);
    }
</style>
<div class="feature-container">
    <div class="flex flex-col mb-4">
        <div class="flex justify-between items-center mb-0">
            <h2 class="text-2xl">#{issue.project_specific_id}</h2>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger class="text-xl">...</DropdownMenu.Trigger>
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
        <h1 class="text-3xl gradient-title font-bold" contenteditable="true">{issue.name}</h1>
    </div>
    
    
    
    <div class="p-4 bg-gray-800 bg-opacity-50 rounded-xl">
        <Breadcrums issue={issue} />
    </div>
</div>