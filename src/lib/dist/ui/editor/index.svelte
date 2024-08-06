<script>
	import "../../styles/index.css";
	import "../../styles/prosemirror.css";
	import "../../styles/tailwind.css";
	import { getPrevText } from "../../editor.js";
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
	import { supabase, fetchSummary, saveSummary, saveSummaryChanges } from "$lib/supabaseClient";
	import { selectedNodeStore, showingTableEditor } from "../../../stores";
	import { get } from "svelte/store";
	import { create, diff, patch } from "jsondiffpatch";
	import { v4 as uuidv4 } from "uuid";
	import { Switch } from "$lib/components/ui/switch";
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	export let completionApi = "/api/generate";
	let className = "relative max-w-screen-lg pb-24 sm:pb-12";
	export { className as class };
	export let defaultValue = defaultEditorContent;
	export let extensions = [];
	export let editorProps = {};
	export let onUpdate = noop;
	export let onDebouncedUpdate = noop;
	export let debounceDuration = 750;
	export let storageKey = "novel__content";
	export let disableLocalStorage = true;
	export let editor = void 0;

	let element;

	let unsubscribe; // To store the unsubscribe function for the Supabase channel

	const diffpatcher = create();
	let lastSentState = null;
	let sessionId = uuidv4();

	const content = createLocalStorageStore(storageKey, defaultValue);
	let hydrated = false;
	$: if (editor && !hydrated) {
		const value = disableLocalStorage ? defaultValue : $content;
		if (value) {
			// editor.commands.setContent(value);
		}
		hydrated = true;
	}

	const debouncedUpdates = createDebouncedCallback(async ({ editor: editor2 }) => {
		if (!disableLocalStorage) {
			const json = editor2.getJSON();
			content.set(json);
		}
		if (selectedNodeStore) {
		
			await saveSummary($selectedNodeStore.id, editor2.getJSON(), sessionId, "summaries");
		}

		onDebouncedUpdate(editor2);
	}, debounceDuration);

	let prevoiusId = 0;
	onMount(() => {
		initializeEditor();
		// Subscribe to changes in the selectedNodeStore

	
		selectedNodeStore.subscribe(async (value) => {
			const documentid = value.id;
			if (editor) {
				if (prevoiusId !== 0) {
					await saveSummary(prevoiusId, editor.getJSON(), sessionId, "summaries");
				}

				const summary = await fetchSummary(value.id, "summaries");
				editor.commands.setContent(summary);
				updateEditorSubscription(documentid);
				prevoiusId = value.id;
			}
		});
		return () => {
			if (editor) editor.destroy();
			if (unsubscribe) unsubscribe(); // Clean up the Supabase subscription
		};
	});

	function initializeEditor() {
		editor = new Editor({
			element,
			onTransaction: () => {
				editor = editor;
			},

			extensions: [...defaultExtensions, ...extensions],
			editorProps: {
				...defaultEditorProps,
				...editorProps,
			},
			onUpdate: async (e) => {
				const currentState = editor.getJSON();
				const changes = diff(lastSentState, currentState);
				if (changes) {
					await saveSummaryChanges(
						$selectedNodeStore.id,
						changes,
						sessionId,
						"summaries"
					);
					lastSentState = currentState;
				}

				onUpdate(e.editor);
				debouncedUpdates(e);

				// Update Supabase with new content
			},
			autofocus: "end",
		});
	}

	function updateEditorSubscription(documentid) {
		if (unsubscribe) unsubscribe(); // Unsubscribe from the previous channel if exists

		// Subscribe to changes in Supabase
		const channel = supabase
			.channel("custom-filter-channel")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "summaries",
					filter: `node_id=eq.${documentid}`,
				},
				(payload) => {
                    if (payload.new.sessionID !== sessionId) {
                    console.log("Applying changes to editor content");

                    // Save the current cursor position
                    const currentPos = editor.view.state.selection;

                    const currentContent = editor.getJSON();
                    const updatedContent = patch(currentContent, payload.new.changes);
                    
                    editor.commands.setContent(updatedContent);

                    // Restore the cursor position
                    editor.view.dispatch(
                        editor.view.state.tr.setSelection(currentPos)
                    );
                }
				}
			)
			.subscribe();

		unsubscribe = () => {
			channel.unsubscribe();
		};
	}

    let rows = 3;
    let columns = 3;
    let headerRow = false;

    function createTable() {
        rows = Math.max(0, Math.min(100, rows));
        columns = Math.max(0, Math.min(100, columns));
        

        editor.chain().focus()
          
       
            .insertTable({ rows: rows, cols: columns, withHeaderRow: headerRow }) // Insert the table at the original position
            .run();

            showingTableEditor.set(false);
        // Your logic to create the table using rows, columns, and headerRow
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            createTable();
        }
    }
</script>

<div>
	<div id="editor" bind:this="{element}"></div>
</div>

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

<Dialog.Root open={$showingTableEditor}>
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
                                bind:value={rows}
                                on:keydown={handleKeyDown}
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
                                bind:value={columns}
                                on:keydown={handleKeyDown}
                            />
                        </div>
                    </div>
                </div>

                <div class="flex w-full justify-between items-center my-3">
                    <div class="flex flex-col ml-2">
                        <Switch bind:checked={headerRow} />
                        <label class="ml-1" for="headerRowSwitch">Header Row</label>
                    </div>

                    <Button on:click={createTable}>Create Table</Button>
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
