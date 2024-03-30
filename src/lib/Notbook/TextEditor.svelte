<script>
    import { onMount, onDestroy } from 'svelte';
  
    let editorInstance;
  



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
        MermaidTool,
        Strikethrough,
        Marker,
        Delimiter,
        ToggleBlock,
        CodeBox,
        SimpleImage,
        LinkAutocomplete,
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
        import('editorjs-mermaid').then(module => module.default),
        import('@sotaproject/strikethrough').then(module => module.default),
        import('@editorjs/marker').then(module => module.default),
        import('@editorjs/delimiter').then(module => module.default),
        import('editorjs-toggle-block').then(module => module.default),
        import('@bomdi/codebox').then(module => module.default),
        import('@editorjs/simple-image').then(module => module.default),
        import('@editorjs/link-autocomplete').then(module => module.default),
    ]);
    
      const savedData = {
  "time": 1711769155440,
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
    },
    {
      "id": "fJfRkKPEc-",
      "type": "paragraph",
      "data": {
        "text": "<a href=\"https://codex.so/editor\" data-name=\"The first item\" data-description=\"Description for the first item\">shawn</a><br>"
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
          image: SimpleImage,
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
        link: {
        class: LinkAutocomplete,
        config: {
            endpoint: '/subdoc',
            queryParam: 'search'
        }
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

        mermaid: MermaidTool,
        embed: Embed,
 
        codeBox: {
            class: CodeBox,
            config: {
            themeURL: 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.18.1/build/styles/dracula.min.css', // Optional
            themeName: 'atom-one-dark', // Optional
            useDefaultTheme: 'light' // Optional. This also determines the background color of the language select drop-down
            }

    
        },

        },
       
        onReady: () => {
            new Undo({ editorInstance });
            new DragDrop(editorInstance);
           
            MermaidTool.config({ 'theme': 'neutral' })
        },

        onChange: () => {
            editorInstance.save().then((outputData) => {
                parseLinks(outputData);
            });
        },

        
        data: savedData
      })
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


    /* main {
      font-family: sans-serif;


    } */


/* use to style editor js components  */
    :global(body .ce-popover-item__secondary-title) {
        display: none !important;
    }
</style>