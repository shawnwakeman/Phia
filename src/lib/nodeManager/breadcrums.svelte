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

<nav>
    {#each breadcrumbList as node, index}
        <button on:click={index !== breadcrumbList.length - 1 ? () => navigateTo(node.id) : null}>
            {node.name}
        </button>
        {#if index !== breadcrumbList.length - 1}
            <span>/ </span> 
        {/if}
    {/each}
</nav>

<style>
    nav {
        display: flex; /* Use flexbox for horizontal layout */
        align-items: center; /* Center items vertically */
        padding: 0;
        margin: 0;
    }

    nav button {
        background: none; /* Removes default button styling */
        border: none; /* Removes border */
        color: #007BFF; /* Example color: blue */
        cursor: pointer; /* Indicates the button is clickable */
        padding: 5px 10px; /* Padding around the text */
        font-size: 16px; /* Set font size */
        outline: none; /* Removes focus outline */
    }

    nav button:hover {
        text-decoration: underline; /* Adds underline on hover */
    }

    nav span {
        margin: 0 5px; /* Margin around slashes for spacing */
        color: #666; /* Example color for the slashes */
    }
</style>