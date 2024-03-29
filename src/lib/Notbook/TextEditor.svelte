<script>
    import { onMount, onDestroy } from 'svelte';
  
    let editorInstance;
  



    onMount(async () => {
      // Dynamically import Editor.js to ensure it's only loaded client-side
      const EditorJS = (await import('@editorjs/editorjs')).default;
      const Paragraph = (await import('@editorjs/paragraph')).default;
      const Header = (await import('@editorjs/header')).default;
      const DragDrop = (await import('editorjs-drag-drop')).default;
      const NestedList  = (await import('@editorjs/nested-list')).default;
      const Checklist = (await import('@editorjs/checklist')).default;
   
      const Alert  = (await import('editorjs-alert')).default;
      const Table   = (await import('@editorjs/table')).default;
      const Undo    = (await import('editorjs-undo')).default;
      const LinkTool     = (await import('@editorjs/link')).default;

      const Embed      = (await import('@editorjs/embed')).default;


    
    //   const Underline       = (await import('@editorjs/underline')).default;
    //   const InlineCode       = (await import('@editorjs/inline-code')).default;

      const ColorPlugin        = (await import('editorjs-text-color-plugin')).default;
    //   const Strikethrough        = (await import('@sotaproject/strikethrough')).default;
    //   const Tooltip        = (await import('editorjs-tooltip')).default;

      const savedData = {
  "time": 1711665684764,
  "blocks": [
    {
      "id": "R5fD_2vgFE",
      "type": "linkTool",
      "data": {
        "link": "https://github.com/editor-js/link",
        "meta": {
          "title": "GitHub - editor-js/link: Link Tool for Editor.js 2.0",
          "description": "Link Tool for Editor.js 2.0. Contribute to editor-js/link development by creating an account on GitHub.",
          "image": {
            "url": "https://opengraph.githubassets.com/5c3b96c96123cca2f267c652da91c589a9af47ad85e655c84259ff2030a28db6/editor-js/link"
          }
        }
      }
    },
    {
      "id": "Dra7qP78Z_",
      "type": "linkTool",
      "data": {
        "link": "https://www.npmjs.com/package/@editorjs/nested-list",
        "meta": {
          "title": "@editorjs/nested-list - npm",
          "description": "Nested list Tool for EditorJS. Latest version: 1.4.2, last published: 4 months ago. Start using @editorjs/nested-list in your project by running `npm i @editorjs/nested-list`. There are 24 other projects in the npm registry using @editorjs/nested-list.",
          "image": {
            "url": "https://static-production.npmjs.com/338e4905a2684ca96e08c7780fc68412.png"
          }
        }
      }
    }
  ],
  "version": "2.29.1"
};

        
      editorInstance = new EditorJS({

        
        holder: 'editorjs',
        autofocus: true,
        tools: {
            paragraph: {
                class: Paragraph,
                inlineToolbar: true,
            },
          header: {
            class: Header,
       
            inlineToolbar: ['link'],
            shortcut: '/'
          },
          list: {
            class: NestedList,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+L',
            config: {
                defaultStyle: 'unordered'
            },
          },
          checklist: {
            class: Checklist,
            inlineToolbar: true,
        },

        table: {
            class: Table,
            inlineToolbar: true,
            config: {
                rows: 2,
                cols: 3,
            },
        },
        alert: {
            class: Alert,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+A',
            config: {
                defaultType: 'primary',
                messagePlaceholder: 'Enter something',
            },
        },
        linkTool: {
            class: LinkTool,
            config: {
                endpoint: '/documents'
            }
        },

     
        embed: Embed,

        },

        onReady: () => {
            new DragDrop(editorInstance);
            new Undo({ editorInstance });
        },
        data: savedData
      })

    });
  
    onDestroy(() => {
      if (editorInstance) {
        editorInstance.destroy();
      }
    });


    async function saveContent() {
        try {
            
        const savedData = await editorInstance.save();
     
        console.log('Article data:', savedData);
        // Here you can also POST the savedData to your backend server
        } catch (error) {
        console.error('Saving failed:', error);
        }
    }
  </script>


  <button on:click={saveContent}>Save Content</button>
  

  
  <main>
    <div id="editorjs"></div>
  </main>


  <style >
    /* main {
      font-family: sans-serif;


    } */


/* use to style editor js components  */
    :global(body .ce-popover-item__secondary-title) {
        display: none !important;
    }
  </style>