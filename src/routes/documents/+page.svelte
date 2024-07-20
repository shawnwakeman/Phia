<script lang="ts">
    import Editor from "$lib/dist/ui/editor/indexForBase.svelte";
    import { Editor as EditorType } from '@tiptap/core';
    let saveStatus = 'Saved';
    let editor: EditorType;


  </script>
  
  <Editor
  bind:editor
  onUpdate={() => {
      saveStatus = 'Unsaved';
  }}
  onDebouncedUpdate={async () => {
      saveStatus = 'Saving...';
      

      setTimeout(() => {
          saveStatus = 'Saved';
      }, 500);
  }}
>
  <div
      class="absolute right-5 top-5 z-10 mb-5 rounded-lg bg-stone-100 px-2 py-1 text-sm text-stone-400"
  >
      {saveStatus}
  </div>
</Editor>