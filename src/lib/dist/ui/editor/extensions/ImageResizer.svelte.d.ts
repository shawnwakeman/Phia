import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        editor: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ImageResizerProps = typeof __propDef.props;
export type ImageResizerEvents = typeof __propDef.events;
export type ImageResizerSlots = typeof __propDef.slots;
export default class ImageResizer extends SvelteComponent<ImageResizerProps, ImageResizerEvents, ImageResizerSlots> {
}
export {};
