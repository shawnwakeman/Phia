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
    import { currentSelectedIssue } from '../../../../stores';
    import { get } from 'svelte/store';
    import { create, diff, patch } from 'jsondiffpatch';
    import { v4 as uuidv4 } from 'uuid';

    

    export let completionApi = "/api/generate";
    let className = "editor";
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
        // editor.commands.setContent(value);
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
      if ($currentSelectedIssue) {
        await saveSummary($currentSelectedIssue.id, editor2.getJSON(), sessionId, "summaries_issues");
        
      }
      
      onDebouncedUpdate(editor2);
    }, debounceDuration);


    onMount(async () => {

      // Subscribe to changes in the currentSelectedIssue

        if ($currentSelectedIssue) {
            initializeEditor()
            console.log($currentSelectedIssue);
            const documentid = $currentSelectedIssue.id;
            if (editor) {

            
                const summary = await fetchSummary($currentSelectedIssue.id, "summaries_issues");
                console.log(summary);
                editor.commands.setContent(summary)
                updateEditorSubscription(documentid);



    
            }

        }

     
       




      

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
            if (changes ) {
                await saveSummaryChanges($currentSelectedIssue.id, changes, sessionId, "summaries_issues");
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
          table: 'summaries_issues',
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
  
<div class=" feature-wrapper wrapper">
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


</div>



<style>

.editor {

    height: 100%;
    overflow: auto;

    padding-left: 2em;
    padding-top: 2em;
    padding-bottom: 2em;



}

.wrapper {
    margin-right: 20px;
    margin-left: 15px;
    margin-top: 2vw; 
    margin-bottom: 2vw;
    padding-right: 5px;
    overflow: hidden; /* Added to prevent overflow issues */
    height: 100%;
}
</style>
