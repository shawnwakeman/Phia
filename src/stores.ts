// src/stores.ts
import { writable } from 'svelte/store';
import type { Node, Issue } from './types/collection'



  // Initialize the selectedNode store with a default value or null if no default is desired
export const selectedNodeStore = writable<Node | null>(null);

export const nodesDataStore = writable<Node[]>([]);

export const issuesDataStore = writable<Issue[]>([]);
// not perfect seeting 
export const selectedNodeId = writable<number>(1);


export const currentSelectedIssue = writable<Issue>()

export const addedIssue = writable<boolean>(false)