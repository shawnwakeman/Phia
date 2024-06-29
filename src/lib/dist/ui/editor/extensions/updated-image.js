import Image from '@tiptap/extension-image';

const UpdatedImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
            },
            height: {
                default: null,
            },
        };
    },

    addNodeView() {
        return ({ node, getPos, editor }) => {
            const img = document.createElement('img');
            img.src = node.attrs.src;
            if (node.attrs.width) {
                img.style.width = node.attrs.width;
            }
            if (node.attrs.height) {
                img.style.height = node.attrs.height;
            }

            const updateSelection = () => {
                const { from, to } = editor.view.state.selection;
                const isSelected = from <= getPos() && to >= getPos() + node.nodeSize;
                img.classList.toggle('selected', isSelected);
            };

            // Initial selection update
            updateSelection();

            // Listen for selection updates
            editor.on('selectionUpdate', updateSelection);

            return {
                dom: img,
                update: (updatedNode) => {
                    if (updatedNode.type !== node.type) {
                        return false;
                    }

                    if (updatedNode.attrs.src !== node.attrs.src) {
                        img.src = updatedNode.attrs.src;
                    }
                    if (updatedNode.attrs.width) {
                        img.style.width = updatedNode.attrs.width;
                    }
                    if (updatedNode.attrs.height) {
                        img.style.height = updatedNode.attrs.height;
                    }

                    updateSelection();
                    return true;
                },
                selectNode: () => {
                    img.classList.add('selected');
                },
                deselectNode: () => {
                    img.classList.remove('selected');
                },
                destroy: () => {
                    editor.off('selectionUpdate', updateSelection);
                }
            };
        };
    },
});

export default UpdatedImage;
