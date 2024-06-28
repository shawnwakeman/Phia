import { Extension } from '@tiptap/core';
import type { SvelteComponent } from 'svelte';
export interface CommandItemProps {
    title: string;
    description: string;
    icon: SvelteComponent;
}
export declare const updateScrollView: (container: HTMLElement, item: HTMLElement) => void;
declare const SlashCommand: Extension<any, any>;
export default SlashCommand;
