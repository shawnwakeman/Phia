<script>
    import { onMount, onDestroy } from 'svelte';
  
    let editorInstance;
  


    onMount(async () => {
      // Dynamically import Editor.js to ensure it's only loaded client-side
      const EditorJS = (await import('@editorjs/editorjs')).default;
      const Header = (await import('@editorjs/header')).default;
      const DragDrop = (await import('editorjs-drag-drop')).default;
      const NestedList  = (await import('@editorjs/nested-list')).default;
      const Checklist = (await import('@editorjs/checklist')).default;
   
      const Alert  = (await import('editorjs-alert')).default;
      const Table   = (await import('@editorjs/table')).default;
      const Undo    = (await import('editorjs-undo')).default;
      const savedData = {
        "time": 1711602401164,
        "blocks": [
            {
            "id": "ZIByANQSy9",
            "type": "paragraph",
            "data": {
                "text": "shawn wakeman<br>"
            }
            },
            {
            "id": "RvQCXSVykZ",
            "type": "paragraph",
            "data": {
                "text": "jashdasd"
            }
            },
            {
            "id": "_jydlR_jqa",
            "type": "paragraph",
            "data": {
                "text": "asdlajshd"
            }
            },
            {
            "id": "PDREjYnOaK",
            "type": "paragraph",
            "data": {
                "text": "asdjhahsd"
            }
            }
        ],
        "version": "2.29.1"
        };
      editorInstance = new EditorJS({

        
        holder: 'editorjs',
        autofocus: true,
        tools: {
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


          
        },

        onReady: () => {
            new DragDrop(editorInstance);
            new Undo({ editorInstance });
        },
        // data: savedData
      });


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
    main {
      font-family: sans-serif;


    }


/* use to style editor js components  */
    :global(body .ce-popover-item__secondary-title) {
        display: none !important;
    }
  </style>