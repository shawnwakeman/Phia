<script lang="ts">
	import BulletList from "./featureList.svelte";
	import { Editor } from "$lib/dist";
	import Issues from "$lib/nodeManager/Issues.svelte";
	import State from "./State.svelte";
	import TitleInfo from "./TitleInfo.svelte";
	import { Separator } from "$lib/components/ui/separator";
	import { Button } from "$lib/components/ui/button";
	import { Maximize2 } from "lucide-svelte";
	let isFullScreen = false;
	let editorContainer: HTMLDivElement;

	function toggleFullScreen() {
		isFullScreen = !isFullScreen;
		
        editorContainer.scrollIntoView({ behavior: "smooth" });
	
	}
</script>

<div class="pointer-events-auto overflow-y-auto h-full pr-1.5 pl-4 flex flex-col">
    <div class="my-4">
        <TitleInfo />
    </div>
	
  
	<State />

	<div class="py-4" bind:this="{editorContainer}">
		<div class="{`feature-container editor-container ${isFullScreen ? 'full-screen' : ''}`}">
			<div class="top-bar-editor py-2 px-4 flex items-center justify-between">
				<h1 class="text-lg font-semibold text-muted-foreground">Summary</h1>
				<div class="flex items-center">
					<Button on:click="{toggleFullScreen}" variant="ghost">
						<Maximize2 class="h-5 w-5 text-muted-foreground" /></Button
					>
				</div>
			</div>

			<Separator />
			<div
				class="editor-container overflow-y-auto overflow-x-hidden min-h-80 px-4  mr-0.5 {isFullScreen
					? 'h-full'
					: 'max-h-96'}"
         
			>
				<Editor></Editor>
			</div>
		</div>
	</div>
    <div class="my-4">
        <BulletList />
    </div>
	
	<div class="feature-container">
		<Issues />
		<!-- <List/> -->
	</div>
</div>

<style>
	main {
		max-height: 100vh;
		overflow-y: auto; /* Enables vertical scrolling */
		pointer-events: auto;

		padding-bottom: 2000px;
	}

	.feature-container {
		position: relative;
		padding: 0;
	
		transition: height 0.3s ease-in-out;
	}

	.top-bar-editor {
		z-index: 5;

		border-radius: 18px 18px 0 0;
	}

	.feature-container.full-screen .editor-container {
		height: calc(100vh - 10.5rem);
	}

	.editor-container {
		transition: height 0.3s ease-in-out;
	}
</style>
