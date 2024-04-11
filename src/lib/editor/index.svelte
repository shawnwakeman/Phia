<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { Editor } from '@tiptap/core';



    import Highlight from '@tiptap/extension-highlight'

    import StarterKit from '@tiptap/starter-kit';
    import Typography from '@tiptap/extension-typography';
    import TaskList from '@tiptap/extension-task-list';
    import TaskItem from '@tiptap/extension-task-item';
    import TextAlign from '@tiptap/extension-text-align';
    import Placeholder from '@tiptap/extension-placeholder';
    import Image from '@tiptap/extension-image';
    import Link from '@tiptap/extension-link';
    import suggestion from './extensions/suggestion';
    import Slash from './extensions/slash-command';
    import BulletList from '@tiptap/extension-bullet-list'
    import OrderedList from '@tiptap/extension-ordered-list'
    import ListItem from '@tiptap/extension-list-item'

    import BubbleMenu from '@tiptap/extension-bubble-menu'


	let element;
    let component;
    let editor;
    let bubbleMenuRef;

    let editorElement;
	$: editorElement = editor ? editor.options.element : undefined;

	function newYdoc() {
		if (!browser) return;

		if (!element) return;

		const extensions = [
            StarterKit,

            Slash.configure({
                suggestion
            }),
            Highlight,
            Typography,
            TaskList,
            TaskItem,
            TextAlign,
            Placeholder,
            Image,
            Link,
            BulletList,
            OrderedList,
            ListItem,
            BubbleMenu.configure({
                element: bubbleMenuRef,
                tippyOptions: {
                    duration: 100,
                    theme: 'light-border',
                    maxWidth: 'none',
                },
            }),

		];


		element.innerHTML = '';
		editor = new Editor({
			element,
			editorProps: {
				attributes: {
					'data-editor': 'true',
					class: 'focus:outline-none flex flex-col items-stretch'
				}
			},
			extensions,
            content: `
            <p>
                Hey, try to select some text here. There will popup a menu for selecting some inline styles. Remember: you have full control about content and styling of this menu.
            </p>
            `,
            
			onTransaction: () => {
				editor = editor;
			}
		});
		component.$set({ content_editor: editor });
	}

	onMount(async () => {
		newYdoc();
	});

    


	onDestroy(() => {
		if (component) component.$destroy();
		if (editor) editor.destroy();
	});


    function toggleBold() {
    editor.chain().focus().toggleBold().run();
    }

    function toggleItalic() {
        editor.chain().focus().toggleItalic().run();
    }

    function toggleStrike() {
        editor.chain().focus().toggleStrike().run();
    }
</script>



<div class="loading relative prose prose-lg prose-gray">
	<div bind:this={element} />
</div>


<style>

    :global(.tiptap p) {
        color: red;
    }
	:global(.tiptap h1, h2, h3, h4, h5, h6, p, ul, li) {
		width: 100%;
        color: red;
	}
    :global(.tiptap ol) {
    padding: 0 1rem;
    }

    :global(.tiptap ol) {
        list-style-type: decimal; /* 1, 2, 3 */
        padding: 0 1rem;
        padding-left: 40px; /* Increase base indentation */
        }

        /* First level of nesting */
        :global(.tiptap ol ol) {
        list-style-type: lower-alpha; /* a, b, c */
        }

        /* Second level of nesting */
        :global(.tiptap ol ol ol) {
        list-style-type: lower-roman; /* i, ii, iii */
        }

        /* Repeating the cycle - Third level of nesting (back to decimal) */
        :global(.tiptap ol ol ol ol) {
        list-style-type: decimal; /* 1, 2, 3 */
        }

        /* Fourth level of nesting (back to lower-alpha) */
        :global(.tiptap ol ol ol ol ol) {
        list-style-type: lower-alpha; /* a, b, c */
        }

        /* Fifth level of nesting (back to lower-roman) */
        :global(.tiptap ol ol ol ol ol ol) {
        list-style-type: lower-roman; /* i, ii, iii */
        }
        :global(.tiptap ol ol ol ol ol ol) {
        list-style-type: decimal; /* i, ii, iii */
        }
    /* Assuming existing unordered list styles */
    :global(.tiptap ul) {
    padding: 0 1rem;
    padding-left: 40px; /* Increase base indentation */
    }

    :global(.tiptap ul) {
    list-style-type: disc; /* Default bullet style for top level */
  
    }
  
    /* Level 2 - First level of nesting */
    :global(.tiptap ul ul) {
        list-style-type: circle; /* Different bullet style for first level of nesting */
    }
    
    /* Level 3 - Second level of nesting */
    :global(.tiptap ul ul ul) {
        list-style-type: square; /* Different bullet style for second level of nesting */
    }

    :global(.tiptap ul ul ul ul) {
        list-style-type: disc; /* 1, 2, 3 */
    }

        /* Fourth level of nesting (back to lower-alpha) */
    :global(.tiptap ul ul ul ul ul) {
        list-style-type: circle; /* a, b, c */
    }

        /* Fifth level of nesting (back to lower-roman) */
    :global(.tiptap ul ul ul ul ul ul) {
        list-style-type: square; /* i, ii, iii */
    }
        :global(.tiptap ul ul ul ul ul ul ul) {
        list-style-type: disc; /* i, ii, iii */
    }


	:global(.ProseMirror) {
		position: static !important;
	}
	:global(.ProseMirror p.is-empty::before) {
		content: "Type '/' for commands";
		color: #adb5bd;
		float: left;
		height: 0;
	}
	:global(.loading) {
		animation: fadeIn 0.15s;
	}

	@keyframes fadeIn {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
	:global(.ProseMirror h1.is-empty::before) {
		content: 'Heading 1';
		color: #adb5bd;
		float: left;
		height: 0;
	}
	:global(.ProseMirror h2.is-empty::before) {
		content: 'Heading 2';
		color: #adb5bd;
		float: left;
		height: 0;
	}
	:global(.ProseMirror h3.is-empty::before) {
		content: 'Heading 3';
		color: #adb5bd;
		float: left;
		height: 0;
	}
	:global(.ProseMirror h4.is-empty::before) {
		content: 'Heading 4';
		color: #adb5bd;
		float: left;
		height: 0;
	}
	:global(.ProseMirror h5.is-empty::before) {
		content: 'Heading 5';
		color: #adb5bd;
		float: left;
		height: 0;
	}
	:global(.ProseMirror h6.is-empty::before) {
		content: 'Heading 6';
		color: #adb5bd;
		float: left;
		height: 0;
	}
	:global(.ProseMirror p) {
		margin-top: 0px;
	}
	:global(ul[data-type='taskList']) {
		list-style: none;
		padding-left: 2px;
	}
	:global(ul[data-type='taskList'] li) {
		display: flex;
		align-items: top;
	}
	:global(ul[data-type='taskList'] li label) {
		padding-right: 12px;
	}
	:global(ul, ol) {
		margin-top: 0px !important;
	}
	:global(li p, li p) {
		margin-top: 0px !important;
		margin-bottom: 4px !important;
	}

	:global(ul[data-type='taskList'] li label input) {
		border-radius: 0.25rem;
		border-color: #cbd5e1;
	}
	:global(.max-width-content) {
		max-width: var(--content-width);
	}
	:global(ul[data-type='taskList'] li div) {
		margin-bottom: 0;
	}

	:global(span.collaboration-cursor__caret.ProseMirror-widget) {
		position: relative;
		border: 1px solid;
	}

	:global(.collaboration-cursor__label) {
		position: absolute;
		top: -20px;
		left: -1px;
		font-weight: 400;
		font-size: 15px;
		line-height: 20px;
		padding: 0px 7px;
		width: 126px;
	}
</style>
