import { SvelteComponent } from "svelte";
export interface BubbleMenuItem {
    name: string;
    isActive: () => boolean;
    command: () => void;
    icon: typeof BoldIcon;
}
import type { Editor } from '@tiptap/core';
import { BoldIcon } from 'lucide-svelte';
import { type BubbleMenuPluginProps } from '@tiptap/extension-bubble-menu';
declare const __propDef: {
    props: {
        editor: Editor;
        tippyOptions?: BubbleMenuPluginProps['tippyOptions'];
        pluginKey?: string | import("prosemirror-state").PluginKey<any> | undefined;
        shouldShow?: BubbleMenuPluginProps['shouldShow'];
        updateDelay?: BubbleMenuPluginProps['updateDelay'];
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type IndexProps = typeof __propDef.props;
export type IndexEvents = typeof __propDef.events;
export type IndexSlots = typeof __propDef.slots;
export default class Index extends SvelteComponent<IndexProps, IndexEvents, IndexSlots> {
}
export {};
