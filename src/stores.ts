// src/stores.ts
import { writable, derived } from 'svelte/store';
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

export const sidebarWidthStore = writable<number[]>([]);

// stores.js
export const showModal = writable(false);
export const selectedItem = writable(null);


export const initNodesDataStore = writable<Node[]>([]);

export const blocksDataStore = writable<Blocks[]>([]);

export const targetStatesStore = writable<TargetStates[]>();


export const currentBlock = writable<Blocks | null>();

export const isDragging = writable(false);
export let AddDrawerOpen  = writable(false);
export const selectedIssues = writable<Issue[]>([]);// Store for selected issues


export const filteredIssuesForSnapshot = derived(
  [issuesDataStore, currentBlock],
  ([$issuesDataStore, $currentBlock]) => {
    if ($currentBlock && $currentBlock.snapshot_id) {
      console.log($issuesDataStore);
      
      const filtered = $issuesDataStore.filter(issue => issue.cycle === $currentBlock.snapshot_id);
      console.log('Filtered issues based on currentBlock.snapshot_id:', filtered, $currentBlock);
      return filtered
    } else {
      console.log("nothing set");
      
      return $issuesDataStore;
    }
  }
);

