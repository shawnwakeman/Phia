import { Plugin } from '@tiptap/pm/state';
import { DecorationSet, EditorView } from '@tiptap/pm/view';
declare const UploadFilesPlugin : () => Plugin<DecorationSet>;
export default UploadFilesPlugin ;
export declare function startFileUpload(file: File, view: EditorView, pos: number): void;
export declare const handleFileUpload: (file: File) => Promise<File>;
