<script>
	import { Editor } from "@wakemanshawn/novel-svelte-shawnwakeman";
	import { writable } from 'svelte/store';
    import Sidebar from "$lib/Sidebar.svelte";
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



<style>

  
    .main {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
  
   
  </style>

<main class="main">
    <Sidebar/>
    <div class="content"></div>
        <button on:click={saveContent}>Save Content</button>
        <button on:click={loadContent}>Load Content</button>

        <Editor />
</main>