<script>
    import "../../styles/index.css";
    import "../../styles/prosemirror.css";
    import "../../styles/tailwind.css";
    import { getPrevText } from "../../editor.js";
    import { createLocalStorageStore } from "../../stores/localStorage.js";
    import { createDebouncedCallback, noop } from "../../utils.js";
    import { Editor } from "@tiptap/core";
    import ImageResizer from "./extensions/ImageResizer.svelte";
    import { onMount } from "svelte";
    import { defaultEditorContent } from "./default-content.js";
    import { defaultExtensions } from "./extensions/index.js";
    import { defaultEditorProps } from "./props.js";
    import Toasts, { addToast } from "../toasts.svelte";
    import EditorBubbleMenu from "./bubble-menu/index.svelte";
    import { supabase, fetchSummary, saveSummary, saveSummaryChanges  } from "$lib/supabaseClient";
    import { currentSelectedIssue } from '../../../../stores';
    import { get } from 'svelte/store';
    import { create, diff, patch } from 'jsondiffpatch';
    import { v4 as uuidv4 } from 'uuid';

    

    export let completionApi = "/api/generate";
    let className = "relative max-w-screen-lg border-stone-200 bg-white p-5 pb-24 sm:pb-12 px-4 sm:rounded-lg sm:border sm:shadow-lg flex-grow overflow-auto max-h-[600px]";
    export { className as class };
    export let defaultValue = defaultEditorContent;
    export let extensions = [];
    export let editorProps = {};
    export let onUpdate = noop;
    export let onDebouncedUpdate = noop;
    export let debounceDuration = 750;
    export let storageKey = "novel__content";
    export let disableLocalStorage = true;
    export let editor = void 0;

    let element;
  
    let unsubscribe; // To store the unsubscribe function for the Supabase channel



    const diffpatcher = create();
    let lastSentState = null;
    let sessionId = uuidv4()
  
   
  
    const content = createLocalStorageStore(storageKey, defaultValue);
    let hydrated = false;
    $: if (editor && !hydrated) {
      const value = disableLocalStorage ? defaultValue : $content;
      if (value) {
        // editor.commands.setContent(value);
      }
      hydrated = true;
    }
    
   


    onMount(() => {
        
        initializeEditor();




    //   return () => {
         
    //   };
    });
  
    function initializeEditor() {
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
        
        // autofocus: "start",
      });
    }
  
   


  </script>
  
  <div>
    <div id="editor" bind:this={element}></div>
  
  </div>
  
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
  