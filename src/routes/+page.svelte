<script lang="ts">
	import { Editor } from "$lib/dist";
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
<div class="root-container">
    <div class="pointer-events-auto h-[92vh] pr-1.5 pl-4 flex flex-col my-12 mx-10 ">
        <div class="py-4 h-full" bind:this="{editorContainer}">
          <div class="feature-container h-full flex flex-col">
            <div class="top-bar-editor py-2 px-4 flex items-center justify-between">
              <h1 class="text-lg font-semibold text-muted-foreground">Editor</h1>
              <div class="flex items-center">
                
              </div>
            </div>
            <Separator />
            <div class="editor-wrapper flex-1 overflow-y-auto overflow-x-hidden pt-6 px-12 mr-0.5">
              <Editor></Editor>
            </div>
          </div>
        </div>
      </div>
    
</div>


<style>

	
    .feature-container {
    position: relative;
    padding: 0;
    transition: height 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
    height: 100%;
    }

    .top-bar-editor {
    z-index: 5;
    border-radius: 18px 18px 0 0;
    }

    .editor-wrapper {
    flex: 1;
    }

    .bg-class {
    background-color: rgb(255, 255, 255);
    }
    .root-container {
        height: 100svh;
        background-image: 
		linear-gradient(
			150deg,
			hsla(0, 0%, 10%, 0.531) 0%,
			hsla(154, 33%, 8%, 0.575) 50%
		),
		url("/noiseSide.svg");
        margin: 0;
        padding: 0;
 
        overflow: hidden;
        box-sizing: border-box; 

    }

</style>
