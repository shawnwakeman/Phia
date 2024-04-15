<script>
	import { Editor } from "@wakemanshawn/novel-svelte-shawnwakeman";
	import { writable } from 'svelte/store';

	let showEditor = true;  // Toggle to control the display of the editor

	function saveContent() {
		const currentContent = localStorage.getItem('novel__content');
		localStorage.setItem('savedContent', currentContent);
		console.log('Content saved!');
	}

	function loadContent() {
		const loadedContent = localStorage.getItem('savedContent');
		if (loadedContent) {
			localStorage.setItem('novel__content', loadedContent);
			console.log('Content loaded!');

			// Toggle showEditor to false and then back to true to remount the component
			showEditor = false;
			// Use a timeout to ensure the DOM updates happen sequentially
			setTimeout(() => { showEditor = true; }, 0);
		}
	}
</script>

<!-- Conditional rendering based on the toggle -->
{#if showEditor}
	<Editor />
{/if}

<button on:click={saveContent}>Save Content</button>
<button on:click={loadContent}>Load Content</button>