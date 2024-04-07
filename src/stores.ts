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
export const showModal = writable(false);
export const selectedItem = writable(null);


export interface SpotifyItem {
  id: number; // Simple integer ID
  link: string; // Spotify link
  type: string; // 'playlist' or 'podcast'
}

function createSpotifyStore() {
  const { subscribe, update } = writable<Array<SpotifyItem>>([]);
  let idCounter = 1; // Start ID counter

  return {
    subscribe,
    add: (item: Omit<SpotifyItem, 'id'>) => update(items => {
      const newItem = { ...item, id: idCounter++ }; // Increment ID with each new item
      return [...items, newItem];
    }),
    remove: (id: number) => update(items => items.filter(item => item.id !== id)),
  };
}

export const spotifyItems = createSpotifyStore();