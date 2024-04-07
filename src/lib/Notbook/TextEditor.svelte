<script>
    import { onMount } from 'svelte';
    import { EditorState } from 'prosemirror-state';
    import { EditorView } from 'prosemirror-view';
    import { Schema } from 'prosemirror-model';
    import { schema } from 'prosemirror-schema-basic';
    import { exampleSetup } from 'prosemirror-example-setup';
  
    let editorContainer;
  
    onMount(() => {
      const editorView = new EditorView(editorContainer, {
        state: EditorState.create({
          doc: DOMParser.fromSchema(schema).parse(editorContainer),
          plugins: exampleSetup({ schema }),
        }),
      });
  
      return () => editorView.destroy();
    });
  </script>
  
  <div bind:this={editorContainer} class="editor"></div>
  
  <style>
    .editor {
      border: 1px solid #ccc;
      padding: 4px;
      min-height: 200px;
    }
  </style>
  