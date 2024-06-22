<script>


    import { selectedNodeId, selectedNodeStore, nodesDataStore} from "../../stores";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import Breadcrums from "./breadcrums.svelte";
</script>

<style>

.feature-container {
        padding: 30px;
                margin-right: 3vw;
        margin-left: 3vw;
        margin-top: 2vw; 
        margin-bottom: 2vw;
        /* padding-top: 600px; */

        background: hsl(227, 36%, 5%, 0.5);
        background-image: radial-gradient(circle at 89% 12%, hsla(223, 45%, 10%, 0.639) 0%, hsla(227, 69%, 3%, 0.64) 122%), url('/noise.svg'); 
            

        border-radius: 24px; 
     
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        box-shadow:  -10px 10px 24px hsla(223, 33%, 4%, 0.753);
        color: white;
        



    }

    .feature-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 24px; 
        border: 1px solid transparent;
        background: linear-gradient(210deg,hsl(0, 0%, 100%),hsl(222, 12%, 22%)) border-box;
        -webkit-mask:
            linear-gradient(#fff 0 0) padding-box, 
            linear-gradient(#fff 0 0);
        -webkit-mask-composite: destination-out;
        mask-composite: exclude;
        pointer-events: none;  /* Ignore all pointer events */
                
        
    }

    .gradient-title {
        color: hsl(226, 100%, 70%);
    }
</style>
<div class="feature-container">
    <div class="flex flex-col mb-4">
        <div class="flex justify-between items-center mb-0">
            <h2 class="text-2xl">#{$selectedNodeStore?.project_specific_id}</h2>
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
        <h1 class="text-4xl gradient-title font-bold">{$selectedNodeStore?.name}</h1>
    </div>
    
    
    
    <div class="p-4 bg-gray-800 bg-opacity-50 rounded-xl">
        <Breadcrums />
    </div>
</div>
