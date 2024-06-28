import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        dimensions?: string | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type LoadingCircleProps = typeof __propDef.props;
export type LoadingCircleEvents = typeof __propDef.events;
export type LoadingCircleSlots = typeof __propDef.slots;
export default class LoadingCircle extends SvelteComponent<LoadingCircleProps, LoadingCircleEvents, LoadingCircleSlots> {
}
export {};
