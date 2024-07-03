<script>
    import "../../styles/index.css";
    import "../../styles/prosemirror.css";
    import "../../styles/tailwind.css";
    import { getPrevText } from "../../editor.js";
    import { createLocalStorageStore } from "../../stores/localStorage.js";
    import { createDebouncedCallback, noop } from "../../utils.js";
    import { Editor } from "@tiptap/core";
    import { useCompletion } from "ai/svelte";
    import ImageResizer from "./extensions/ImageResizer.svelte";
    import { onMount } from "svelte";
    import { defaultEditorContent } from "./default-content.js";
    import { defaultExtensions } from "./extensions/index.js";
    import { defaultEditorProps } from "./props.js";
    import Toasts, { addToast } from "../toasts.svelte";
    import EditorBubbleMenu from "./bubble-menu/index.svelte";
    import { supabase, fetchSummary, saveSummary, saveSummaryChanges  } from "$lib/supabaseClient";
    import { selectedNodeStore } from '../../../../stores';
    import { get } from 'svelte/store';
    import { create, diff, patch } from 'jsondiffpatch';
    import { v4 as uuidv4 } from 'uuid';

    

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
  
    let unsubscribe; // To store the unsubscribe function for the Supabase channel



    const diffpatcher = create();
    let lastSentState = null;
    let sessionId = uuidv4()
  
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
    $: if (editor && !hydrated) {
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
      if (selectedNodeStore) {
        console.log("aksjdhasjkhdlkajshdkjashdkjhaslkdjh");
        await saveSummary($selectedNodeStore.id, editor2.getJSON(), sessionId);
        
      }
      
      onDebouncedUpdate(editor2);
    }, debounceDuration);
  
    onMount(() => {
      initializeEditor();
      // Subscribe to changes in the selectedNodeStore
      selectedNodeStore.subscribe( async value => {
        const documentid = value.id;
        if (editor) {
            const summary = await fetchSummary(value.id);
            editor.commands.setContent(summary)
            updateEditorSubscription(documentid);
        }
      });
      return () => {
        if (editor) editor.destroy();
        if (unsubscribe) unsubscribe(); // Clean up the Supabase subscription
      };
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
        onUpdate: async  (e) => {
            console.log("adsdasd");
          const selection = e.editor.state.selection;
          const lastTwo = getPrevText(e.editor, { chars: 2 });
          if (lastTwo === "++" && !$isLoading) {
            e.editor.commands.deleteRange({ from: selection.from - 2, to: selection.from });
            complete(getPrevText(e.editor, { chars: 5e3 }));
          } else {

            const currentState = editor.getJSON();
            const changes = diff(lastSentState, currentState);
            if (changes) {
                await saveSummaryChanges($selectedNodeStore.id, changes, sessionId);
                lastSentState = currentState;
            }
      
            onUpdate(e.editor);
            debouncedUpdates(e);
          }
  
          // Update Supabase with new content
        
        },
        autofocus: "end",
      });
    }
  
    function updateEditorSubscription(documentid) {
      if (unsubscribe) unsubscribe(); // Unsubscribe from the previous channel if exists
  
      // Subscribe to changes in Supabase
      const channel = supabase.channel('custom-filter-channel')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'summaries',
          filter: `node_id=eq.${documentid}`
        }, (payload) => {
          
            
            
            

            if (payload.new.sessionID !== sessionId) {
                console.log('Applying changes to editor content');
                const currentContent = editor.getJSON();
                const updatedContent = patch(currentContent, payload.new.changes);
                editor.commands.setContent(updatedContent);
                console.log(editor.content);
            }

              
       
        })
    .subscribe();
    
  
      unsubscribe = () => {
        channel.unsubscribe();
      };
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
  