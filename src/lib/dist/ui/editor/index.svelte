<script>
    import "../../styles/index.css";
    import "../../styles/prosemirror.css";
    import "../../styles/tailwind.css";
    import { getPrevText } from "../../editor.js";
    import { createLocalStorageStore } from "../../stores/localStorage.js";
    import { createDebouncedCallback, noop } from "../../utils.js";
    import { Editor, Extension } from "@tiptap/core";
    import { useCompletion } from "ai/svelte";
    import ImageResizer from "./extensions/ImageResizer.svelte";
    import { onMount } from "svelte";
    import { defaultEditorContent } from "./default-content.js";
    import { defaultExtensions } from "./extensions/index.js";
    import { defaultEditorProps } from "./props.js";
    import { Decoration, DecorationSet } from 'prosemirror-view';
    import Toasts, { addToast } from "../toasts.svelte";
    import EditorBubbleMenu from "./bubble-menu/index.svelte";
    
    export let completionApi = "/api/generate";
    let className = "relative min-h-[500px] w-full max-w-screen-lg border-stone-200 bg-white p-12 pb-24 sm:pb-12 px-8 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:px-12 sm:shadow-lg";
    export { className as class };
    export let defaultValue = defaultEditorContent;
    export let extensions = [];
    export let editorProps = {};
    export let onUpdate = noop;
    export let onDebouncedUpdate = noop;
    export let debounceDuration = 750;
    export let storageKey = "novel__content";
    export let disableLocalStorage = false;
    export let editor = void 0;
    let element;
    
    const { complete, completion, isLoading, stop } = useCompletion({
      id: "novel",
      api: completionApi,
      onFinish: (_prompt, completion2) => {
        editor?.commands.setTextSelection({
          from: editor.state.selection.from - completion2.length,
          to: editor.state.selection.from
        });
      },
      onError: (err) => {
        addToast({
          data: {
            text: err.message,
            type: "error"
          }
        });
      }
    });
    const content = createLocalStorageStore(storageKey, defaultValue);
    let hydrated = false;
    $:
      if (editor && !hydrated) {
        const value = disableLocalStorage ? defaultValue : $content;
        if (value) {
          editor.commands.setContent(value);
        }
        hydrated = true;
      }
    let prev = "";
    function insertAiCompletion() {
      const diff = $completion.slice(prev.length);
      prev = $completion;
      editor?.commands.insertContent(diff);
    }
    $: {
      [$completion];
      insertAiCompletion();
    }
    const debouncedUpdates = createDebouncedCallback(async ({ editor: editor2 }) => {
      if (!disableLocalStorage) {
        const json = editor2.getJSON();
        content.set(json);
      }
      onDebouncedUpdate(editor2);
    }, debounceDuration);
    onMount(() => {
      editor = new Editor({
        element,
        onTransaction: () => {
          editor = editor;
    
    
        },
        extensions: [...defaultExtensions, ...extensions],
        editorProps: {
          ...defaultEditorProps,
          ...editorProps
        },
        onUpdate: (e) => {
          const selection = e.editor.state.selection;
          const lastTwo = getPrevText(e.editor, {
            chars: 2
          });
          if (lastTwo === "++" && !$isLoading) {
            e.editor.commands.deleteRange({
              from: selection.from - 2,
              to: selection.from
            });
            complete(
              getPrevText(e.editor, {
                chars: 5e3
              })
            );
          } else {
            onUpdate(e.editor);
            debouncedUpdates(e);
          }
        },
        autofocus: "end"
      });
      return () => editor.destroy();
    });
    
    
    </script>
    

    
    {#if editor && editor.isEditable}
      <EditorBubbleMenu {editor} />
    {/if}
    
    <div id="editor" class={className} bind:this={element}>
      <slot />
      {#if editor?.isActive('image')}
        <ImageResizer {editor} />
      {/if}
    </div>
    
    <Toasts />
    