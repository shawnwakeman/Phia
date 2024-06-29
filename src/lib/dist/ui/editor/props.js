import { startFileUpload } from './plugins/upload-images.js';
export const defaultEditorProps = {
    attributes: {
        class: `prose-lg prose-stone dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`
    },
    handleDOMEvents: {
        keydown: (_view, event) => {
            // prevent default event listeners from firing when slash command is active
            if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
                const slashCommand = document.querySelector('#slash-command');
                if (slashCommand) {
                    return true;
                }
            }
        }
    },
    handlePaste: (view, event) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files.length > 0) {
            event.preventDefault();
            const files = Array.from(event.clipboardData.files);
            let pos = view.state.selection.from;

            ensureSpaceForFiles(view, pos, files.length);
    
            files.forEach((file, index) => {
                startFileUpload(file, view, pos + index); // Adjust the position increment if needed
            });
    
            return true;
        }
        return false;
    },
    
    
    handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            event.preventDefault();
            const files = Array.from(event.dataTransfer.files);
    
            const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY
            });
            let pos = coordinates?.pos || 0;


            ensureSpaceForFiles(view, pos, files.length);
    
            files.forEach((file, index) => {
                startFileUpload(file, view, pos + index); // Adjust the position increment if needed
            });
    
            return true;
        }
        return false;
    }
    
};


function ensureSpaceForFiles(view, pos, numFiles) {
    const { tr } = view.state;
    const extraLines = "\n".repeat(numFiles); // Adjust the multiplier as needed
    tr.insertText(extraLines, pos);
    view.dispatch(tr);
}
