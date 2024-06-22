<script lang="ts">
    import { selectedNodeStore, nodesDataStore, selectedNodeId, navigateNodeStore } from "../../stores";
    import type { Node } from '../../types/collection';

    let breadcrumbList: Node[] = [];

    // Subscribe to selectedNodeStore and update breadcrumbs when it changes
    const unsubscribe = selectedNodeStore.subscribe((currentId) => {

        breadcrumbList = getBreadList(currentId?.id);

    });

    function getBreadList(startId: number): Node[] {
        let currentNode = $nodesDataStore.find(node => node.id === startId);
        const obj: Node[] = [];

        // Check if we start with a valid node
        if (!currentNode) {
            console.log("No valid node found for ID:", startId); // Debug: No node found
            return obj;
        }

        // Build the breadcrumb trail
        obj.push(currentNode);

        while (currentNode && currentNode.parent_id && currentNode.id !== 1) {

            currentNode = $nodesDataStore.find(node => node.id === currentNode?.parent_id);
            if (currentNode) {
                obj.push(currentNode);
            }
        }

        return obj.reverse(); // Reverse to start from the root
    }


    function navigateTo(id) {
        const node = $nodesDataStore.find(node => node.id === id);
        if (node) {
            selectedNodeId.set(id);
            selectedNodeStore.set(node);
            navigateNodeStore.set(node)
    
            
        } else {
            console.error("Node not found:", id);
        }
    }
</script>

<nav class="flex flex-wrap items-center space-x-2 p-2">
    {#each breadcrumbList as node, index}
        <button 
            on:click={index !== breadcrumbList.length - 1 ? () => navigateTo(node.id) : null}
            class="bg-gray-700 cursor-pointer p-1 text-sm rounded-md transition duration-200 hover:bg-blue-500 hover:text-white {node.id === $selectedNodeId ? 'text-blue-500' : 'text-slate-300'}"
        >
            {node.name}
        </button>
        {#if index !== breadcrumbList.length - 1}
            <span class="text-gray-500 mx-1">/</span>
        {/if}
    {/each}
</nav>