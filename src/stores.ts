// src/stores.ts
import { writable } from 'svelte/store';
import type { Node } from './types/collection'



  // Initialize the selectedNode store with a default value or null if no default is desired
export const selectedNodeStore = writable<Node | null>(null);

export const dbNodeStore = writable<Node[] | null>(null);
// not perfect seeting 
export const selectedNodeId = writable<number>(1);