import { SvelteComponent } from "svelte";
import type { CommandItemProps } from './slash-command.js';
declare const __propDef: {
    props: {
        items?: CommandItemProps[] | undefined;
        command: any;
        editor: any;
        range: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type CommandListProps = typeof __propDef.props;
export type CommandListEvents = typeof __propDef.events;
export type CommandListSlots = typeof __propDef.slots;
export default class CommandList extends SvelteComponent<CommandListProps, CommandListEvents, CommandListSlots> {
}
export {};
