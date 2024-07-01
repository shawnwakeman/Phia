import { InputRule } from '@tiptap/core';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TiptapImage from '@tiptap/extension-image';
import TiptapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextStyle from '@tiptap/extension-text-style';
import TiptapUnderline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import UploadFilesPlugin  from '../plugins/upload-images.js';
import SlashCommand from './slash-command.js';
import UpdatedImage from './updated-image.js';
import FileNode from './FileNode.js';
import { SvelteCounterExtension } from './Table.js';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { all, createLowlight } from 'lowlight'
import Typography from '@tiptap/extension-typography'
import { ColorHighlighter } from './ColorHighlighter.js'
import { SmilieReplacer } from './SmilieReplacer.js'
import { Plugin, PluginKey } from 'prosemirror-state'
import {Details as details} from '@tiptap-pro/extension-details'
import DetailsContent from '@tiptap-pro/extension-details-content'
import DetailsSummary from '@tiptap-pro/extension-details-summary'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'


const lowlight = createLowlight(all)





export const defaultExtensions = [


    StarterKit.configure({
        bulletList: {
            HTMLAttributes: {
                class: 'list-disc list-outside leading-3 -mt-2'
            }
        },
        orderedList: {
            HTMLAttributes: {
                class: 'list-decimal list-outside leading-3 -mt-2'
            }
        },
        listItem: {
            HTMLAttributes: {
                class: 'leading-normal -mb-2'
            }
        },
        blockquote: {
            HTMLAttributes: {
                class: 'border-l-4 border-stone-700'
            }
        },
        codeBlock: false,
        history: false,
        code: {
            HTMLAttributes: {
                class: 'rounded-md bg-stone-200 px-1.5 py-1 font-mono font-medium text-stone-900',
                spellcheck: 'false'
            }
        },
        horizontalRule: false,
        dropcursor: {
            color: '#DBEAFE',
            width: 4
        },
   
    }),
    Typography,
    ColorHighlighter,
    SmilieReplacer,
    Table.configure({
        resizable: true,
      }),
    TableRow,
    TableHeader,
    TableCell,
    

    // patch to fix horizontal rule bug: https://github.com/ueberdosis/tiptap/pull/3859#issuecomment-1536799740
    HorizontalRule.extend({
        addInputRules() {
            return [
                new InputRule({
                    find: /^(?:---|—-|___\s|\*\*\*\s)$/,
                    handler: ({ state, range }) => {
                        const attributes = {};
                        const { tr } = state;
                        const start = range.from;
                        const end = range.to;
                        tr.insert(start - 1, this.type.create(attributes)).delete(tr.mapping.map(start), tr.mapping.map(end));
                    }
                })
            ];
        }
    }).configure({
        HTMLAttributes: {
            class: 'mt-4 mb-6 border-t border-stone-300'
        }
    }),
    
    TiptapLink.configure({
        HTMLAttributes: {
            class: 'text-stone-400 underline underline-offset-[3px] hover:text-stone-600 transition-colors cursor-pointer'
        }
    }),
    TiptapImage.extend({
        addProseMirrorPlugins() {
            return [UploadFilesPlugin ()];
        }
    }).configure({
        allowBase64: true,
        HTMLAttributes: {
            class: 'rounded-lg border border-stone-200'
        }
    }),
    UpdatedImage.configure({
        HTMLAttributes: {
            class: 'rounded-lg border border-stone-200'
        }
    }),


    Placeholder.configure({
        includeChildren: true,
        placeholder: ({ node }) => {
            if (node.type.name === 'detailsSummary') {
                return 'Summary'
              }
            if (node.type.name === 'heading') {
                return `Heading ${node.attrs.level}`;
            }
            return "Press '/' for commands.";
        },
    
    }),
    SlashCommand,
    TiptapUnderline,
    TextStyle,
    Color,
    FileNode,
    SvelteCounterExtension,
    Highlight.configure({
        multicolor: true
    }),
    TaskList.configure({
        HTMLAttributes: {
            class: 'not-prose pl-2'
        }
    }),
    TaskItem.configure({
        HTMLAttributes: {
            class: 'flex items-start my-4'
        },
        nested: true
    }),
    Markdown.configure({
        html: false,
        transformCopiedText: true
    }),
    details.configure({
        persist: true,
        HTMLAttributes: {
          class: 'details',
        },
      }),
    DetailsContent,
    DetailsSummary,
    CodeBlockLowlight.extend({
        group: 'block',
        content: 'text*',
        marks: '',
        code: true,
        defining: true,
        isolating: true,
        addNodeView() {
          return ({ node, getPos, editor }) => {
            const { view } = editor;
            const dom = document.createElement('div');
            dom.className = 'relative rounded-sm bg-stone-100 p-5 font-mono font-medium';
            dom.setAttribute('spellcheck', 'false');
      
            const select = document.createElement('select');
            select.className = 'absolute top-2 left-2 bg-white';
            select.innerHTML = `
              <option value="">auto</option>
              <option disabled>—</option>
              ${lowlight.listLanguages().map(lang => `<option value="${lang}">${lang}</option>`).join('')}
            `;
            select.value = node.attrs.language || '';
            select.addEventListener('change', (event) => {
              if (typeof getPos === 'function') {
                const pos = getPos();
                view.dispatch(view.state.tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  language: event.target.value,
                }));
                editor.commands.focus();
              }
            });
            dom.appendChild(select);
      
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.className = `language-${node.attrs.language || 'plain'}`;
            code.textContent = node.textContent;
            pre.appendChild(code);
            dom.appendChild(pre);
      
            const button = document.createElement('button');
            button.className = 'absolute top-2 right-2 text-sm bg-gray-200 px-2 py-1 rounded';
            button.textContent = 'Copy';
            button.addEventListener('click', () => {
              copy(node.textContent);
            });
            dom.appendChild(button);
      
            return {
              dom,
              contentDOM: code,
            };
          };
        },

      
      }).configure({
        lowlight,
        HTMLAttributes: {
          class: 'relative rounded-sm bg-stone-100 p-5 font-mono font-medium',
          spellcheck: 'false',
        },
          languageClassPrefix: 'language-',
         
      }),
    

];
