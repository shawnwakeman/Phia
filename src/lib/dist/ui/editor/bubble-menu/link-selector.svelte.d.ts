import { SvelteComponent } from "svelte";
import type { Editor } from '@tiptap/core';
declare const __propDef: {
    props: {
        editor: Editor;
        isOpen: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type LinkSelectorProps = typeof __propDef.props;
export type LinkSelectorEvents = typeof __propDef.events;
export type LinkSelectorSlots = typeof __propDef.slots;
export default class LinkSelector extends SvelteComponent<LinkSelectorProps, LinkSelectorEvents, LinkSelectorSlots> {
}
export {};
