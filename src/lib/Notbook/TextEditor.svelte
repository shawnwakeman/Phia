<script>
    import { onMount, onDestroy } from 'svelte';
  
    let editorInstance;
  
  
    let embedTool;
    let minWidth = '320px';
    
    // Initial minWidth, can adjust based on your needs


    onMount(async () => {

  
      // Dynamically import Editor.js to ensure it's only loaded client-side
      const [
        EditorJS,
        Paragraph,
        Header,
        DragDrop,
        NestedList,
        Checklist,
        Alert,
        Table,
        Undo,
        LinkTool,
        Embed,
        Underline,
        InlineCode,
        Strikethrough,
        Marker,
        Delimiter,
        ToggleBlock,
        CodeTool,
        SimpleImage,

    ] = await Promise.all([
        import('@editorjs/editorjs').then(module => module.default),
        import('@editorjs/paragraph').then(module => module.default),
        import('@editorjs/header').then(module => module.default),
        import('editorjs-drag-drop').then(module => module.default),
        import('@editorjs/nested-list').then(module => module.default),
        import('@editorjs/checklist').then(module => module.default),
        import('editorjs-alert').then(module => module.default),
        import('@editorjs/table').then(module => module.default),
        import('editorjs-undo').then(module => module.default),
        import('@editorjs/link').then(module => module.default),
        import('@editorjs/embed').then(module => module.default),
        import('@editorjs/underline').then(module => module.default),
        import('@editorjs/inline-code').then(module => module.default),
        import('@sotaproject/strikethrough').then(module => module.default),
        import('@editorjs/marker').then(module => module.default),
        import('@editorjs/delimiter').then(module => module.default),
        import('editorjs-toggle-block').then(module => module.default),
        import('@editorjs/code').then(module => module.default),
        import('@editorjs/simple-image').then(module => module.default),

    ]);


    
      const savedData = {
        "time": 1712253724375,
        "blocks": [
            {
            "id": "8hCxtHVM3J",
            "type": "embed",
            "data": {
                "service": "excalidraw",
                "source": "https://excalidraw.com/",
                "embed": "https://excalidraw.com/?height=500&theme-id=0&default-tab=css,result&embed-version=2",
                "width": 1000,
                "height": 500,
                "caption": ""
            }
            }
        ],
        "version": "2.29.1"
        };
 // This will hold our resizable element


 let column_tools = {
    header: Header,
    alert : Alert,
    paragraph : Paragraph,
    delimiter : Delimiter
}
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
            shortcut: '/',

            config: {
                defaultLevel: 1
            }
          },
          image: SimpleImage,
          list: {
            class: NestedList,
            inlineToolbar: true,
          
            config: {
                defaultStyle: 'unordered'
            },
          },
          
          checklist: {
            class: Checklist,
            inlineToolbar: true,
        },



        underline: Underline,
        strikethrough: Strikethrough,
        delimiter: Delimiter,
        table: {
            class: Table,
            inlineToolbar: true,
            config: {
                rows: 2,
                cols: 3,
            },
        },
        Marker: {
            class: Marker,
            shortcut: 'CMD+SHIFT+M',
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

        toggle: {
            class: ToggleBlock,
            inlineToolbar: true,
        },

        inlineCode: {
            class: InlineCode,
            shortcut: 'CMD+SHIFT+M',
        },


        embed: {
            class: Embed,
           
            config: {
                services: {

                    codepen: {
                        regex: /https?:\/\/codepen.io\/([^\/\?\&]*)\/pen\/([^\/\?\&]*)/,
                        embedUrl: 'https://codepen.io/<%= remote_id %>?height=500&theme-id=0&default-tab=css,result&embed-version=2',
                        html: "<iframe style='width: 100%; height: 100%; min-height: 300px; min-width: 1000px;' scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true'></iframe>",

                        id: (groups) => groups.join('/embed/')
                    },
                    excalidraw: {
                        regex: /https?:\/\/excalidraw.com\/([^\/\?\&]*)/,
                        embedUrl: 'https://excalidraw.com/<%= remote_id %>?height=500&theme-id=0&default-tab=css,result&embed-version=2',
                        html: "<iframe style='width: 100%; height: 100%; min-height: 300px; min-width: 320px;' scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true'></iframe>",
                        height: 500,
                        width: 1000,
                        id: (groups) => groups.join('/embed/')
                    },
                    ysoutube: {
                        regex: /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^\/\?\&]*)/,
                        embedUrl: 'https://www.youtube.com/embed/<%= video_id %>?autoplay=0',
                        html: "<iframe style='width: 553px; height: 320px; min-height: 300px; min-width: 500px;' src='<%= embedUrl %>' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>",

                        height: 500,
                        width: 1000,
                        id: (groups) => groups.join('/embed/')
                    }
                }   
            },


            
        },
 
        code: CodeTool,

    
    
        },
       
        onReady: () => {
            new Undo({ editorInstance });
            new DragDrop(editorInstance);
           
      
        },

        onChange: () => {
            editorInstance.save().then((outputData) => {
                parseLinks(outputData);
            });
        },

        
        data: savedData
      })

      const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        minWidth = `${width}px`;
        }
        });

        resizeObserver.observe(embedTool);
      const links = document.querySelectorAll('a[data-name]');

        // Loop through each link and change its color
        links.forEach(link => {
        link.style.color = 'red'; // Change 'red' to any color you prefer
        });
    });
  
    onDestroy(() => {
      if (editorInstance) {
        editorInstance.destroy();
      }


        



    });

    async function parseLinks(data) {
  // Helper function to extract <a> tags from text
  // Define a helper function to extract <a> tags from text
        const extractATags = (text) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        return Array.from(doc.querySelectorAll('a')).map(a => a.href);
    };

    const links = [];

    for (const block of data.blocks) {
        if (block.type === 'paragraph' && block.data.text.includes('<a')) {
        // Extract <a> tags from paragraph block
        const aTags = extractATags(block.data.text);
        links.push(...aTags);
        }
    }

    // Log all found links
    console.log('Found links:', links);
    }
    function generateRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }

        return color;
    }

    async function saveContent() {

    const styleElement = document.createElement('style');
    document.head.appendChild(styleElement);
    const links = document.querySelectorAll('a[data-name]');


    links.forEach((link, index) => {
  // Generate a random color for each link
        const color = generateRandomColor();
        // Create a unique class name for this color
        const className = `custom-link-color-${index}`;
        // Insert a new CSS rule for this class in the style element
        styleElement.sheet.insertRule(`.${className} { color: ${color}; }`, styleElement.sheet.cssRules.length);
        // Apply the newly created class to the link
        link.classList.add(className);
    });
    const startTime = performance.now(); // Start timing

    try {
        const savedData = await editorInstance.save();
        console.log('Article data:', savedData);
        // Here you can also POST the savedData to your backend server
    } catch (error) {
        console.error('Saving failed:', error);
    } finally {
        const endTime = performance.now(); // End timing
        console.log(`saveContent took ${endTime - startTime} milliseconds`);
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
        width: 100%;    
        padding-bottom: 500px;
    }


/* use to style editor js components  */



    :global( .embed-tool) {
 
        overflow: hidden;
        resize: both;
        min-height: 300px; /* Initial minimum height */
        min-width: 320px;
        margin: auto;
        padding: 10px;
        background: #eee;
        border: 1px solid gray;
        box-sizing: border-box; 
        width: 80%;/* Include padding and border in the element's total width and height */
        height: 33vh;/* Include padding and border in the element's total width and height */
        max-width: 100%;
        max-height: 90vh;
    }


    
    :global(.ce-block__content),
    :global(.ce-toolbar__content) {
        max-width: 70%;
        

    }

    :global(.ce-toolbar__content iframe ) {
        max-width: 70%;
        

    }

    :global(body .toggle-block__selector ) {
        display: flex; /* Establishes a flex container */
        align-items: center; /* Aligns flex items (children) vertically in the center */
        gap: 10px; /* Optional: adds space between the icon and the title */
    }






   

    :global(body .cdx-input) {
        display: none !important;
    }
    :global(body .ce-inline-tool--link) {
        display: none !important;
    }

    :global(body .ce-popover-item__secondary-title) {
        display: none !important;
    }
</style>