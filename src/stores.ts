// src/stores.ts
import { writable } from 'svelte/store';
import type { Node } from './types/collection'


  // Initialize the selectedNode store with a default value or null if no default is desired
export const selectedNodeStore = writable<Node | null>(null);
export const nodesStore = writable<Node[]>([]);

// not perfect
export const selectedNodeId = writable<number>(1);