<script lang="ts">
	import {
		selectedNodeStore,
		nodesDataStore,
		selectedNodeId,
		navigateNodeStore,
	} from "$lib/stores";
	import type { Node, Issue } from "../../../types/collection";
	export let issue: Issue;

	let breadcrumbList: { node: Node; showName: boolean }[] = [];

	// Subscribe to selectedNodeStore and update breadcrumbs when it changes
	const unsubscribe = selectedNodeStore.subscribe((currentId) => {
		console.log(issue);

		breadcrumbList = getBreadList(issue.node_id);
	});

	function getBreadList(
		startId: number
	): { node: Node; showName: boolean }[] {
		let currentNode = $nodesDataStore.find((node) => node.id === startId);
		const obj: { node: Node; showName: boolean }[] = [];

		// Check if we start with a valid node
		if (!currentNode) {
			console.log("No valid node found for ID:", startId); // Debug: No node found
			return obj;
		}

		// Build the breadcrumb trail
		obj.push({ node: currentNode, showName: false });

		while (currentNode && currentNode.parent_id && currentNode.id !== 1) {
			currentNode = $nodesDataStore.find(
				(node) => node.id === currentNode?.parent_id
			);
			if (currentNode) {
				obj.push({ node: currentNode, showName: false });
			}
		}

		obj.reverse(); // Reverse to start from the root

		// Hide everything, then show specific indices
		if (obj.length > 0) obj[0].showName = true; // Show second node
		if (obj.length > 0) obj[0].node.name = "PHIA"; // Show second node
		if (obj.length == 1) obj[0].node.name = "In PHIA"; // Show second node
		if (obj.length > 1) obj[1].showName = true; // Show second node
		if (obj.length > 2) obj[2].showName = true; // Show third node
		if (obj.length > 2) obj[obj.length - 1].showName = true; // Show last node
		if (obj.length > 3) obj[obj.length - 2].showName = true; // Show second last node

		return obj;
	}
</script>

<div class="breadcrumb-container">
	<nav class="breadcrumb-list items-center">
		{#each breadcrumbList as { node, showName }, index}
			{#if showName}
				<div
					class="breadcrumb-item p-px text-sm rounded-md transition duration-200 text-slate-300"
				>
					{node.name}
				</div>

				{#if index !== breadcrumbList.length - 1}
					<span class="breadcrumb-divider text-gray-500 px-0">/</span>
				{/if}
			{:else}
				<span class="breadcrumb-divider text-gray-500">..</span>
				<span class="breadcrumb-divider text-gray-500">/</span>
			{/if}
		{/each}
	</nav>
</div>

<style>
	.breadcrumb-container {
		display: flex;
		overflow: hidden;
		position: relative;
		mask-image: linear-gradient(
			to right,
			rgba(0, 0, 0, 1) 90%,
			rgba(0, 0, 0, 0)
		);
		-webkit-mask-image: linear-gradient(
			to right,
			rgba(0, 0, 0, 1) 90%,
			rgba(0, 0, 0, 0)
		);
		width: 100%;
	}

	.breadcrumb-list {
		display: flex;
		flex-wrap: nowrap;
	}

	.breadcrumb-item {
		white-space: nowrap;
		position: relative;
	}

	.breadcrumb-divider {
		white-space: nowrap;
	}
</style>
