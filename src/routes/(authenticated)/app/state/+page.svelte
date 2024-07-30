<script lang="ts">
	import { Pane, Splitpanes } from "svelte-splitpanes";
	import BarChart from "$lib/BarChart.svelte";
	import { onMount } from "svelte";
	import type { Node, Issue, TargetStates } from "../../types/collection";
	import {
		selectedNodeId,
		selectedNodeStore,
		nodesDataStore,
		issuesDataStore,
		sidebarWidthStore,
		targetStatesStore,
	} from "$lib/stores";
	import { get } from "svelte/store";

	import NodeManager from "$lib/nodeManager/index.svelte";

	export let data: {
		nodes: Node[];
		issues: Issue[];
		rootNode: Node;
		targetStates: TargetStates[];
	};
	import Sidebar from "$lib/Sidebar.svelte";

	$: $selectedNodeId, updateSelectedNodeStore();

	function updateSelectedNodeStore() {
		const selectedNode = get(nodesDataStore).find(
			(node) => node.id === $selectedNodeId
		);
		selectedNodeStore.set(selectedNode || null);
	}

	nodesDataStore.set(data.nodes);
	issuesDataStore.set(data.issues);
	selectedNodeId.set(data.rootNode.id);
	selectedNodeStore.set(data.rootNode);
	targetStatesStore.set(data.targetStates);

	onMount(() => {
		updateSelectedNodeStore();
	});

	let sidebarWidth = 46.85;
	$: sidebarWidthStore.set(sidebarWidth);
	function setSidebarWidth(width) {
		sidebarWidth = width;
	}
</script>

<main class="main">
	<Sidebar />

	<div class="content">
		<div class="layout">
			<div class="left-section">asdasasd</div>
			<div class="middle-section">
				<h1 class="font-default font-bold">List</h1>
			</div>
			<div class="right-section">asdasasdasd saas</div>
		</div>

		<div class="container">
			<button on:click="{() => setSidebarWidth(0)}">0/100</button>
			<button on:click="{() => setSidebarWidth(46.5)}">50/50</button>
			<button on:click="{() => setSidebarWidth(100)}">100/0</button>
		</div>

		<div class="wrapper" id="state-wrapper">
			<div class="splitpanes-container">
				<Splitpanes theme="my-theme" dblClickSplitter="{false}">
					<Pane bind:size="{sidebarWidth}" class="centered-content">
						<div class="passthrough-box"></div>
					</Pane>
					<Pane class="centered-content node-manager-pane">
						<NodeManager />
					</Pane>
				</Splitpanes>
			</div>

			<div class="bar-chart-underlay">
				<BarChart />
			</div>
		</div>
	</div>
</main>

<style>
	.main {
		display: flex;
		background-color: #1f2937;
		height: 100vh; /* Ensure the main container takes full viewport height */
		overflow: hidden; /* Prevent content from overflowing */
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden; /* Prevent content from overflowing */
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		position: relative;
		max-height: 100vh; /* Prevents extending beyond the viewport height */
		overflow: hidden; /* Prevent overflow */
		border-radius: 8px;
		margin-left: 12px;
		margin-right: 12px;
		margin-bottom: 12px;
		border-radius: 8px;
	}

	.container {
		display: flex;
		justify-content: space-around;
		max-width: 200px;
	}

	.passthrough-box {
		pointer-events: none;
	}

	.bar-chart-underlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.splitpanes-container {
		pointer-events: none;
		position: relative;
		flex: 1;
		z-index: 2; /* Ensure Splitpanes is above BarChart but below container */
	}

	.layout {
		display: flex;
		padding-top: 5px;
		padding-bottom: 5px;
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

	:global(.splitpanes.my-theme .splitpanes__pane) {
	}

	:global(.splitpanes.my-theme .splitpanes__splitter) {
		background-color: #cccccc00;
		position: relative;
		pointer-events: auto;
	}

	:global(.splitpanes.my-theme .splitpanes__splitter:before) {
		content: "";
		position: absolute;
		left: 0;
		top: 0;
		transition: opacity 0.4s;
		padding-top: px;
		opacity: 0.8;
		opacity: 1;
		z-index: 3;
	}

	:global(.splitpanes.my-theme .splitpanes__splitter:hover:before) {
		opacity: 1;
	}

	:global(
			.splitpanes.my-theme
				.splitpanes__splitter.splitpanes__splitter__active
		) {
		z-index: 3; /* Fix an issue of overlap fighting with a near hovered splitter */
	}

	:global(.my-theme.splitpanes--vertical > .splitpanes__splitter:before) {
		left: 2.5vw;
		right: -3.5vw;
		height: 100%;
		cursor: col-resize;
	}

	:global(.my-theme.splitpanes--horizontal > .splitpanes__splitter:before) {
		top: -30px;
		bottom: -30px;
		width: 100%;
		cursor: row-resize;
	}
</style>
