import { SvelteComponent } from "svelte";
import '../../styles/index.css';
import '../../styles/prosemirror.css';
import '../../styles/tailwind.css';
import { Editor, Extension, type JSONContent } from '@tiptap/core';
import type { EditorProps } from '@tiptap/pm/view';
declare const __propDef: {
    props: {
        /**
             * The API route to use for the OpenAI completion API.
             * Defaults to "/api/generate".
             */ completionApi?: string | undefined;
        /**
             * Additional classes to add to the editor container.
             * Defaults to "relative min-h-[500px] w-full max-w-screen-lg border-stone-200 bg-white p-12 px-8 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:px-12 sm:shadow-lg".
             */ class?: string | undefined;
        /**
             * The default value to use for the editor.
             * Defaults to defaultEditorContent.
             */ defaultValue?: string | JSONContent | undefined;
        /**
             * A list of extensions to use for the editor, in addition to the default Novel extensions.
             * Defaults to [].
             */ extensions?: Extension<any, any>[] | undefined;
        /**
             * Props to pass to the underlying Tiptap editor, in addition to the default Novel editor props.
             * Defaults to {}.
             */ editorProps?: EditorProps<any> | undefined;
        /**
             * A callback function that is called whenever the editor is updated.
             * Defaults to () => {}.
             */ onUpdate?: ((editor?: Editor) => void | Promise<void>) | undefined;
        /**
             * A callback function that is called whenever the editor is updated, but only after the defined debounce duration.
             * Defaults to () => {}.
             */ onDebouncedUpdate?: ((editor?: Editor) => void | Promise<void>) | undefined;
        /**
             * The duration (in milliseconds) to debounce the onDebouncedUpdate callback.
             * Defaults to 750.
             */ debounceDuration?: number | undefined;
        /**
             * The key to use for storing the editor's value in local storage.
             * Defaults to "novel__content".
             */ storageKey?: string | undefined;
        /**
             * Disable local storage read/save.
             * @default false
             */ disableLocalStorage?: boolean | undefined;
        editor?: Editor | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export type IndexProps = typeof __propDef.props;
export type IndexEvents = typeof __propDef.events;
export type IndexSlots = typeof __propDef.slots;
export default class Index extends SvelteComponent<IndexProps, IndexEvents, IndexSlots> {
}
export {};
