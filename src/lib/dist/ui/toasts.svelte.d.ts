import { SvelteComponent } from "svelte";
type ToastData = {
    text: string;
    type: 'success' | 'warning' | 'error' | 'loading';
};
export declare const addToast: (props: import("@melt-ui/svelte").AddToastProps<ToastData>) => import("@melt-ui/svelte").Toast<ToastData>;
export declare const removeToast: (id: string) => void;
export declare const updateToast: (id: string, data: ToastData) => void;
declare const __propDef: {
    props: Record<string, never>;
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ToastsProps = typeof __propDef.props;
export type ToastsEvents = typeof __propDef.events;
export type ToastsSlots = typeof __propDef.slots;
export default class Toasts extends SvelteComponent<ToastsProps, ToastsEvents, ToastsSlots> {
}
export {};
