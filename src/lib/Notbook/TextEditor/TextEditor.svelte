<script lang="ts">
    import { onMount, onDestroy } from 'svelte'
    import { Editor } from '@tiptap/core'
    import StarterKit from '@tiptap/starter-kit'
    import Collaboration from '@tiptap/extension-collaboration'
    import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
    import { TiptapCollabProvider } from '@hocuspocus/provider'
    import * as Y from 'yjs'

    let element;
    let editor;

    



    onMount(() => {

        const doc = new Y.Doc()
        const provider = new TiptapCollabProvider({
            name: "document.name", // Unique document identifier for syncing. This is your document name.
            appId: '7j9y6m10', // Your Cloud Dashboard AppID or `baseURL` for on-premises
            token: 'notoken', // Your JWT token
            document: doc,
            
            // The onSynced callback ensures initial content is set only once using editor.setContent(), preventing repetitive content insertion on editor syncs.
            onSynced() {

            if( !doc.getMap('config').get('initialContentLoaded') && editor ){
                doc.getMap('config').set('initialContentLoaded', true);

                editor.commands.setContent(`
                <p>
                This is a radically reduced version of tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
                </p>
                <p>
                The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.
                </p>
                `)
            }

            }
        })

      editor = new Editor({
        element: element,
        extensions: [
          StarterKit.configure({
            history: false,
          }),
          Collaboration.configure({
            document: doc,
          }),
          CollaborationCursor.configure({
            provider,
            user: {
            name: 'Cyndi Lauper',
            color: '#f783ac',
            },
        }),

        ],
  
        onTransaction: () => {
          // force re-render so `editor.isActive` works as expected
          editor = editor
        },
   
        
      })

     
    })
  
    onDestroy(() => {
      if (editor) {
        editor.destroy()
      }
    })
  </script>
  
  {#if editor}
    <button
      on:click={() => editor.chain().focus().toggleHeading({ level: 1}).run()}
      class:active={editor.isActive('heading', { level: 1 })}
    >
      H1
    </button>
    <button
      on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      class:active={editor.isActive('heading', { level: 2 })}
    >
      H2
    </button>
    <button on:click={() => editor.chain().focus().setParagraph().run()} class:active={editor.isActive('paragraph')}>
      P
    </button>
  {/if}
  
  <div bind:this={element} />
  
<style>
    button.active {
      background: black;
      color: white;
    }


  </style>