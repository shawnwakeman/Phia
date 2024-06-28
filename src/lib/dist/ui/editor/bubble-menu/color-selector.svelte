<script context="module"></script>

<script>import { createPopover, melt } from "@melt-ui/svelte";
import { Check, ChevronDown } from "lucide-svelte";
export let editor;
export let isOpen;
const TEXT_COLORS = [
  {
    name: "Default",
    color: "var(--novel-black)"
  },
  {
    name: "Purple",
    color: "#E00000"
  },
  {
    name: "Red",
    color: "#E00000"
  },
  {
    name: "Yellow",
    color: "#EAB308"
  },
  {
    name: "Blue",
    color: "#2563EB"
  },
  {
    name: "Green",
    color: "#008A00"
  },
  {
    name: "Orange",
    color: "#FFA500"
  },
  {
    name: "Pink",
    color: "#BA4081"
  },
  {
    name: "Gray",
    color: "#A8A29E"
  }
];
const HIGHLIGHT_COLORS = [
  {
    name: "Default",
    color: "var(--novel-highlight-default)"
  },
  {
    name: "Purple",
    color: "var(--novel-highlight-purple)"
  },
  {
    name: "Red",
    color: "var(--novel-highlight-red)"
  },
  {
    name: "Yellow",
    color: "var(--novel-highlight-yellow)"
  },
  {
    name: "Blue",
    color: "var(--novel-highlight-blue)"
  },
  {
    name: "Green",
    color: "var(--novel-highlight-green)"
  },
  {
    name: "Orange",
    color: "var(--novel-highlight-orange)"
  },
  {
    name: "Pink",
    color: "var(--novel-highlight-pink)"
  },
  {
    name: "Gray",
    color: "var(--novel-highlight-gray)"
  }
];
const activeColorItem = TEXT_COLORS.find(({ color }) => editor.isActive("textStyle", { color }));
const activeHighlightItem = HIGHLIGHT_COLORS.find(
  ({ color }) => editor.isActive("highlight", { color })
);
const {
  elements: { trigger, content },
  states: { open: localOpen }
} = createPopover({
  defaultOpen: isOpen,
  onOpenChange({ next }) {
    isOpen = next;
    return next;
  }
});
$:
  localOpen.set(isOpen);
</script>

<div>
	<div class="relative h-full">
		<button
			type="button"
			{...$trigger} use:$trigger.action
			class="flex h-full items-center gap-1 p-2 text-sm font-medium text-stone-600 hover:bg-stone-100 active:bg-stone-200"
		>
			<span
				class="rounded-sm px-1"
				style:color={activeColorItem?.color}
				style:background-color={activeHighlightItem?.color}
			>
				A
			</span>

			<ChevronDown class="h-4 w-4" />
		</button>

		<div
			{...$content} use:$content.action
			align="start"
			class="z-[99999] my-1 flex max-h-80 w-48 flex-col overflow-hidden overflow-y-auto rounded border border-stone-200 bg-white p-1 shadow-xl animate-in fade-in slide-in-from-top-1"
		>
			<div class="my-1 px-2 text-sm text-stone-500">Color</div>
			{#each TEXT_COLORS as { name, color }, index (index)}
				<button
					on:click={() => {
						editor.commands.unsetColor();
						name !== 'Default' &&
							editor
								.chain()
								.focus()
								.setColor(color || '')
								.run();
						isOpen = false;
					}}
					class="flex items-center justify-between rounded-sm px-2 py-1 text-sm text-stone-600 hover:bg-stone-100"
					type="button"
				>
					<div class="flex items-center space-x-2">
						<div class="rounded-sm border border-stone-200 px-1 py-px font-medium" style:color>
							A
						</div>
						<span>{name}</span>
					</div>
					{#if editor.isActive('textStyle', { color })}
						<Check class="h-4 w-4" />
					{/if}
				</button>
			{/each}

			<div class="mb-1 mt-2 px-2 text-sm text-stone-500">Background</div>

			{#each HIGHLIGHT_COLORS as { name, color }, index (index)}
				<button
					on:click={() => {
						editor.commands.unsetHighlight();
						name !== 'Default' && editor.commands.setHighlight({ color });
						isOpen = false;
					}}
					class="flex items-center justify-between rounded-sm px-2 py-1 text-sm text-stone-600 hover:bg-stone-100"
					type="button"
				>
					<div class="flex items-center space-x-2">
						<div
							class="rounded-sm border border-stone-200 px-1 py-px font-medium"
							style:background-color={color}
						>
							A
						</div>
						<span>{name}</span>
					</div>
					{#if editor.isActive('highlight', { color })}
						<Check class="h-4 w-4" />
					{/if}
				</button>
			{/each}
		</div>
	</div>
</div>
