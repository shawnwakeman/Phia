import { SvelteComponent } from "svelte";
export interface BubbleColorMenuItem {
    name: string;
    color: string;
}
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
export type ColorSelectorProps = typeof __propDef.props;
export type ColorSelectorEvents = typeof __propDef.events;
export type ColorSelectorSlots = typeof __propDef.slots;
export default class ColorSelector extends SvelteComponent<ColorSelectorProps, ColorSelectorEvents, ColorSelectorSlots> {
}
export {};
