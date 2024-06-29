import { addToast } from '../../toasts.svelte';
import { supabase } from '$lib/supabaseClient';
import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view';


const uploadKey = new PluginKey('upload-image');


const UploadFilesPlugin = () => new Plugin({
    key: uploadKey,
    state: {
        init() {
            return DecorationSet.empty;
        },
        apply(tr, set) {
            set = set.map(tr.mapping, tr.doc);
            const action = tr.getMeta(this);
            if (action?.add) {
                const { id, pos, src, type, filename, size } = action.add;
                const placeholder = document.createElement('div');
                placeholder.setAttribute('class', 'file-placeholder');

                if (type.startsWith('image/')) {
                    const image = document.createElement('img');
                    image.setAttribute('class', 'opacity-40 rounded-lg border border-stone-200');
                    image.src = src;
                    placeholder.appendChild(image);
                } else {
                    const fileDiv = document.createElement('div');
                    fileDiv.setAttribute('class', 'file-container border rounded p-2');

                    const fileName = document.createElement('div');
                    fileName.innerText = filename;
                    fileDiv.appendChild(fileName);

                    const fileSize = document.createElement('div');
                    fileSize.innerText = `${(size / 1024).toFixed(2)} KB`;
                    fileDiv.appendChild(fileSize);

                    const downloadIcon = document.createElement('button');
                    downloadIcon.setAttribute('class', 'download-button');
                    downloadIcon.innerText = '⬇️';
                    downloadIcon.onclick = () => {
                        const a = document.createElement('a');
                        a.href = src;
                        a.download = filename;
                        a.click();
                    };
                    fileDiv.appendChild(downloadIcon);

                    placeholder.appendChild(fileDiv);
                }

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

export default UploadFilesPlugin;

function findPlaceholder(state, id) {
    const decos = uploadKey.getState(state);
    const found = decos.find(null, null, spec => spec.id === id);
    return found.length ? found[0].from : null;
}


export function startFileUpload(file, view, pos) {
    if (file.size / 1024 / 1024 > 20) {
      addToast({ data: { text: 'File size too big (max 20MB).', type: 'error' } });
      return;
    }
 
    const id = {};
    const tr = view.state.tr;
    if (!tr.selection.empty) tr.deleteSelection();
   
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      tr.setMeta(uploadKey, { add: { id, pos, src: reader.result, type: file.type, filename: file.name } });
      view.dispatch(tr);
    };
 
    handleFileUpload(file).then(publicUrl => {
      const pos = findPlaceholder(view.state, id);
      if (pos == null) return;
 
      const { schema } = view.state;
      let node;
 
      if (file.type.startsWith('image/')) {
        node = schema.nodes.image.create({ src: publicUrl });
      } else {
        node = schema.nodes.file.create({ src: publicUrl, filename: file.name, size: file.size });
      }
        
        
      const transaction = view.state.tr
      .replaceWith(pos, pos, node)
      .setMeta(uploadKey, { remove: { id } });
    view.dispatch(transaction);
      
    }).catch(error => {
      addToast({ data: { text: 'Error uploading file. Please try again.', type: 'error' } });
      const pos = findPlaceholder(view.state, id);
      if (pos !== null) {
        const transaction = view.state.tr
          .setMeta(uploadKey, { remove: { id } });
        view.dispatch(transaction);
      }
    });


  }




export const handleFileUpload = async (file) => {




    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images_for_editor')
        .upload(`project_1/${Date.now()}_${file.name}`, file);


    // Handle any upload errors
    if (uploadError) {
        addToast({ data: { text: 'Error uploading image. Please try again.', type: 'error' } });
        console.error(uploadError);
        throw uploadError;
    }


    const { data: publicUrlData, error: urlError } = supabase.storage
        .from('images_for_editor')
        .getPublicUrl(uploadData.path);


    // Handle any errors in retrieving the public URL
    if (urlError) {
        addToast({ data: { text: 'Unable to retrieve image URL.', type: 'error' } });
        console.error('Error generating public URL:', urlError);
        throw urlError;
    }  


    return publicUrlData.publicUrl;
};



