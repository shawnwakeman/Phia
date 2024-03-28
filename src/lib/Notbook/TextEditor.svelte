<script>
    import { onMount, onDestroy } from 'svelte';
  
    let editorInstance;
  


    onMount(async () => {
      // Dynamically import Editor.js to ensure it's only loaded client-side
      const EditorJS = (await import('@editorjs/editorjs')).default;
      const Header = (await import('@editorjs/header')).default;
      const List = (await import('@editorjs/list')).default;
      const DragDrop = (await import('editorjs-drag-drop')).default;
      


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

        tools: {
          header: {
            class: Header,
            inlineToolbar: ['link'],
            shortcut: '/'
          },
          list: {
            class: List,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+L'
          },


          
        },

        onReady: () => {
            new DragDrop(editorInstance);
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
  
  <div id="editorjs"></div>
  <button on:click={saveContent}>Save Content</button>
  
  <h1>1</h1>
<h2>1</h2>
