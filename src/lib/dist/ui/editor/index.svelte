<script>
	import "../../styles/index.css";
	import "../../styles/prosemirror.css";
	import "../../styles/tailwind.css";
	import { createLocalStorageStore } from "../../stores/localStorage.js";
	import { createDebouncedCallback, noop } from "../../utils.js";
	import { Editor } from "@tiptap/core";
	import * as Dialog from "$lib/components/ui/dialog";
	import ImageResizer from "./extensions/ImageResizer.svelte";
	import { onMount } from "svelte";
	import { defaultEditorContent } from "./default-content.js";
	import { defaultExtensions } from "./extensions/index.js";
	import { defaultEditorProps } from "./props.js";
	import Toasts, { addToast } from "../toasts.svelte";
	import EditorBubbleMenu from "./bubble-menu/index.svelte";
	import { supabase } from "$lib/supabaseClient";
	import { selectedNodeStore, showingTableEditor } from "../../../stores";

	import { Switch } from "$lib/components/ui/switch";
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";

    import debounce from 'debounce';
    import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
    import Collaboration from '@tiptap/extension-collaboration'
    import { SupabaseProvider } from "./y-supabase";
	import * as Y from "yjs";
    import { writable } from 'svelte/store';

    export const usersStore = writable([]);

    // doc.on('destroy', function(doc: Y.Doc))



	export let completionApi = "/api/generate";
	let className = "relative max-w-screen-lg pb-24 sm:pb-12";
	export { className as class };

	export let extensions = [];
	export let editorProps = {};
	export let debounceDuration = 750;
    let lastNode = null;

	export let editor = void 0;

	let element;



    function getRandomColor() {
        const colors = [
            '#ff8a80', '#ff5252', '#ff1744', // Reds
            '#ff80ab', '#ff4081', '#f50057', // Pinks
            '#ea80fc', '#e040fb', '#d500f9', // Purples
            '#b388ff', '#7c4dff', '#651fff', // Deep Purples
            '#8c9eff', '#536dfe', '#3d5afe', // Indigo
            '#82b1ff', '#448aff', '#2979ff', // Light Blues
            '#18ffff', '#00e5ff', '#00b8d4', // Cyan
            '#69f0ae', '#00e676', '#00c853', // Light Greens
            '#ffd740', '#ffc400', '#ffab00', // Yellows
            '#ffab91', '#ff8a65', '#ff7043'  // Oranges
        ];

        return colors[Math.floor(Math.random() * colors.length)];
    }
    let yDoc;
    let provider;
    let unsubscribe;
    let users
    let session
    let color = getRandomColor();

	onMount(() => {
        // We handle the async part inside onMount, but the return should be synchronous
        const initialize = async () => {
            try {
                // Fetch the session
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;
                session = data;

                let isFirstLoad = true;

                unsubscribe = selectedNodeStore.subscribe(async (value) => {
                    if (value && value.id) {
                        if (isFirstLoad || lastNode !== value.id) {
                            await initializeDocument(lastNode, value.id);
                            lastNode = value.id;
                            isFirstLoad = false;
                        }
                    }

          


                });
            } catch (error) {
                console.error("Error in onMount:", error);
            }

          

        };

        const cleanup = async () => {
            console.log("Cleanup");
            
            if (provider && lastNode) {
                try {
                    let exportedData = provider.persistData();
                    if (provider) provider.destroy();
                    provider = null;

                    if (!exportedData) {
                        console.warn("No data to persist for node", lastNode);
                    }

                    await supabase
                        .from('summaries')
                        .upsert({
                            'node_id': lastNode.toString(),
                            'summary': exportedData,
                        }, { onConflict: 'node_id' });
                } catch (error) {
                    console.error("Error during cleanup:", error);
                }
            }
        };
        // Call the async initialization
        initialize();

        // Return the cleanup function synchronously
        window.addEventListener('beforeunload', cleanup);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
            if (provider) provider.pauseRealtime();
            
        } else {
            // Optionally reinitialize anything necessary when visibility changes back to 'visible'
          
            if (provider) provider.resumeRealtime();
      
            
        }
        });

        // Return the cleanup function synchronously
        return () => {
            if (unsubscribe) unsubscribe();
            window.removeEventListener('beforeunload', cleanup);
            window.removeEventListener('pagehide', cleanup);
            document.removeEventListener('visibilitychange', cleanup);
        };
    });



    function updateLabelPosition(cursor, label) {
    const cursorRect = cursor.getBoundingClientRect();
    const editorRect = editor.view.dom.getBoundingClientRect();

    // Set the position of the label above the cursor
    label.style.position = 'absolute';
    label.style.top = `${cursorRect.top - editorRect.top - label.offsetHeight}px`;
    label.style.left = `${cursorRect.left - editorRect.left}px`;
    label.style.zIndex = '1000'; // Ensure it's above everything
    label.style.pointerEvents = 'none'; // Prevent interaction with the label
    }

	function initializeEditor() {

		editor = new Editor({
			element,


			extensions: [
				...defaultExtensions,
				...extensions,
                CollaborationCursor.configure({
                    provider,
                    user: {
                    name: session ? session.session.user.user_metadata.name.split(' ')[0] : 'Anonymous',
                    color: color,
           
                    },
                    render: user => {
                      const cursor = document.createElement('span')
                      cursor.classList.add('collaboration-cursor__caret')
                      cursor.setAttribute('style', `border-color: ${user.color}`)
                                        
                   
                      return cursor
                     }
                }),
				Collaboration.configure({
					document: yDoc, // Configure Y.Doc for collaboration
				}),
               
			],
			editorProps: {
				...defaultEditorProps,
				...editorProps,
			},

			autofocus: false,
		});
	}


    async function initializeDocument(lastNode, nodeId) {
    try {
        // Persist the current document if a provider and lastNode exist
        if (provider && lastNode) {
            console.log("Switching document from", lastNode, "to", nodeId);
            
            let exportedData = provider.persistData();
            if (provider) provider.destroy();
            provider = null
            if (!exportedData) {
                console.warn("No data to persist for node", lastNode);
                return;
            }

            await supabase
                .from('summaries')
                .upsert({
                    'node_id': lastNode.toString(),
                    'summary': exportedData,
                }, { onConflict: 'node_id' });
        }
  


        // Create a new Y.Doc and provider
        yDoc = new Y.Doc();
        provider = new SupabaseProvider(supabase, {
            name: nodeId.toString(),
            document: yDoc,
            userData: {
                name: session ? session.session.user.user_metadata.name.split(' ')[0] : 'Anonymous',
                color: color,
            },
            databaseDetails: {
                schema: 'public',
                table: 'summaries',
                updateColumns: { name: 'node_id', content: 'summary' },
                conflictColumns: 'node_id',
            },
        });
        provider.on('users-update', (status) => {
            const usersArray = Object.values(status).flat();

            usersStore.set(usersArray);

   

        });
        // Reinitialize the editor with the new document
        if (editor) {
            editor.destroy();
        }
        initializeEditor();

    } catch (error) {
        console.error("Error in switchDocument:", error);
    }
}
	
	let rows = 3;
	let columns = 3;
	let headerRow = false;

	function createTable() {
		rows = Math.max(0, Math.min(100, rows));
		columns = Math.max(0, Math.min(100, columns));

		editor
			.chain()
			.focus()

			.insertTable({ rows: rows, cols: columns, withHeaderRow: headerRow }) // Insert the table at the original position
			.run();

		showingTableEditor.set(false);
		// Your logic to create the table using rows, columns, and headerRow
	}

	function handleKeyDown(event) {
		if (event.key === "Enter") {
			createTable();
		}
	}
</script>


<!-- <ul>
    {#each $usersStore as user}
        <li>{user.userData.name} - {user.userData.color}</li>
    {/each}
</ul> -->


{#if editor && editor.isEditable}
	<EditorBubbleMenu {editor} />
{/if}

<div id="editor" class="{className}" bind:this="{element}">
	<slot />
	{#if editor?.isActive("image")}
		<ImageResizer {editor} />
	{/if}
</div>

<Toasts />

<Dialog.Root open="{$showingTableEditor}">
	<Dialog.Content class="max-w-lg h-56 feature-container">
		<Dialog.Header>
			<Dialog.Title>Create Table</Dialog.Title>
			<div class="flex flex-col space-between">
				<div class="flex w-full my-3">
					<div class="flex-1 mx-2">
						<label for="rows">Rows</label>
						<div class="input-container border" id="rows">
							<input
								type="number"
								class="custom-number-input"
								max="10"
								min="0"
								step="1"
								bind:value="{rows}"
								on:keydown="{handleKeyDown}"
							/>
						</div>
					</div>

					<div class="flex-1 mx-2">
						<label for="columns">Columns</label>
						<div class="input-container border" id="columns">
							<input
								type="number"
								class="custom-number-input"
								max="10"
								min="0"
								step="1"
								bind:value="{columns}"
								on:keydown="{handleKeyDown}"
							/>
						</div>
					</div>
				</div>

				<div class="flex w-full justify-between items-center my-3">
					<div class="flex flex-col ml-2">
						<Switch bind:checked="{headerRow}" />
						<Label class="ml-1" for="headerRowSwitch">Header Row</Label>
					</div>

					<Button on:click="{createTable}">Create Table</Button>
				</div>
			</div>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>

<style>
	input[type="number"]::-webkit-outer-spin-button,
	input[type="number"]::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type="number"] {
		-moz-appearance: textfield; /* Hide the arrows in Firefox */
	}

	.input-container {
		display: flex;
		align-items: center;

		padding: 5px;
		border-radius: 8px;
	}

	.input-container:focus-within {
		border: 1px solid white; /* Change border color when the input is focused */
	}

	.custom-number-input {
		color: white;
		font-size: 18px; /* Bigger number */
		border: none; /* Remove default input border */
		margin-left: 5px;
		flex-grow: 1;
		padding-right: 5px;
		outline: none; /* Remove default outline */
	}

	.input-label {
		color: darkgrey;
		font-size: 14px;
		line-height: 24px; /* Match the font size of the number input */
		margin-right: 5px;
	}
</style>
