import { Editor, Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import tippy from 'tippy.js';
import { CheckSquare, Code, Heading1, FileImage, Minus, Table, File, ListCollapse, Heading2, Heading3, List, ListOrdered, MessageSquarePlus, Text, TextQuote } from 'lucide-svelte';
import CommandList from './CommandList.svelte';
import { showingTableEditor } from '../../../../stores';
// import { toast } from 'sonner';
// import va from '@vercel/analytics';
import { startFileUpload } from '../plugins/upload-images.js';
import { Magic } from '../../icons/index.js';

const Command = Extension.create({
    name: 'slash-command',
    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }) => {
                    props.command({ editor, range });
                }
            }
        };
    },
    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion
            })
        ];
    }
});
const getSuggestionItems = ({ query }) => {
    return [

        {
            title: 'Text',
            description: 'Just start typing with plain text.',
            searchTerms: ['p', 'paragraph'],
            icon: Text,
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleNode('paragraph', 'paragraph').run();
            }
        },
        {
            title: 'Heading 1',
            description: 'Big section heading.',
            searchTerms: ['title', 'big', 'large'],
            icon: Heading1,
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
            }
        },
        {
            title: 'Heading 2',
            description: 'Medium section heading.',
            searchTerms: ['subtitle', 'medium'],
            icon: Heading2,
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
            }
        },
        {
            title: 'Heading 3',
            description: 'Small section heading.',
            searchTerms: ['subtitle', 'small'],
            icon: Heading3,
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
            }
        },
        {
            title: 'Bullet List',
            description: 'Create a simple bullet list.',
            searchTerms: ['unordered', 'point'],
            icon: List,
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run();
            }
        },
        {
            title: 'Numbered List',
            description: 'Create a list with numbering.',
            searchTerms: ['ordered'],
            icon: ListOrdered,
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run();
            }
        },
        
        {
            title: 'To-do List',
            description: 'Track tasks with a to-do list.',
            searchTerms: ['todo', 'task', 'list', 'check', 'checkbox'],
            icon: CheckSquare,
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleTaskList().run();
            }
        },
        
       
        {
            title: 'Quote',
            description: 'Capture a quote.',
            searchTerms: ['blockquote'],
            icon: TextQuote,
            command: ({ editor, range }) => editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleNode('paragraph', 'paragraph')
                .toggleBlockquote()
                .run()
        },
        {
            title: 'Code',
            description: 'Capture a code snippet.',
            searchTerms: ['codeblock', 'language', 'snippet', 'code'],
            icon: Code,
            command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
        },
      
        {
        	title: 'Image',
        	description: 'Upload an image from your computer.',
        	searchTerms: ['photo', 'picture', 'media', 'picture', 'image'],
        	icon: FileImage,
        	command: ({ editor, range }) => {
        		editor.chain().focus().deleteRange(range).run();
        		// upload image
        		const input = document.createElement('input');
        		input.type = 'file';
        		input.accept = 'image/*';
        		input.onchange = async () => {
        			if (input.files?.length) {
        				const file = input.files[0];
        				const pos = editor.view.state.selection.from;
        				startFileUpload(file, editor.view, pos);
        			}
        		};
        		input.click();
        	}
        },
        {
        	title: 'File',
        	description: 'Upload a file from your computer.',
        	searchTerms: ['photo', 'file', 'media'],
        	icon: File,
        	command: ({ editor, range }) => {
        		editor.chain().focus().deleteRange(range).run();
        		// upload image
        		const input = document.createElement('input');
        		input.type = 'file';
        		input.accept = '*/*';
        		input.onchange = async () => {
        			if (input.files?.length) {
        				const file = input.files[0];
        				const pos = editor.view.state.selection.from;
        				startFileUpload(file, editor.view, pos);
        			}
        		};
        		input.click();
        	}
        },
        {
            title: 'Collapsable',
            description: 'Create collapsable sections.',
            searchTerms: ['collapsable', 'collapse'],
            icon: ListCollapse,
            command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setDetails().run()
        },
        {
            title: 'Divider',
            description: 'Capture a code snippet.',
            searchTerms: ['divider', 'line', 'rule'],
            icon: Minus,
            command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run()
        },
        {
            title: 'Table',
            description: 'create a table',
            searchTerms: ['table'],
            icon: Table,
            command: ({ editor, range }) => {
                showingTableEditor.set(true);
                editor.chain().focus()
                .deleteRange(range).run() // Clear the current range
               
              
               
            }
        },



    ].filter((item) => {
        if (typeof query === 'string' && query.length > 0) {
            const search = query.toLowerCase();
            return (item.title.toLowerCase().includes(search) ||
                item.description.toLowerCase().includes(search) ||
                (item.searchTerms && item.searchTerms.some((term) => term.includes(search))));
        }
        return true;
    });
};
export const updateScrollView = (container, item) => {
    const containerHeight = container.offsetHeight;
    const itemHeight = item ? item.offsetHeight : 0;
    const top = item.offsetTop;
    const bottom = top + itemHeight;
    if (top < container.scrollTop) {
        container.scrollTop -= container.scrollTop - top + 5;
    }
    else if (bottom > containerHeight + container.scrollTop) {
        container.scrollTop += bottom - containerHeight - container.scrollTop + 5;
    }
};
const renderItems = () => {
    let component = null;
    let popup = null;
    return {
        onStart: (props) => {
            // component = new SvelteRenderer(CommandList, {
            // 	props,
            // 	editor: props.editor
            // });
            // component.dom;
            const el = document.createElement('div');
            component = new CommandList({
                target: el,
                props: props
            });
            popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: el,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start'
            });
        },
        onUpdate: (props) => {
            component?.$set(props);
            popup &&
                popup[0].setProps({
                    getReferenceClientRect: props.clientRect
                });
        },
        onKeyDown: (props) => {
            if (props.event.key === 'Escape') {
                popup?.[0].hide();
                return true;
            }
            // return component?.ref?.onKeyDown(props);
        },
        onExit: () => {
            popup?.[0].destroy();
            // component?.destroy();
            component?.$destroy();
        }
    };
};
const SlashCommand = Command.configure({
    suggestion: {
        items: getSuggestionItems,
        render: renderItems
    }
});
export default SlashCommand;
