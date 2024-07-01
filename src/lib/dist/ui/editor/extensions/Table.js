import { Node, mergeAttributes } from '@tiptap/core';
import { SvelteNodeViewRenderer } from 'svelte-tiptap';

import CounterComponent from './Table.svelte';

export const SvelteCounterExtension = Node.create({
  name: 'svelteCounterComponent',
  group: 'block',
  atom: true,
  draggable: true,
  content: 'inline*',


  parseHTML() {
    return [{ tag: 'svelte-counter-component' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['svelte-counter-component', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return SvelteNodeViewRenderer(CounterComponent);
  },
});

export const SvelteEditableExtension = Node.create({
  name: 'SvelteEditableComponent',
  group: 'block',
  content: 'inline*',
  draggable: true,

  parseHTML() {
    return [{ tag: 'svelte-editable-component' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['svelte-editable-component', mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return SvelteNodeViewRenderer(EditableComponent);
  },
});