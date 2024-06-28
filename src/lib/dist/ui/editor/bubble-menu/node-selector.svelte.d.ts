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
export type NodeSelectorProps = typeof __propDef.props;
export type NodeSelectorEvents = typeof __propDef.events;
export type NodeSelectorSlots = typeof __propDef.slots;
export default class NodeSelector extends SvelteComponent<NodeSelectorProps, NodeSelectorEvents, NodeSelectorSlots> {
}
export {};
