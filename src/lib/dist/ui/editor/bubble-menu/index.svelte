<script context="module"></script>

<script>import { cn } from "../../../utils.js";
import { BoldIcon, CodeIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from "lucide-svelte";
import { writable } from "svelte/store";
import ColorSelector from "./color-selector.svelte";
import LinkSelector from "./link-selector.svelte";
import NodeSelector from "./node-selector.svelte";
import { BubbleMenuPlugin } from "@tiptap/extension-bubble-menu";
import { onDestroy, onMount } from "svelte";
let element;
let isNodeSelectorOpen = writable(false);
let isColorSelectorOpen = writable(false);
let isLinkSelectorOpen = writable(false);
export let editor;
export let tippyOptions = {
  moveTransition: "transform 0.15s ease-out",
  onHidden: () => {
    isNodeSelectorOpen.set(false);
    isColorSelectorOpen.set(false);
    isLinkSelectorOpen.set(false);
  }
};
export let pluginKey = "SvelteTiptapBubbleMenu";
export let shouldShow = ({ editor: editor2 }) => {
  if (editor2.isActive("image")) {
    return false;
  }
  return editor2.view.state.selection.content().size > 0;
};
export let updateDelay = 250;
const items = [
  {
    name: "bold",
    isActive: () => editor.isActive("bold"),
    command: () => editor.chain().focus().toggleBold().run(),
    icon: BoldIcon
  },
  {
    name: "italic",
    isActive: () => editor.isActive("italic"),
    command: () => editor.chain().focus().toggleItalic().run(),
    icon: ItalicIcon
  },
  {
    name: "underline",
    isActive: () => editor.isActive("underline"),
    command: () => editor.chain().focus().toggleUnderline().run(),
    icon: UnderlineIcon
  },
  {
    name: "strike",
    isActive: () => editor.isActive("strike"),
    command: () => editor.chain().focus().toggleStrike().run(),
    icon: StrikethroughIcon
  },
  {
    name: "code",
    isActive: () => editor.isActive("code"),
    command: () => editor.chain().focus().toggleCode().run(),
    icon: CodeIcon
  }
];
const reset = () => {
  isNodeSelectorOpen.set(false);
  isColorSelectorOpen.set(false);
  isLinkSelectorOpen.set(false);
};
$:
  if (!$isNodeSelectorOpen) {
    reset();
  }
$:
  if (!$isColorSelectorOpen) {
    reset();
  }
$:
  if (!$isLinkSelectorOpen) {
    reset();
  }
if (!editor) {
  throw new Error("Missing editor instance.");
}
onMount(() => {
  const plugin = BubbleMenuPlugin({
    pluginKey,
    editor,
    element,
    tippyOptions,
    shouldShow,
    updateDelay
  });
  editor.registerPlugin(plugin);
});
onDestroy(() => {
  editor.unregisterPlugin(pluginKey);
});
</script>

<div
	bind:this={element}
	class="flex w-fit divide-x divide-stone-200 rounded border border-stone-200 bg-white shadow-xl"
>
	<NodeSelector {editor} bind:isOpen={$isNodeSelectorOpen} />
	<LinkSelector {editor} bind:isOpen={$isLinkSelectorOpen} />
 
	<div class="flex">
		{#each items as item, index (index)}
			<button
				on:click={item.command}
				class="p-2 text-stone-600 hover:bg-stone-100 active:bg-stone-200"
				type="button"
			>
				<svelte:component
					this={item.icon}
					class={cn('h-4 w-4', {
						'text-blue-500': item.isActive()
					})}
				/>
			</button>
		{/each}
	</div>
	<ColorSelector {editor} bind:isOpen={$isColorSelectorOpen} />
</div>
