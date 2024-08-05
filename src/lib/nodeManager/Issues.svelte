<script lang="ts">
	import List from "$lib/Issues/List/index.svelte";
	import ListOptions from "$lib/Issues/List/ListDisplayOptions.svelte";
	import {
		issuesDataStore,
		filteredIssuesDataStore,
		selectedIssues,
	} from "$lib/stores";
	import FilterControls from "$lib/Issues/Kaban/Filter.svelte";
	import SelectionBar from "$lib/Issues/selectionBar.svelte";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import AddButton from "$lib/Issues/Kaban/AddButton.svelte";

	onMount(async () => {
		const issues = get(issuesDataStore);
		filteredIssuesDataStore.set(issues); // Set the initial filtered issues store value
	});
</script>

<div class="content-issues">
	<div class="layout" id="layout-id">
		<div class="left-section">
			<FilterControls />
		</div>
		<div class="middle-section">
			<AddButton />

			<ListOptions />
		</div>
	</div>

	<div class="internals-list">
		<List nodes="{true}" />
	</div>
</div>

<div class:bottom-bar-visible="{$selectedIssues.length > 0}" class="bottom-bar">
	<SelectionBar />
</div>

<style>




	.content-issues {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: auto;
		user-select: none;
	}

	.bottom-bar {
		position: fixed;
		bottom: -60px; /* Initially hidden below the viewport */
		left: 35%; /* Centered horizontally (30% of screen width, 35% left + 30% width = 65%, so centered) */
		width: 30%;
		height: 50px; /* Reduced height */
		background-color: #333;
		color: white;
		display: flex;
		justify-content: space-around;
		align-items: center; /* Center content vertically */
		padding: 0.5em;
		border-radius: 10px; /* Optional: rounded corners */
		transition: bottom 0.3s ease-in-out;
	}

	.bottom-bar-visible {
		bottom: 20px; /* Slide up into view with a gap from the bottom */
	}

	.bottom-bar button {
		background: #444;
		color: white;
		border: none;
		padding: 0.3em 0.6em; /* Adjusted padding for smaller buttons */
		cursor: pointer;
		border-radius: 5px; /* Optional: rounded buttons */
	}

	.bottom-bar button:hover {
		background: #555;
	}
	.internals-kanban {
		overflow: hidden;
		height: 100%;
		background: rgb(6, 6, 8);
		margin-left: 12px;
		margin-right: 12px;
		margin-bottom: 12px;
		border-radius: 8px;
	}
	.internals-list {
		overflow: hidden;
		height: 100%;
		background: rgb(6, 6, 8);
		margin-left: 12px;
		margin-right: 12px;
		margin-bottom: 12px;
		border-radius: 8px;
	}

	.internals-treemap {
		overflow: hidden;
	}

	.layout {
		display: flex;
		padding-top: 10px;
		padding-bottom: 10px;
		padding-left: 25px;
		padding-right: 25px;
	}

	.left-section {
		flex: 1;
		display: flex;
		align-items: center; /* Centers content vertically */
	}

	.middle-section {
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	.right-section {
		flex: 1;
		display: flex;

		align-items: center; /* Centers content vertically */
		justify-content: right; /* Centers content horizontally */
		text-align: center; /* Centers text horizontally within the flex container */
	}
</style>
