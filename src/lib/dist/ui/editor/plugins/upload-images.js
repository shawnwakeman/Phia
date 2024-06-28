import { addToast } from '../../toasts.svelte';
import { supabase } from '$lib/supabaseClient';
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view';

const uploadKey = new PluginKey('upload-image');

const UploadImagesPlugin = () => new Plugin({
    key: uploadKey,
    state: {
        init() {
            return DecorationSet.empty;
        },
        apply(tr, set) {
            set = set.map(tr.mapping, tr.doc);
            const action = tr.getMeta(this);
            if (action?.add) {
                const { id, pos, src } = action.add;
                const placeholder = document.createElement('div');
                placeholder.setAttribute('class', 'img-placeholder');
                const image = document.createElement('img');
                image.setAttribute('class', 'opacity-40 rounded-lg border border-stone-200');
                image.src = src;
                placeholder.appendChild(image);
                const deco = Decoration.widget(pos + 1, placeholder, { id });
                set = set.add(tr.doc, [deco]);
            } else if (action?.remove) {
                set = set.remove(set.find(null, null, spec => spec.id === action.remove.id));
            }
            return set;
        }
    },
    props: {
        decorations(state) {
            return this.getState(state);
        }
    }
});

export default UploadImagesPlugin;

function findPlaceholder(state, id) {
    const decos = uploadKey.getState(state);
    const found = decos.find(null, null, spec => spec.id === id);
    return found.length ? found[0].from : null;
}

export function startImageUpload(file, view, pos) {
    if (!file.type.includes('image/')) {
        addToast({ data: { text: 'File type not supported.', type: 'error' } });
        return;
    } else if (file.size / 1024 / 1024 > 20) {
        addToast({ data: { text: 'File size too big (max 20MB).', type: 'error' } });
        return;
    }

    const id = {};
    const tr = view.state.tr;
    if (!tr.selection.empty) tr.deleteSelection();
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        tr.setMeta(uploadKey, { add: { id, pos, src: reader.result } });
        view.dispatch(tr);
    };

    handleImageUpload(file).then(publicUrl => {
        const pos = findPlaceholder(view.state, id);
        if (pos == null) return;
        
        const { schema } = view.state;
        const node = schema.nodes.image.create({ src: publicUrl });  // Ensure src is a string
        const transaction = view.state.tr
            .replaceWith(pos, pos, node)
            .setMeta(uploadKey, { remove: { id } });
        view.dispatch(transaction);
    });
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const handleImageUpload = async (file) => {


    const generateUniqueFileName = async (fileName, attempt = 0) => {
        const name = attempt === 0 ? fileName : `${fileName.split('.').slice(0, -1).join('.')}_${attempt}.${fileName.split('.').pop()}`;
        const { data } = await supabase.storage
            .from('images_for_editor')
            .list('project_1', { search: name });
        if (data?.length) {
            return generateUniqueFileName(fileName, attempt + 1);
        }
        return name;
    };

    // Generate a unique file name
    const uniqueFileName = await generateUniqueFileName(file.name);

    // Upload the file with the unique file name
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images_for_editor')
        .upload(`project_1/${uniqueFileName}`, file);

    // Handle any upload errors
    if (uploadError) {
        addToast({ data: { text: 'Error uploading image. Please try again.', type: 'error' } });
        console.error(uploadError);
        throw uploadError;
    }
    console.log(uploadData, 1);
    
    if (uploadError) {
        addToast({ data: { text: 'Error uploading image. Please try again.', type: 'error' } });
        console.error(uploadError);
        throw uploadError;
    }


    const { data: publicUrlData, error: urlError } = supabase.storage
        .from('images_for_editor')
        .getPublicUrl(`project_1/${uniqueFileName}`);

// Handle any errors in retrieving the public URL
    if (urlError) {
        addToast({ data: { text: 'Unable to retrieve image URL.', type: 'error' } });
        console.error('Error generating public URL:', urlError);
        throw urlError;
    }
    console.log(publicUrlData, 2);

    
    
    console.log(publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
};
