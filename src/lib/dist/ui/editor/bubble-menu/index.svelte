<script context="module"></script>

<script>
  import { cn } from "../../../utils.js";
  import { BoldIcon, CodeIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon,  } from "lucide-svelte";
  import {
  TableCellsMerge,
  TableCellsSplit,
  BetweenHorizontalStart,
  BetweenVerticalStart,
  Trash2,
  MoveLeft,
  MoveDown,
  MoveRight,
  MoveUp,
  Heading
} from "lucide-svelte";

  import { writable } from "svelte/store";
  import ColorSelector from "./color-selector.svelte";
  import LinkSelector from "./link-selector.svelte";
  import NodeSelector from "./node-selector.svelte";
  import { BubbleMenuPlugin } from "@tiptap/extension-bubble-menu";
  import { onDestroy, onMount } from "svelte";
  import { Separator } from "$lib/components/ui/separator/index";

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
    },
    onShow(instance) {
      instance.popper.style.opacity = 0;
      requestAnimationFrame(() => {
        instance.popper.style.transition = "opacity 0.05s ease-in";
        instance.popper.style.opacity = 1;
      });
    },
    onHide(instance) {
      instance.popper.style.transition = "opacity 0.05s ease-out";
      instance.popper.style.opacity = 0;
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

 
  const tableItems = [
  {
    name: "addRowBelow",
    command: () => {
      editor.chain().focus().addRowAfter().run();
      editor.commands.fixTables();
    },
    label: BetweenHorizontalStart,
    category: "rows",
  },
  {
    name: "addColumnRight",
    command: () => {
      editor.chain().focus().addColumnAfter().run();
      editor.commands.fixTables();
    },
    label: BetweenVerticalStart,
    category: "columns",
  },
  {
    name: "deleteRow",
    command: () => {
      editor.chain().focus().deleteRow().run();
      editor.commands.fixTables();
    },
    label: Trash2,
    category: "rows",
  },
  {
    name: "deleteColumn",
    command: () => {
      editor.chain().focus().deleteColumn().run();
      editor.commands.fixTables();
    },
    label: Trash2,
    category: "columns",
  },
  {
    name: "moveRowUp",
    command: () => {
      editor.chain().focus().moveRowUp().run();
      editor.commands.fixTables();
    },
    label: MoveUp,
    category: "rows",
  },
  {
    name: "moveRowDown",
    command: () => {
      editor.chain().focus().moveRowDown().run();
      editor.commands.fixTables();
    },
    label: MoveDown,
    category: "rows",
  },
  {
    name: "moveColumnLeft",
    command: () => {
      editor.chain().focus().moveColumnLeft().run();
      editor.commands.fixTables();
    },
    label: MoveLeft,
    category: "columns",
  },
  {
    name: "moveColumnRight",
    command: () => {
      editor.chain().focus().moveColumnRight().run();
      editor.commands.fixTables();
    },
    label: MoveRight,
    category: "columns",
  },
  {
    name: "toggleHeaderColumn",
    command: () => {
      editor.chain().focus().toggleHeaderColumn().run();
      editor.commands.fixTables();
    },
    label: TableCellsMerge,
    category: "headers",
  },
  {
    name: "merge",
    command: () => {
      editor.chain().focus().mergeOrSplit().run();
      editor.commands.fixTables();
    },
    label: TableCellsMerge,
    category: "other",
  },
  {
    name: "deleteTable",
    command: () => {
      editor.chain().focus().deleteTable().run();
      editor.commands.fixTables();
    },
    label: Trash2,
    category: "other",
  },
];

  const reset = () => {
    isNodeSelectorOpen.set(false);
    isColorSelectorOpen.set(false);
    isLinkSelectorOpen.set(false);
  };

  $: if (!$isNodeSelectorOpen) reset();
  $: if (!$isColorSelectorOpen) reset();
  $: if (!$isLinkSelectorOpen) reset();

  if (!editor) throw new Error("Missing editor instance.");

  $: isTableActive = editor.isActive('table') || editor.isActive('tableCell');


  onMount(() => {
    const plugin = BubbleMenuPlugin({
      pluginKey,
      editor,
      element,
      tippyOptions,
      shouldShow,
      updateDelay
    });

        editor.on('selectionUpdate', () => {
        isTableActive = editor.isActive('table') || editor.isActive('tableCell');
    });
    editor.registerPlugin(plugin);
  });

  onDestroy(() => {
    editor.unregisterPlugin(pluginKey);
  });
</script>

<div
  bind:this={element}
  class="flex w-fit divide-x divide-stone-200 rounded border bg-white shadow-xl"
>

<div class="flex w-fit divide-x">
    {#if isTableActive}
        <div>
            <h4 class=" m-1 pt-px text-sm font-normal text-gray-500">Row</h4>
            <Separator/>
            <div class="grid grid-cols-2">
            {#each tableItems.filter(item => item.category === 'rows') as tableItem (tableItem.name)}
                    <button
                    on:click={tableItem.command}
                    class="flex justify-center items-center p-2 text-stone-600 hover:bg-stone-100 active:bg-stone-200 w-full"
                    type="button"
                >
                <svelte:component this={tableItem.label} />
                </button>
            {/each}
            </div>
        </div>
        <div>
            <h4 class=" m-1 pt-px text-sm font-normal text-gray-500">Column</h4>
            <Separator/>
            <div class="grid grid-cols-2">
            {#each tableItems.filter(item => item.category === 'columns') as tableItem (tableItem.name)}
            <button
            on:click={tableItem.command}
            class="flex justify-center items-center p-2 text-stone-600 hover:bg-stone-100 active:bg-stone-200 w-full"
            type="button"
        >
                <svelte:component this={tableItem.label} />
                </button>
            {/each}
            </div>
        </div>
      
        <div>
            <h4 class=" m-1 pt-px text-sm font-normal text-gray-500">Table</h4>
            <Separator/>
            <div class="">
            {#each tableItems.filter(item => item.category === 'other') as tableItem (tableItem.name)}
            <button
            on:click={tableItem.command}
            class="flex justify-center items-center p-2 text-stone-600 hover:bg-stone-100 active:bg-stone-200 w-full"
            type="button"
        >
                <svelte:component this={tableItem.label} />
                </button>
            {/each}
            </div>
        </div>

  
    {:else}

    <NodeSelector {editor} bind:isOpen={$isNodeSelectorOpen} />
    <LinkSelector {editor} bind:isOpen={$isLinkSelectorOpen} />



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

      <ColorSelector {editor} bind:isOpen={$isColorSelectorOpen} />
    {/if}
  </div>

 
</div>
