// src/stores.ts
import { writable } from 'svelte/store';
import type { Node, Issue, FilePath } from './types/collection'



  // Initialize the selectedNode store with a default value or null if no default is desired
export const selectedNodeStore = writable<Node | null>(null);

export const nodesDataStore = writable<Node[]>([]);

export const filePathDataStore = writable<FilePath[]>([]);

export const issuesDataStore = writable<Issue[]>([]);
// not perfect seeting 
export const selectedNodeId = writable<number>(1);


export const currentSelectedIssue = writable<Issue | null>()

export const addedIssue = writable<boolean>(false)



// stores.js

export const squares = writable([
  { id: 0, x: 1, y: 1, width: 2, height: 1 }, // x and y repsesnt top corner positions 
  { id: 1, x: 3, y: 1, width: 5, height: 1 },
  { id: 2, x: 5, y: 3, width: 2, height: 1 },
  { id: 3, x: 7, y: 4, width: 2, height: 1 },
]);



