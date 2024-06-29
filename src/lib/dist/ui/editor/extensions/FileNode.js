import { Node } from '@tiptap/core';

const FileNode = Node.create({
    name: 'file',

    group: 'block', // Changed from 'inline' to 'block'

    selectable: true,

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
                contenteditable: "false",
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
                    onclick: `(() => {
                        fetch("${HTMLAttributes.src}")
                            .then(response => response.blob())
                            .then(blob => {
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.style.display = 'none';
                                a.href = url;
                                a.download = "${HTMLAttributes.filename}";
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                            })
                            .catch(() => alert('Failed to download file.'));
                    })()`,
                    class: 'download-button',
                },
                '⬇️',
            ],
        ];
    },

    addNodeView() {
        return ({ node, getPos, editor }) => {
            const dom = document.createElement('div');
            dom.className = 'file-container border rounded p-2';
            dom.setAttribute('file-node', 'true');
            dom.setAttribute('data-src', node.attrs.src);
            dom.setAttribute('data-filename', node.attrs.filename);
            dom.setAttribute('data-size', node.attrs.size);
            dom.setAttribute('contenteditable', 'false');

            const filenameDiv = document.createElement('div');
            filenameDiv.textContent = node.attrs.filename;
            dom.appendChild(filenameDiv);

            const sizeDiv = document.createElement('div');
            sizeDiv.textContent = `${(node.attrs.size / 1024).toFixed(2)} KB`;
            dom.appendChild(sizeDiv);

            const button = document.createElement('button');
            button.className = 'download-button';
            button.innerHTML = '⬇️';
            button.onclick = () => {
                fetch(node.attrs.src)
                    .then(response => response.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        a.download = node.attrs.filename;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                    })
                    .catch(() => alert('Failed to download file.'));
            };
            dom.appendChild(button);

            const updateSelection = () => {
                const { from, to } = editor.view.state.selection;
                const isSelected = from <= getPos() && to >= getPos() + node.nodeSize;
                dom.classList.toggle('selected', isSelected);
            };

            // Initial selection update
            updateSelection();

            // Listen for selection updates
            editor.on('selectionUpdate', updateSelection);

            return {
                dom,
                update: (updatedNode) => {
                    if (updatedNode.type !== node.type) {
                        return false;
                    }

                    if (updatedNode.attrs.src !== node.attrs.src) {
                        dom.setAttribute('data-src', updatedNode.attrs.src);
                    }
                    if (updatedNode.attrs.filename !== node.attrs.filename) {
                        filenameDiv.textContent = updatedNode.attrs.filename;
                        dom.setAttribute('data-filename', updatedNode.attrs.filename);
                    }
                    if (updatedNode.attrs.size !== node.attrs.size) {
                        sizeDiv.textContent = `${(updatedNode.attrs.size / 1024).toFixed(2)} KB`;
                        dom.setAttribute('data-size', updatedNode.attrs.size);
                    }

                    updateSelection();
                    return true;
                },
                selectNode: () => {
                    dom.classList.add('selected');
                },
                deselectNode: () => {
                    dom.classList.remove('selected');
                },
                destroy: () => {
                    editor.off('selectionUpdate', updateSelection);
                }
            };
        };
    },

});

export default FileNode;
