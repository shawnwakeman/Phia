// src/stores.ts
import { writable } from 'svelte/store';
import type { Node, Issue, Blocks, TargetStates } from './types/collection'



  // Initialize the selectedNode store with a default value or null if no default is desired
export const selectedNodeStore = writable<Node | null>(null);
export const navigateNodeStore = writable<Node | null>(null);

export const nodesDataStore = writable<Node[]>([]);


export const issuesDataStore = writable<Issue[]>([]);


export const issuesSelectedItems = writable<Issue[]>([]);




export const filteredIssuesDataStore = writable<Issue[]>([]);
// not perfect seeting 
export const selectedNodeId = writable<number>(0);


export const currentSelectedIssue = writable<Issue | null>()

export const addedIssue = writable<boolean>(false)

export const sidebarWidthStore = writable<number[]>([50]);

// stores.js
export const showModal = writable(false);
export const selectedItem = writable(null);


export const initNodesDataStore = writable<Node[]>([]);

export const blocksDataStore = writable<Blocks[]>([]);

export const targetStatesStore = writable<TargetStates[]>();


export const currentBlock = writable<Blocks>();

export const isDragging = writable(false);