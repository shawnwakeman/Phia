import { Node } from '@tiptap/core';

const FileNode = Node.create({
    name: 'file',

    group: 'inline',

    inline: true,

    draggable: true,


    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            filename: {
                default: null,
            },
            size: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[file-node]',
                getAttrs: dom => ({
                    src: dom.getAttribute('data-src'),
                    filename: dom.getAttribute('data-filename'),
                    size: dom.getAttribute('data-size'),
                }),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            {
                ...HTMLAttributes,
                'file-node': true,
                'data-src': HTMLAttributes.src,
                'data-filename': HTMLAttributes.filename,
                'data-size': HTMLAttributes.size,
                class: 'file-container border rounded p-2',
            },
            [
                'div',
                {},
                HTMLAttributes.filename,
            ],
            [
                'div',
                {},
                `${(HTMLAttributes.size / 1024).toFixed(2)} KB`,
            ],
            [
                'button',
                {
                    onclick: `(() => { const a = document.createElement('a'); a.href = "${HTMLAttributes.src}"; a.download = "${HTMLAttributes.filename}"; a.click(); })()`,
                    class: 'download-button',
                },
                '⬇️',
            ],
        ];
    },
});

export default FileNode;
