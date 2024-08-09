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
        '#b0bec5', '#78909c', '#546e7a', // Greys
        '#a5d6a7', '#81c784', '#66bb6a', // Greens
        '#90caf9', '#64b5f6', '#42a5f5'  // Blues
    ];
    return colors[Math.floor(Math.random() * colors.length)];
    }
    let yDoc;
    let provider;
    let unsubscribe;

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

          
            window.addEventListener('beforeunload', async (event) => {

            
                if (provider && lastNode) {
             

                    try {
                        let exportedData = provider.persistData();
                        if (provider) provider.destroy();
                        provider = null;

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
                    } catch (error) {
                        console.error("Error during beforeunload:", error);
                    }
                }
            });
        };

        // Call the async initialization
        initialize();

        // Return the cleanup function synchronously
        return () => {
            if (editor) editor.destroy();
            if (unsubscribe) unsubscribe();
            if (provider) provider.destroy();
        };
    });





	function initializeEditor() {

		editor = new Editor({
			element,


			extensions: [
				...defaultExtensions,
				...extensions,
				Collaboration.configure({
					document: yDoc, // Configure Y.Doc for collaboration
				}),
                CollaborationCursor.configure({
                    provider,
                    user: {
                    name: session ? session.session.user.user_metadata.name.split(' ')[0] : 'Anonymous',
                    color: color,
                    },
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
            databaseDetails: {
                schema: 'public',
                table: 'summaries',
                updateColumns: { name: 'node_id', content: 'summary' },
                conflictColumns: 'node_id',
            },
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
